/**
 * Lo-fi wrapper matching @affirm/components-core Button API.
 * Swap import path when wiring into web-ux.
 *
 * Ref: components-core/src/button/components/types.ts
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'
import styles from './Button.module.css'

export enum Color {
  Accent = 'accent',
  Critical = 'critical',
  Neutral = 'neutral',
  NeutralReversed = 'neutralReversed',
}

export enum Emphasis {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

export enum Size {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: Color
  emphasis?: Emphasis
  size?: Size
  isLoading?: boolean
  isDisabled?: boolean
  isFullWidth?: boolean
  children: ReactNode
}

export const Button = ({
  color = Color.Accent,
  emphasis = Emphasis.Primary,
  size = Size.Large,
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  children,
  className,
  ...rest
}: Props) => {
  const classes = [
    styles.button,
    styles[`button--${color}`],
    styles[`button--${emphasis}`],
    styles[`button--${size}`],
    isFullWidth ? styles['button--full-width'] : '',
    isDisabled || isLoading ? styles['button--disabled'] : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      className={classes}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading}
      whileTap={isDisabled || isLoading ? {} : { scale: 0.97 }}
      whileHover={isDisabled || isLoading ? {} : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        children
      )}
    </motion.button>
  )
}
