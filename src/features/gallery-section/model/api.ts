import { GalleryMediaItem, MediaType } from './types'

type MediaResponse = {
  items?: GalleryMediaItem[]
  total?: number
  hasMore?: boolean
}

export const fetchGalleryMediaPage = async (
  type: MediaType,
  offset: number,
  limit: number
) => {
  const response = await fetch(
    `/api/gallery-media?type=${type}&offset=${offset}&limit=${limit}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    return { items: [] as GalleryMediaItem[], total: 0, hasMore: false }
  }

  const data = (await response.json()) as MediaResponse

  return {
    items: data.items ?? [],
    total: data.total ?? 0,
    hasMore: data.hasMore ?? false
  }
}

export const fetchGalleryCount = async (type: MediaType) => {
  const response = await fetch(`/api/gallery-media?type=${type}&mode=count`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return 0
  }

  const data = (await response.json()) as { count?: number }
  return data.count ?? 0
}
