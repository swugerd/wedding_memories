export type MediaType = 'photo' | 'video'

export type GalleryMediaItem = {
  id: number
  src: string
  fullSrc?: string
  thumbSrc?: string
  alt: string
  ratio: number
  posterSrc?: string
}

export type GalleryMediaData = {
  photos: GalleryMediaItem[]
  videos: GalleryMediaItem[]
}
