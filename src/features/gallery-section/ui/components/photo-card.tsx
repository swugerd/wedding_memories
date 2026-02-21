/* eslint-disable @next/next/no-img-element */

import classNames from 'classnames'

import { GalleryMediaItem } from '../../model/types'

import styles from '../styles.module.scss'

export const PhotoCard = ({
  item,
  onOpen
}: {
  item: GalleryMediaItem
  onOpen: () => void
}) => {
  const safeRatio = Math.max(item.ratio, 0.2)
  const intrinsicWidth = 1200
  const intrinsicHeight = Math.round(intrinsicWidth / safeRatio)

  return (
    <article className={styles.masonryItem}>
      <button
        type='button'
        className={classNames(styles.mediaFrame, styles.photoFrame, styles.photoButton)}
        onClick={onOpen}
      >
        <img
          src={item.src}
          alt={item.alt}
          width={intrinsicWidth}
          height={intrinsicHeight}
          className={styles.mediaPhoto}
          loading='lazy'
          decoding='async'
        />
      </button>
    </article>
  )
}
