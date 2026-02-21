'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useGalleryMedia } from '../model/use-gallery-media'
import { MediaType } from '../model/types'

import styles from './styles.module.scss'
import { Lightbox } from './components/lightbox'
import { MasonryGallery } from './components/masonry-gallery'
import { ScrollToSectionButton } from './components/scroll-to-section-button'
import { TabButton } from './components/tab-button'

export const GallerySection = () => {
  const [activeTab, setActiveTab] = useState<MediaType>('photo')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showScrollToSectionStart, setShowScrollToSectionStart] = useState(false)
  const [isArrowHiddenInstantly, setIsArrowHiddenInstantly] = useState(false)
  const [isArrowSuppressed, setIsArrowSuppressed] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const {
    photos,
    videos,
    photosTotal,
    videosTotal,
    videoCount,
    hasMorePhotos,
    hasMoreVideos,
    isInitialLoading,
    loadPage
  } = useGalleryMedia(activeTab)

  const currentItems = useMemo(
    () => (activeTab === 'photo' ? photos : videos),
    [activeTab, photos, videos]
  )

  useEffect(() => {
    if (!loadMoreRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return
        }

        if (activeTab === 'photo' && hasMorePhotos) {
          void loadPage('photo', true)
        }

        if (activeTab === 'video' && hasMoreVideos) {
          void loadPage('video', true)
        }
      },
      { rootMargin: '500px 0px' }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [activeTab, hasMorePhotos, hasMoreVideos, loadPage])

  useEffect(() => {
    const handleVisibility = () => {
      const sectionElement = sectionRef.current

      if (!sectionElement) {
        return
      }

      const rect = sectionElement.getBoundingClientRect()

      if (isArrowSuppressed) {
        setShowScrollToSectionStart(false)

        if (rect.top >= -8) {
          setIsArrowSuppressed(false)
          setIsArrowHiddenInstantly(false)
        }

        return
      }

      const shouldShow = rect.top < -24 && rect.bottom > 120
      setShowScrollToSectionStart(shouldShow)

      if (shouldShow) {
        setIsArrowHiddenInstantly(false)
      }
    }

    handleVisibility()
    window.addEventListener('scroll', handleVisibility, { passive: true })
    window.addEventListener('resize', handleVisibility)

    return () => {
      window.removeEventListener('scroll', handleVisibility)
      window.removeEventListener('resize', handleVisibility)
    }
  }, [isArrowSuppressed])

  const handleLightboxPrev = () => {
    setLightboxIndex((previous) => (previous === null ? 0 : Math.max(previous - 1, 0)))
  }

  const handleLightboxNext = async () => {
    if (lightboxIndex === null) {
      return
    }

    if (lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
      return
    }

    if (hasMorePhotos) {
      const loaded = await loadPage('photo', true)

      if (loaded > 0) {
        setLightboxIndex((previous) => (previous === null ? 0 : previous + 1))
      }
    }
  }

  const handleScrollToSectionStart = () => {
    setIsArrowHiddenInstantly(true)
    setIsArrowSuppressed(true)
    setShowScrollToSectionStart(false)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id='gallery'
      aria-labelledby='gallery-title'
    >
      <div className={styles.container}>
        <h2 id='gallery-title' className={styles.title}>
          Галерея
        </h2>

        <div className={styles.tabs}>
          <div className={styles.tabGroup} role='tablist' aria-label='Разделы галереи'>
            <TabButton
              label={`Фото (${photosTotal || photos.length})`}
              isActive={activeTab === 'photo'}
              onClick={() => setActiveTab('photo')}
            />
            <TabButton
              label={`Видео (${videosTotal || videoCount})`}
              isActive={activeTab === 'video'}
              onClick={() => setActiveTab('video')}
            />
          </div>
        </div>

        {isInitialLoading && currentItems.length === 0 && (
          <div className={styles.sectionLoader} aria-label='loading section' />
        )}

        {!isInitialLoading && currentItems.length === 0 && (
          <p className={styles.empty}>Пока здесь нет файлов.</p>
        )}

        {currentItems.length > 0 && (
          <MasonryGallery
            items={currentItems}
            type={activeTab === 'photo' ? 'photo' : 'video'}
            onPhotoOpen={activeTab === 'photo' ? setLightboxIndex : undefined}
          />
        )}

        <div ref={loadMoreRef} />
      </div>

      <ScrollToSectionButton
        isVisible={showScrollToSectionStart}
        isInstantHidden={isArrowHiddenInstantly}
        onClick={handleScrollToSectionStart}
      />

      {activeTab === 'photo' && lightboxIndex !== null && photos.length > 0 && (
        <Lightbox
          items={photos}
          index={lightboxIndex}
          totalCount={photosTotal || photos.length}
          onClose={() => setLightboxIndex(null)}
          onPrev={handleLightboxPrev}
          onNext={handleLightboxNext}
        />
      )}
    </section>
  )
}
