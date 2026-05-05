/**
 * Step 1 — Identity Entry (new default landing)
 *
 * A single form with two identifier pairs the user can toggle between:
 *
 *   Pair 1 (default): Email + Loan ID  → email OTP step
 *   Pair 2 (alt):     SSN9 + DOB + ZIP → direct to payment (no OTP)
 *
 * Replaces the previous magic-link landing flow as the entry point.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, TextInput, Banner, Color, Emphasis, Size } from '@/components/ui'
import { DatePickerSheet } from './DatePickerSheet'
import { apiUrl } from '@/utils/apiBase'
import type { VerifyIdentityResponse } from '../types'
import { STEP } from '../types'
import styles from './VerificationForm.module.css'

type Mode = 'email' | 'ssn'

type Props = {
  onOTPRequired: (maskedEmail: string, sessionToken: string) => void
  onDirectToPayment: (sessionToken: string) => void
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 639px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

const formatSsn9 = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length > 5) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return digits
}

const formatDob = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

export const IdentityEntry = ({ onOTPRequired, onDirectToPayment }: Props) => {
  const isMobile = useIsMobile()
  const helpAnchorRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<Mode>('email')

  // Pair 1
  const [email, setEmail] = useState('')
  const [loanId, setLoanId] = useState('')

  // Pair 2
  const [ssn9, setSsn9] = useState('')
  const [dob, setDob] = useState('')
  const [zip, setZip] = useState('')

  const [showLoanIdHelp, setShowLoanIdHelp] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close tooltip on outside click (desktop)
  useEffect(() => {
    if (!showLoanIdHelp || isMobile) return
    const handler = (e: MouseEvent) => {
      if (!helpAnchorRef.current?.contains(e.target as Node)) setShowLoanIdHelp(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showLoanIdHelp, isMobile])

  const handleSwitchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const validate = (): string | null => {
    if (mode === 'email') {
      if (!email.trim()) return 'Please enter your email address'
      if (!loanId.trim()) return 'Please enter your Loan ID'
      return null
    }
    if (ssn9.replace(/\D/g, '').length < 9) return 'Please enter your full 9-digit Social Security Number'
    if (!dob.trim()) return 'Please enter your date of birth'
    if (zip.length < 5) return 'Please enter your 5-digit ZIP code'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setIsLoading(true)
    setError(null)

    try {
      const body = mode === 'email'
        ? { loan_id: loanId, method: 'loan_id_email', payer_type: 'self', email }
        : { method: 'ssn_dob_zip', payer_type: 'self', ssn9: ssn9.replace(/\D/g, ''), dob, zip }

      const res = await fetch(apiUrl('/api/upay/verify-identity'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('[verify-identity] HTTP error:', res.status, text)
        setError('Something went wrong. Please try again.')
        return
      }

      const data: VerifyIdentityResponse = await res.json()

      if (data.step === STEP.OTP_ENTRY && data.session_token) {
        onOTPRequired(data.masked_email ?? email, data.session_token)
      } else if (data.step === STEP.PAYMENT_INITIATED && data.session_token) {
        onDirectToPayment(data.session_token)
      } else {
        setError(data.error?.message ?? "We couldn't verify your identity. Please check the details and try again.")
      }
    } catch (err) {
      console.error('[verify-identity] Unexpected error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Loan ID help trigger ────────────────────────────────────────────────
  const LoanIdHelpTrigger = (
    <div className={styles.helpAnchor} ref={helpAnchorRef}>
      <button
        type="button"
        className={styles.loanIdHelpTrigger}
        onClick={() => setShowLoanIdHelp(v => !v)}
        aria-expanded={showLoanIdHelp}
        aria-haspopup={isMobile ? 'dialog' : 'true'}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 9.5V7m0-2.5h.007" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Where do I find this?
      </button>

      {/* Desktop tooltip */}
      <AnimatePresence>
        {showLoanIdHelp && !isMobile && (
          <motion.div
            className={styles.loanIdTooltip}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.loanIdHelpRow}>
              <span className={styles.loanIdHelpIcon} aria-hidden="true">✉️</span>
              <div>
                <p className={styles.loanIdHelpTitle}>Check your Affirm confirmation email</p>
                <p className={styles.loanIdHelpBody}>
                  Your Loan ID is in the subject line or body of any Affirm payment or plan email.
                  It looks like <code className={styles.loanIdCode}>LN-20250101-00042</code>.
                </p>
              </div>
            </div>
            <div className={styles.loanIdHelpRow}>
              <span className={styles.loanIdHelpIcon} aria-hidden="true">🔍</span>
              <div>
                <p className={styles.loanIdHelpBody}>
                  Can't find it? Search for <strong>"Payment due"</strong> from <strong>no-reply@affirm.com</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      <FlowCard>
        <div className={styles.copy}>
          <h1 className={styles.heading}>Enter your information</h1>
          <p className={styles.subheading}>We need some more information to securely pull up your plan.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* ── PAIR 1: Email + Loan ID ─────────────────────────── */}
          {mode === 'email' && (
            <>
              <div>
                <TextInput
                  label="Email address on your Affirm account"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                  isRequired
                  autoComplete="email"
                />
                <button
                  type="button"
                  className={styles.pathToggleTrigger}
                  onClick={() => handleSwitchMode('ssn')}
                  tabIndex={0}
                  aria-label="I can't get into my email — switch to Social Security Number verification"
                >
                  I can't get into my email
                </button>
              </div>

              <div className={styles.loanIdGroup}>
                <TextInput
                  label="Loan ID"
                  labelRight={LoanIdHelpTrigger}
                  placeholder="LN-20250428-00042"
                  value={loanId}
                  onChange={setLoanId}
                  isRequired
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
            </>
          )}

          {/* ── PAIR 2: SSN9 + DOB + ZIP ────────────────────────── */}
          {mode === 'ssn' && (
            <>
              <div>
                <TextInput
                  label="Social Security Number"
                  type="password"
                  placeholder="XXX-XX-XXXX"
                  value={ssn9}
                  onChange={v => setSsn9(formatSsn9(v))}
                  isRequired
                  inputMode="numeric"
                  autoComplete="off"
                  message="Your full 9-digit SSN — used only to verify your identity"
                />
                <button
                  type="button"
                  className={styles.pathToggleTrigger}
                  onClick={() => handleSwitchMode('email')}
                  tabIndex={0}
                  aria-label="Use my email instead"
                >
                  Use my email instead
                </button>
              </div>

              <div className={styles.dobZipRow}>
                <TextInput
                  label="Date of birth"
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={dob}
                  onChange={v => setDob(formatDob(v))}
                  isRequired
                  autoComplete="bday"
                  inputMode="numeric"
                  maxLength={10}
                  rightElement={
                    <button
                      type="button"
                      aria-label="Open date picker"
                      className={styles.calendarBtn}
                      onClick={() => setShowDatePicker(true)}
                    >
                      <CalendarIcon />
                    </button>
                  }
                />
                <TextInput
                  label="ZIP code"
                  type="text"
                  placeholder="94103"
                  value={zip}
                  onChange={v => setZip(v.replace(/\D/g, '').slice(0, 5))}
                  isRequired
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={5}
                />
              </div>
            </>
          )}

          {error && <Banner variant="critical">{error}</Banner>}

          <Button
            color={Color.Accent}
            emphasis={Emphasis.Primary}
            size={Size.Large}
            isFullWidth
            isLoading={isLoading}
            type="submit"
          >
            Continue
          </Button>

        </form>
      </FlowCard>

      {showDatePicker && (
        <DatePickerSheet
          value={dob}
          onSave={(formatted) => {
            setDob(formatted)
            setShowDatePicker(false)
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Mobile bottom drawer for Loan ID help */}
      <AnimatePresence>
        {showLoanIdHelp && isMobile && (
          <motion.div
            className={styles.helpBackdrop}
            onClick={() => setShowLoanIdHelp(false)}
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className={styles.helpSheet}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Where to find your Loan ID"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
            >
              <div className={styles.helpSheetHandle} aria-hidden="true" />
              <div className={styles.helpSheetHeader}>
                <h3 className={styles.helpSheetTitle}>Where do I find my Loan ID?</h3>
                <button
                  type="button"
                  className={styles.helpSheetClose}
                  onClick={() => setShowLoanIdHelp(false)}
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className={styles.helpSheetBody}>
                <div className={styles.loanIdHelpRow}>
                  <span className={styles.loanIdHelpIcon} aria-hidden="true">✉️</span>
                  <div>
                    <p className={styles.loanIdHelpTitle}>Check your Affirm confirmation email</p>
                    <p className={styles.loanIdHelpBody}>
                      Your Loan ID is in the subject line or body of any Affirm payment or plan email.
                      It looks like <code className={styles.loanIdCode}>LN-20250101-00042</code>.
                    </p>
                  </div>
                </div>
                <div className={styles.loanIdHelpRow}>
                  <span className={styles.loanIdHelpIcon} aria-hidden="true">🔍</span>
                  <div>
                    <p className={styles.loanIdHelpBody}>
                      Can't find it? Search your inbox for <strong>"Your Affirm plan"</strong> or <strong>"Payment due"</strong> from <strong>no-reply@affirm.com</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Shared icon ───────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M7.292.833a.625.625 0 0 0-1.25 0v.306C5.3.897 4.635 1.06 4.04 1.36a5.625 5.625 0 0 0-2.458 2.458c-.325.638-.472 1.346-.543 2.219C.964 6.899.964 7.93.964 9.307v.723c0 1.377 0 2.448.07 3.27.07.873.218 1.581.543 2.219a5.625 5.625 0 0 0 2.458 2.458c.638.325 1.346.472 2.219.543.822.07 1.853.07 3.23.07h.723c1.377 0 2.448 0 3.27-.07.873-.07 1.581-.218 2.219-.543a5.625 5.625 0 0 0 2.458-2.458c.325-.638.472-1.346.543-2.219.07-.822.07-1.893.07-3.27v-.723c0-1.377 0-2.448-.07-3.27-.07-.873-.218-1.581-.543-2.219A5.625 5.625 0 0 0 15.676 1.36c-.595-.3-1.26-.463-2.002-.521V.833a.625.625 0 0 0-1.25 0v.228a82 82 0 0 0-2.375-.02h-.723a82 82 0 0 0-2.375.02zm5.416 2.5V3.333a.625.625 0 0 1-1.25 0V2.314a64 64 0 0 0-2.291-.022h-.667c-.781 0-1.502 0-2.125.018v1.023a.625.625 0 0 1-1.25 0V2.395c-.533.072-.924.19-1.244.356a4.375 4.375 0 0 0-1.913 1.913c-.22.432-.346.962-.41 1.753C2.19 7.198 2.19 8.24 2.19 9.667v.666c0 1.41 0 2.43.066 3.233.064.791.19 1.321.41 1.753a4.375 4.375 0 0 0 1.913 1.912c.432.22.962.346 1.753.41.803.066 1.823.067 3.233.067h.667c1.41 0 2.43 0 3.233-.066.791-.064 1.321-.19 1.753-.41a4.375 4.375 0 0 0 1.912-1.913c.22-.432.346-.962.41-1.753.066-.803.067-1.823.067-3.233v-.666c0-1.41 0-2.43-.066-3.233-.064-.791-.19-1.321-.41-1.753a4.375 4.375 0 0 0-1.912-1.913c-.32-.166-.711-.284-1.245-.356M5.833 6.042a.625.625 0 0 0 0 1.25h8.334a.625.625 0 0 0 0-1.25zM7.5 10.833a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0m-.833 4.167a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667m4.166-1.25a.833.833 0 1 1-1.666 0 .833.833 0 0 1 1.666 0m2.5 1.25a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667m-2.5-4.167a.833.833 0 1 1-1.666 0 .833.833 0 0 1 1.666 0m2.5.833a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666" clipRule="evenodd"/>
  </svg>
)
