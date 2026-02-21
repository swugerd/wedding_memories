import classNames from 'classnames'

import styles from '../styles.module.scss'

export const TabButton = ({
  label,
  isActive,
  onClick
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) => {
  return (
    <button
      type='button'
      className={classNames('bg-transparent', styles.tabButton)}
      data-active={isActive}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
