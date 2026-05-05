/**
 * Lo-fi wrapper matching @affirm/components-core Banner API.
 */
import type { ReactNode } from 'react'
import styles from './Banner.module.css'

export type BannerVariant = 'attention' | 'critical' | 'positive' | 'default'

type Props = {
  variant?: BannerVariant
  children: ReactNode
  className?: string
}

export const Banner = ({ variant = 'default', children, className }: Props) => (
  <div
    className={[styles.banner, styles[`banner--${variant}`], className].filter(Boolean).join(' ')}
    role={variant === 'critical' ? 'alert' : 'status'}
  >
    {children}
  </div>
)
