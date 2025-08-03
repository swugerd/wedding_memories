import { HTMLMotionProps } from 'framer-motion'

export const PREVIEW_IMAGE_ANIMATION: HTMLMotionProps<'div'> = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.5 }
}

export const TITLE_ANIMATION: HTMLMotionProps<'h1'> = {
  initial: { opacity: 0, transform: 'translateY(0)' },
  animate: { opacity: 1, transform: 'translateY(-20px)' },
  transition: { duration: 1, delay: 0.5 }
}
