'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchGalleryCount, fetchGalleryMediaPage } from './api'
import { GALLERY_PAGE_SIZE } from './constants'
import { GalleryMediaItem, MediaType } from './types'

export const useGalleryMedia = (activeTab: MediaType) => {
  const [photos, setPhotos] = useState<GalleryMediaItem[]>([])
  const [videos, setVideos] = useState<GalleryMediaItem[]>([])
  const [photosTotal, setPhotosTotal] = useState(0)
  const [videosTotal, setVideosTotal] = useState(0)
  const [videoCount, setVideoCount] = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [hasRequestedVideoCount, setHasRequestedVideoCount] = useState(false)

  const photosRef = useRef<GalleryMediaItem[]>([])
  const videosRef = useRef<GalleryMediaItem[]>([])
  const loadingRef = useRef({ photo: false, video: false })

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    videosRef.current = videos
  }, [videos])

  const loadPage = useCallback(async (type: MediaType, append: boolean): Promise<number> => {
    if (loadingRef.current[type]) {
      return 0
    }

    loadingRef.current[type] = true

    if (!append) {
      setIsInitialLoading(true)
    }

    try {
      const offset = append
        ? (type === 'photo' ? photosRef.current.length : videosRef.current.length)
        : 0

      const { items, total } = await fetchGalleryMediaPage(type, offset, GALLERY_PAGE_SIZE)

      if (type === 'photo') {
        setPhotos((previous) => (append ? [...previous, ...items] : items))
        setPhotosTotal(total)
      } else {
        setVideos((previous) => (append ? [...previous, ...items] : items))
        setVideosTotal(total)
        setVideoCount(total)
      }

      return items.length
    } finally {
      loadingRef.current[type] = false

      if (!append) {
        setIsInitialLoading(false)
      }
    }
  }, [])

  const preloadVideoCount = useCallback(async () => {
    if (videoCount > 0 || hasRequestedVideoCount) {
      return
    }

    setHasRequestedVideoCount(true)
    const count = await fetchGalleryCount('video').catch(() => 0)
    setVideoCount(count)
  }, [hasRequestedVideoCount, videoCount])

  useEffect(() => {
    if (photosRef.current.length === 0) {
      void loadPage('photo', false)
    }
  }, [loadPage])

  useEffect(() => {
    if (activeTab === 'video' && videosRef.current.length === 0) {
      void loadPage('video', false)
    }
  }, [activeTab, loadPage])

  useEffect(() => {
    void preloadVideoCount()
  }, [preloadVideoCount])

  const hasMorePhotos = photos.length < photosTotal
  const hasMoreVideos = videos.length < videosTotal

  return {
    photos,
    videos,
    photosTotal,
    videosTotal,
    videoCount,
    hasMorePhotos,
    hasMoreVideos,
    isInitialLoading,
    loadPage
  }
}
