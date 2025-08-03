'use client'

import Image from 'next/image'
import classNames from 'classnames'

import { motion } from 'framer-motion'

import PreviewImage from '@/public/img/preview.webp'

import { PREVIEW_IMAGE_ANIMATION, TITLE_ANIMATION } from '../model'

import styles from './styles.module.scss'

export const PreviewSection = () => {
  return (
    <section className='bg-black-secondary relative h-screen transition-opacity'>
      <motion.div className='h-screen w-screen' {...PREVIEW_IMAGE_ANIMATION}>
        <Image
          src={PreviewImage}
          alt='preview-photo'
          className={classNames('object-cover', {
            [styles.image]: true
          })}
        />
      </motion.div>

      <div className='bg-black-secondary absolute top-0 right-0 bottom-0 left-0' />

      <motion.h1
        className={classNames('absolute bottom-[40px] left-[75px] text-7xl', {
          [styles.title]: true
        })}
        {...TITLE_ANIMATION}
      >
        Екатерина и Дмитрий
      </motion.h1>
    </section>
  )
}
