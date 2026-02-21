import { GalleryMediaData, GalleryMediaItem } from './types'

const PHOTO_RATIOS = [1, 0.75, 1.2, 0.66, 1.4, 0.9, 0.82]
const VIDEO_RATIOS = [16 / 9, 9 / 16, 4 / 5, 1, 3 / 4]
const YANDEX_PUBLIC_API_URL = 'https://cloud-api.yandex.net/v1/disk/public/resources'
const YANDEX_LIMIT = 1000
const LOCAL_PHOTO_COUNT = 158
const LOCAL_VIDEO_COUNT = 19
const MEDIA_CACHE_TTL_MS = 5 * 60 * 1000

let cachedGalleryMedia: GalleryMediaData | null = null
let cachedAt = 0
let pendingRequest: Promise<GalleryMediaData> | null = null

const setCachedMedia = (media: GalleryMediaData) => {
  cachedGalleryMedia = media
  cachedAt = Date.now()
  return media
}

const buildSequentialFiles = (count: number, extension: '.webp' | '.mp4') => {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1

    return {
      fileName: `${id}${extension}`,
      id
    }
  })
}

const mapToMediaItems = (
  files: Array<{
    fileName: string
    id: number
    src?: string
    ratio?: number
    posterSrc?: string
  }>,
  basePath: '/img' | '/video' | null,
  type: 'photo' | 'video'
): GalleryMediaItem[] => {
  const ratios = type === 'photo' ? PHOTO_RATIOS : VIDEO_RATIOS

  return files.map(({ fileName, id, src, ratio, posterSrc }, index) => ({
    id,
    src: basePath ? `${basePath}/${fileName}` : src ?? '',
    alt: type === 'photo' ? `Свадебное фото ${id}` : `Свадебное видео ${id}`,
    ratio: ratio && Number.isFinite(ratio) && ratio > 0 ? ratio : ratios[index % ratios.length],
    posterSrc
  }))
}

type YandexEmbeddedItem = {
  name: string
  file?: string
  preview?: string
  type: 'file' | 'dir'
  width?: number
  height?: number
}

type YandexPublicResponse = {
  _embedded?: {
    items?: YandexEmbeddedItem[]
    total?: number
  }
}

const toProxyUrl = (url: string) => `/api/yandex-file?url=${encodeURIComponent(url)}`

const listYandexPublicFiles = async (
  publicKey: string,
  folderPath: string,
  extension: '.webp' | '.mp4'
) => {
  const searchParams = new URLSearchParams({
    public_key: publicKey,
    path: folderPath,
    limit: String(YANDEX_LIMIT),
    offset: '0'
  })

  const response = await fetch(`${YANDEX_PUBLIC_API_URL}?${searchParams.toString()}`, {
    next: { revalidate: 300 }
  }).catch(() => null)

  if (!response || !response.ok) {
    return []
  }

  const data = (await response.json()) as YandexPublicResponse
  const items = data._embedded?.items ?? []

  return items
    .filter((item) => item.type === 'file' && item.name.endsWith(extension))
    .map((item) => {
      const id = Number.parseInt(item.name.replace(extension, ''), 10)

      return {
        fileName: item.name,
        id,
        src: item.file ? toProxyUrl(item.file) : '',
        posterSrc: extension === '.mp4' && item.preview ? toProxyUrl(item.preview) : undefined,
        ratio:
          item.width && item.height && item.height > 0
            ? item.width / item.height
            : undefined
      }
    })
    .filter((item) => Number.isFinite(item.id) && item.src.length > 0)
    .sort((left, right) => left.id - right.id)
}

const getLocalGalleryMedia = async (): Promise<GalleryMediaData> => {
  const sortedPhotos = buildSequentialFiles(LOCAL_PHOTO_COUNT, '.webp')
  const sortedVideos = buildSequentialFiles(LOCAL_VIDEO_COUNT, '.mp4')

  return {
    photos: mapToMediaItems(sortedPhotos, '/img', 'photo').filter((item) => item.src),
    videos: mapToMediaItems(sortedVideos, '/video', 'video').filter((item) => item.src)
  }
}

export const getGalleryMedia = async (): Promise<GalleryMediaData> => {
  const now = Date.now()

  if (cachedGalleryMedia && now - cachedAt < MEDIA_CACHE_TTL_MS) {
    return cachedGalleryMedia
  }

  if (pendingRequest) {
    return pendingRequest
  }

  pendingRequest = (async () => {
    const photosPublicKey = process.env.YANDEX_DISK_PHOTOS_PUBLIC_KEY
    const videosPublicKey = process.env.YANDEX_DISK_VIDEOS_PUBLIC_KEY
    const photosPublicPath = process.env.YANDEX_DISK_PHOTOS_PATH ?? '/'
    const videosPublicPath = process.env.YANDEX_DISK_VIDEOS_PATH ?? '/'

    if (!photosPublicKey || !videosPublicKey) {
      return setCachedMedia(await getLocalGalleryMedia())
    }

    const [remotePhotos, remoteVideos] = await Promise.all([
      listYandexPublicFiles(photosPublicKey, photosPublicPath, '.webp'),
      listYandexPublicFiles(videosPublicKey, videosPublicPath, '.mp4')
    ])

    if (remotePhotos.length === 0 && remoteVideos.length === 0) {
      return setCachedMedia(await getLocalGalleryMedia())
    }

    return setCachedMedia({
      photos: mapToMediaItems(remotePhotos, null, 'photo').filter((item) => item.src),
      videos: mapToMediaItems(remoteVideos, null, 'video').filter((item) => item.src)
    })
  })()

  try {
    return await pendingRequest
  } finally {
    pendingRequest = null
  }
}
