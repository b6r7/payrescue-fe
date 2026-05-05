/**
 * Lo-fi wrapper matching @affirm/components-core PinInput API.
 * Ref: components-core/src/inputs/components/PinInput
 *
 * 6-digit OTP input with auto-advance between cells.
 */
import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react'
import styles from './PinInput.module.css'

type Props = {
  length?: number
  value?: string
  onChange?: (value: string) => void
  isDisabled?: boolean
  error?: string | boolean
  ariaLabel?: string
  autoFocus?: boolean
}

export const PinInput = ({
  length = 6,
  value = '',
  onChange,
  isDisabled = false,
  error,
  ariaLabel = 'Verification code',
  autoFocus = false,
}: Props) => {
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleChange = (index: number, char: string) => {
    const sanitized = char.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? sanitized : d)).join('')
    onChange?.(next)
    if (sanitized && index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const next = digits.map((d, i) => (i === index - 1 ? '' : d)).join('')
        onChange?.(next)
        refs.current[index - 1]?.focus()
      } else {
        const next = digits.map((d, i) => (i === index ? '' : d)).join('')
        onChange?.(next)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus()
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange?.(pasted.padEnd(length, '').slice(0, length).replace(/\s/g, ''))
    const nextFocusIndex = Math.min(pasted.length, length - 1)
    refs.current[nextFocusIndex]?.focus()
  }

  const hasError = Boolean(error)

  return (
    <div className={styles.wrapper}>
      <div className={styles.cells} role="group" aria-label={ariaLabel}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { refs.current[index] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={isDisabled}
            autoFocus={autoFocus && index === 0}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={[
              styles.cell,
              hasError ? styles['cell--error'] : '',
              digit ? styles['cell--filled'] : '',
              focusedIndex === index ? styles['cell--focused'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
          />
        ))}
      </div>
      {hasError && typeof error === 'string' && (
        <span className={styles.error} role="alert">{error}</span>
      )}
    </div>
  )
}
