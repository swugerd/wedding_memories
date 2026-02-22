'use client'

import { CSSProperties, useState } from 'react'
import classNames from 'classnames'

import { GalleryMediaItem } from '../../model/types'

import styles from '../styles.module.scss'

export const VideoCard = ({
  item,
  onVideoPlay,
  registerVideoRef
}: {
  item: GalleryMediaItem
  onVideoPlay?: (id: number) => void
  registerVideoRef?: (id: number, element: HTMLVideoElement | null) => void
}) => {
  const [resolvedRatio, setResolvedRatio] = useState(item.ratio > 0 ? item.ratio : 16 / 9)
  const safeRatio = resolvedRatio > 0 ? resolvedRatio : 16 / 9
  const intrinsicWidth = 1280
  const intrinsicHeight = Math.round(intrinsicWidth / safeRatio)

  return (
    <article className={styles.masonryItem}>
      <div className={classNames(styles.mediaFrame, styles.videoFrame)}>
        <div className={styles.videoBox} style={{ '--ratio': safeRatio } as CSSProperties}>
          <video
            controls
            preload='none'
            poster={item.posterSrc}
            className={styles.mediaVideo}
            playsInline
            width={intrinsicWidth}
            height={intrinsicHeight}
            onLoadedMetadata={(event) => {
              if (item.ratio > 0) {
                return
              }

              const target = event.currentTarget

              if (target.videoWidth > 0 && target.videoHeight > 0) {
                setResolvedRatio(target.videoWidth / target.videoHeight)
              }
            }}
            onPlay={() => onVideoPlay?.(item.id)}
            ref={(element) => registerVideoRef?.(item.id, element)}
          >
            <source src={item.src} type='video/mp4' />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      </div>
    </article>
  )
}
