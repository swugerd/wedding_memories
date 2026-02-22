'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import classNames from 'classnames'

import { GalleryMediaItem } from '../../model/types'

import styles from '../styles.module.scss'

export const Lightbox = ({
  items,
  index,
  totalCount,
  onClose,
  onPrev,
  onNext
}: {
  items: GalleryMediaItem[]
  index: number
  totalCount: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [isSwipeLocked, setIsSwipeLocked] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const currentItem = items[index]
  const currentImageSrc = currentItem?.fullSrc ?? currentItem?.src
  const isImageLoaded = loadedSrc === currentImageSrc

  useEffect(() => {
    const scrollY = window.scrollY
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key === 'ArrowLeft') {
        onPrev()
      }

      if (event.key === 'ArrowRight') {
        void onNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, onNext, onPrev])

  if (!currentItem) {
    return null
  }

  return (
    <div className={styles.lightbox} role='dialog' aria-modal='true' aria-label='Просмотр фото'>
      <button type='button' className={styles.lightboxBackdrop} onClick={onClose} />

      <div
        className={styles.lightboxContent}
        onClick={(event) => {
          const target = event.target as HTMLElement

          if (
            target.closest(`.${styles.lightboxMedia}`) ||
            target.closest(`.${styles.lightboxClose}`) ||
            target.closest(`.${styles.lightboxNavLeft}`) ||
            target.closest(`.${styles.lightboxNavRight}`)
          ) {
            return
          }

          onClose()
        }}
        onTouchStart={(event) => {
          if (event.touches.length !== 1) {
            setIsSwipeLocked(true)
            setTouchStartX(null)
            setTouchStartY(null)
            return
          }

          setIsSwipeLocked(false)
          setTouchStartX(event.touches[0].clientX)
          setTouchStartY(event.touches[0].clientY)
        }}
        onTouchMove={(event) => {
          if (event.touches.length > 1) {
            setIsSwipeLocked(true)
          }
        }}
        onTouchEnd={(event) => {
          if (isSwipeLocked || touchStartX === null || touchStartY === null) {
            setTouchStartX(null)
            setTouchStartY(null)
            setIsSwipeLocked(false)
            return
          }

          const deltaX = event.changedTouches[0].clientX - touchStartX
          const deltaY = event.changedTouches[0].clientY - touchStartY
          setTouchStartX(null)
          setTouchStartY(null)

          if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 90) {
            onClose()
            return
          }

          if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
            onPrev()
          } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
            void onNext()
          }
        }}
      >
        <button
          type='button'
          className={styles.lightboxClose}
          onClick={onClose}
          aria-label='Закрыть'
        >
          ×
        </button>

        <button type='button' className={styles.lightboxNavLeft} onClick={onPrev}>
          <span className={styles.lightboxNavIcon}>‹</span>
        </button>

        <div
          className={classNames(styles.lightboxMedia, {
            [styles.lightboxMediaLoading]: !isImageLoaded
          })}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type='button'
            className={styles.lightboxTapZoneLeft}
            onClick={onPrev}
            aria-label='Предыдущее фото'
          />
          <button
            type='button'
            className={styles.lightboxTapZoneRight}
            onClick={() => void onNext()}
            aria-label='Следующее фото'
          />

          {!isImageLoaded && <div className={styles.lightboxSpinner} />}
          <img
            key={currentImageSrc}
            src={currentImageSrc}
            alt={currentItem.alt}
            className={styles.lightboxImage}
            onClick={(event) => event.stopPropagation()}
            onLoad={() => {
              setLoadedSrc(currentImageSrc)
            }}
            onError={() => {
              setLoadedSrc(null)
            }}
            style={{
              opacity: isImageLoaded ? 1 : 0,
              visibility: isImageLoaded ? 'visible' : 'hidden'
            }}
          />
        </div>

        <button type='button' className={styles.lightboxNavRight} onClick={() => void onNext()}>
          <span className={styles.lightboxNavIcon}>›</span>
        </button>

        <p className={styles.lightboxCounter}>
          {index + 1} / {totalCount}
        </p>
      </div>
    </div>
  )
}
