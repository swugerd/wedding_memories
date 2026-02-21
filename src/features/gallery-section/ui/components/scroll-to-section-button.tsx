import classNames from 'classnames'

import styles from '../styles.module.scss'

export const ScrollToSectionButton = ({
  isVisible,
  isInstantHidden,
  onClick
}: {
  isVisible: boolean
  isInstantHidden: boolean
  onClick: () => void
}) => {
  return (
    <button
      type='button'
      className={classNames(styles.scrollToSectionButton, {
        [styles.scrollToSectionButtonVisible]: isVisible,
        [styles.scrollToSectionButtonInstantHide]: isInstantHidden
      })}
      aria-label='В начало галереи'
      onClick={onClick}
    >
      ↑
    </button>
  )
}
