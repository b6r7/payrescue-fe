/**
 * Lo-fi wrapper matching @affirm/components-core TextInput API.
 * Ref: components-core/src/inputs/components/TextInput/index.tsx
 */
import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './TextInput.module.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'onFocus'> & {
  label?: string
  /** Element rendered to the right of the label (e.g. a help trigger) */
  labelRight?: ReactNode
  /** Renders a muted "(optional)" suffix after the label text */
  isOptional?: boolean
  ariaLabel?: string
  error?: string | boolean
  message?: string
  isDisabled?: boolean
  isRequired?: boolean
  /** Element rendered inside the input on the right (e.g. icon button) */
  rightElement?: ReactNode
  onChange?: (value: string) => void
  onBlur?: (event: React.SyntheticEvent) => void
  onFocus?: (event: React.SyntheticEvent) => void
}

export const TextInput = ({
  label,
  labelRight,
  isOptional = false,
  ariaLabel,
  error,
  message,
  isDisabled = false,
  isRequired = false,
  rightElement,
  onChange,
  onBlur,
  onFocus,
  className,
  id,
  ...rest
}: Props) => {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`
  const errorId = `${inputId}-error`
  const hasError = Boolean(error)

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <div className={labelRight ? styles.labelRow : undefined}>
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {isOptional && <span className={styles.optionalTag}>(optional)</span>}
          </label>
          {labelRight}
        </div>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          className={[
            styles.input,
            hasError ? styles['input--error'] : '',
            rightElement ? styles['input--has-right'] : '',
          ].filter(Boolean).join(' ')}
          disabled={isDisabled}
          aria-required={isRequired}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          aria-label={!label ? ariaLabel : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          {...rest}
        />
        {rightElement && (
          <div className={styles.rightElement}>{rightElement}</div>
        )}
      </div>
      {hasError && typeof error === 'string' && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {message && !hasError && (
        <span className={styles.message}>{message}</span>
      )}
    </div>
  )
}
