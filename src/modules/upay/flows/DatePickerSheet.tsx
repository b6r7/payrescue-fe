/**
 * Custom DOB date picker bottom sheet.
 * Matches Affirm's calendar design: Mon-first week, navy selected state,
 * gray overflow tiles, "Save this date" CTA.
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Color, Emphasis, Size } from '@/components/ui'
import styles from './DatePickerSheet.module.css'

type Props = {
  value: string           // '' or 'MM/DD/YYYY'
  maxYear?: number        // defaults to current year (DOB can't be in the future)
  onSave: (formatted: string) => void
  onClose: () => void
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Parse 'MM/DD/YYYY' → Date or null
const parseValue = (v: string): Date | null => {
  const parts = v.split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts.map(Number)
  if (!m || !d || !y || y < 1900) return null
  return new Date(y, m - 1, d)
}

// Build a 7-column calendar grid for the given month.
// Returns cells: { date, isOverflow }[]
const buildGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()

  // 0=Sun→6, 1=Mon→0 ... make Monday = column 0
  const startCol = (firstDay.getDay() + 6) % 7

  const cells: Array<{ date: Date; isOverflow: boolean }> = []

  // Leading overflow from prev month
  for (let i = startCol - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, -i), isOverflow: true })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month - 1, d), isOverflow: false })
  }

  // Trailing overflow to fill last row
  const trailing = 7 - (cells.length % 7)
  if (trailing < 7) {
    for (let d = 1; d <= trailing; d++) {
      cells.push({ date: new Date(year, month, d), isOverflow: true })
    }
  }

  return cells
}

const fmt2 = (n: number) => String(n).padStart(2, '0')

export const DatePickerSheet = ({ value, maxYear, onSave, onClose }: Props) => {
  const today = new Date()
  const cap = maxYear ?? today.getFullYear()

  const parsed = parseValue(value)
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed)
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState((parsed?.getMonth() ?? today.getMonth()) + 1)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const goToPrevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }

  const goToNextMonth = () => {
    const isAtCap = viewYear === cap && viewMonth === today.getMonth() + 1
    if (isAtCap) return
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  const isAtMaxMonth = viewYear === cap && viewMonth >= today.getMonth() + 1

  const handleSave = () => {
    if (!selectedDate) return
    const m = fmt2(selectedDate.getMonth() + 1)
    const d = fmt2(selectedDate.getDate())
    const y = selectedDate.getFullYear()
    onSave(`${m}/${d}/${y}`)
  }

  const isSelected = (date: Date) =>
    selectedDate !== null &&
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate()

  const isFuture = (date: Date) => date > today

  const cells = buildGrid(viewYear, viewMonth)

  return (
    <AnimatePresence>
    <motion.div
      className={styles.backdrop}
      onClick={handleClose}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        className={styles.sheet}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Date of birth picker"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
      >
        {/* Drag handle */}
        <div className={styles.handle} aria-hidden="true" />

        {/* Header row */}
        <div className={styles.header}>
          <h2 className={styles.title}>Enter your date of birth</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close date picker"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Month navigation */}
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <span className={styles.monthLabel}>
            {MONTH_LONG[viewMonth - 1]} {viewYear}
          </span>

          <button
            type="button"
            className={[styles.navBtn, isAtMaxMonth ? styles['navBtn--disabled'] : ''].join(' ')}
            onClick={goToNextMonth}
            aria-label="Next month"
            aria-disabled={isAtMaxMonth}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className={styles.dayHeaders}>
          {DAY_HEADERS.map(d => (
            <span key={d} className={styles.dayHeader}>{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={styles.calGrid}>
          {cells.map((cell, idx) => {
            const future = isFuture(cell.date)
            const sel = isSelected(cell.date)
            const disabled = cell.isOverflow || future

            return (
              <button
                key={idx}
                type="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={
                  disabled
                    ? undefined
                    : `${cell.date.getDate()} ${MONTHS[cell.date.getMonth()]} ${cell.date.getFullYear()}${sel ? ', selected' : ''}`
                }
                aria-pressed={sel || undefined}
                aria-disabled={disabled || undefined}
                className={[
                  styles.dayCell,
                  cell.isOverflow ? styles['dayCell--overflow'] : '',
                  future && !cell.isOverflow ? styles['dayCell--future'] : '',
                  sel ? styles['dayCell--selected'] : '',
                ].filter(Boolean).join(' ')}
                onClick={() => !disabled && setSelectedDate(cell.date)}
              >
                {cell.date.getDate()}
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div className={styles.footer}>
          <Button
            color={Color.Accent}
            emphasis={Emphasis.Primary}
            size={Size.Large}
            isFullWidth
            isDisabled={!selectedDate}
            onClick={handleSave}
          >
            Save this date
          </Button>
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  )
}
