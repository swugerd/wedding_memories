'use client'

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { GalleryMediaItem } from '../../model/types'

import styles from '../styles.module.scss'
import { PhotoCard } from './photo-card'
import { VideoCard } from './video-card'

const getColumnCount = (width: number) => {
  if (width >= 1360) {
    return 4
  }

  if (width >= 1024) {
    return 3
  }

  if (width >= 640) {
    return 2
  }

  return 1
}

export const MasonryGallery = ({
  items,
  type,
  onPhotoOpen
}: {
  items: GalleryMediaItem[]
  type: 'photo' | 'video'
  onPhotoOpen?: (index: number) => void
}) => {
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(getColumnCount(window.innerWidth))
    }

    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)

    return () => {
      window.removeEventListener('resize', updateColumnCount)
    }
  }, [])

  const handleVideoPlay = useCallback((activeId: number) => {
    videoRefs.current.forEach((videoElement, id) => {
      if (id === activeId) {
        return
      }

      videoElement.pause()
      videoElement.currentTime = 0
    })
  }, [])

  const registerVideoRef = useCallback((id: number, element: HTMLVideoElement | null) => {
    if (!element) {
      videoRefs.current.delete(id)
      return
    }

    videoRefs.current.set(id, element)
  }, [])

  const columns = useMemo(() => {
    const prepared = Array.from({ length: columnCount }, () => [] as Array<{
      item: GalleryMediaItem
      index: number
    }>)

    items.forEach((item, index) => {
      prepared[index % columnCount].push({ item, index })
    })

    return prepared
  }, [columnCount, items])

  return (
    <div
      className={styles.masonry}
      style={{ '--masonry-columns': columnCount } as CSSProperties}
    >
      {columns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className={styles.masonryColumn}>
          {column.map(({ item, index }) =>
            type === 'photo' ? (
              <PhotoCard
                key={`photo-${item.id}`}
                item={item}
                onOpen={() => onPhotoOpen?.(index)}
              />
            ) : (
              <VideoCard
                key={`video-${item.id}`}
                item={item}
                onVideoPlay={handleVideoPlay}
                registerVideoRef={registerVideoRef}
              />
            )
          )}
        </div>
      ))}
    </div>
  )
}
