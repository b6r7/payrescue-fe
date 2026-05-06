/**
 * Step 3 — Identity Verification
 *
 * Two security-reviewed paths:
 *   A — Email + Loan ID  → email OTP step
 *   B — SSN9 + DOB + ZIP → direct to payment (no OTP)
 *
 * Third-party payers use Loan ID + DOB only (no email/SSN access).
 */
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, TextInput, Banner, Color, Emphasis, Size } from '@/components/ui'
import { DatePickerSheet } from './DatePickerSheet'
import type { PayerType, VerifyIdentityResponse, LoanItem } from '../types'
import { STEP } from '../types'
import styles from './VerificationForm.module.css'

type VerificationPath = 'email_loan_id' | 'ssn_dob_zip'

type Props = {
  prefilledLoanId?: string
  onOTPRequired: (maskedEmail: string, sessionToken: string) => void
  onDirectToPayment: (sessionToken: string) => void
  onLoanSelect: (sessionToken: string, loans: LoanItem[]) => void
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

export const VerificationForm = ({
  prefilledLoanId = '',
  onOTPRequired,
  onDirectToPayment,
  onLoanSelect,
}: Props) => {
  const isMobile = useIsMobile()
  const helpAnchorRef = useRef<HTMLDivElement>(null)

  const [path, setPath] = useState<VerificationPath>('email_loan_id')
  const [payerType, _setPayerType] = useState<PayerType>('self')
  const isThirdParty = payerType === 'third_party'

  // Path A fields
  const [email, setEmail] = useState('')
  const [loanId, setLoanId] = useState(prefilledLoanId)

  // Path B fields
  const [ssn9, setSsn9] = useState('')
  const [dob, setDob] = useState('')
  const [zip, setZip] = useState('')

  // Third-party DOB (separate state so it doesn't clobber path B's DOB)
  const [thirdPartyDob, setThirdPartyDob] = useState('')
  const [thirdPartyLoanId, setThirdPartyLoanId] = useState(prefilledLoanId)

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

  const handleSwitchPath = (next: VerificationPath) => {
    setPath(next)
    setError(null)
  }


  const validate = (): string | null => {
    if (isThirdParty) {
      if (!thirdPartyLoanId.trim()) return "Please enter the account holder's Loan ID"
      if (!thirdPartyDob.trim()) return "Please enter the account holder's date of birth"
      return null
    }
    if (path === 'email_loan_id') {
      if (!email.trim()) return 'Please enter your email address'
      return null
    }
    // ssn_dob_zip
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
      const body = isThirdParty
        ? { loan_id: thirdPartyLoanId, method: 'loan_id_dob', payer_type: 'third_party', dob: thirdPartyDob }
        : path === 'email_loan_id'
          ? { loan_id: loanId, method: 'loan_id_email', payer_type: 'self', email }
          : { method: 'ssn_dob_zip', payer_type: 'self', ssn9: ssn9.replace(/\D/g, ''), dob, zip }

      const res = await fetch('/api/upay/verify-identity', {
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
      } else if (data.step === STEP.LOAN_SELECT && data.session_token && data.loans) {
        onLoanSelect(data.session_token, data.loans)
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

  const heading = 'Enter your information'
  const subheading = 'We need some more information to securely pull up your plan.'

  // ── Loan ID help trigger (shared between path A and third-party) ──────────
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
                <p className={styles.loanIdHelpTitle}>Check your emails from Affirm</p>
                <p className={styles.loanIdHelpBody}>
                  You can find your Loan ID at the bottom of Affirm emails.
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
          <h1 className={styles.heading}>{heading}</h1>
          <p className={styles.subheading}>{subheading}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* ── THIRD-PARTY PATH ──────────────────────────────── */}
          {isThirdParty && (
            <>
              <div className={styles.loanIdGroup}>
                <TextInput
                  label="Account holder's Loan ID"
                  labelRight={LoanIdHelpTrigger}
                  placeholder="e.g. LN-20250428-00042"
                  value={thirdPartyLoanId}
                  onChange={setThirdPartyLoanId}
                  isRequired
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
              <TextInput
                label="Account holder's date of birth"
                type="text"
                placeholder="MM/DD/YYYY"
                value={thirdPartyDob}
                onChange={v => setThirdPartyDob(formatDob(v))}
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
            </>
          )}

          {/* ── SELF PATH A: Email + Loan ID ──────────────────── */}
          {!isThirdParty && path === 'email_loan_id' && (
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
                  onClick={() => handleSwitchPath('ssn_dob_zip')}
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
                  placeholder="e.g. LN-20250428-00042"
                  value={loanId}
                  onChange={setLoanId}
                  isOptional
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
            </>
          )}

          {/* ── SELF PATH B: SSN9 + DOB + ZIP ────────────────── */}
          {!isThirdParty && path === 'ssn_dob_zip' && (
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
                  onClick={() => handleSwitchPath('email_loan_id')}
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
                  placeholder="e.g. 94103"
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
          value={isThirdParty ? thirdPartyDob : dob}
          onSave={(formatted) => {
            if (isThirdParty) setThirdPartyDob(formatted)
            else setDob(formatted)
            setShowDatePicker(false)
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Mobile bottom drawer — rendered via portal so it escapes transformed motion ancestors */}
      {isMobile && createPortal(
        <AnimatePresence>
          {showLoanIdHelp && (
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
                  <h3 className={styles.helpSheetTitle}>Where to find your Loan ID</h3>
                  <button
                    type="button"
                    className={styles.helpSheetClose}
                    onClick={() => setShowLoanIdHelp(false)}
                    aria-label="Close"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <div className={styles.helpSheetBody}>
                  {/* Card row 1 */}
                  <div className={styles.helpCard}>
                    <div className={styles.helpCardIconWrap} aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.5 5.833A1.667 1.667 0 0 1 4.167 4.167h11.666A1.667 1.667 0 0 1 17.5 5.833v8.334a1.667 1.667 0 0 1-1.667 1.666H4.167A1.667 1.667 0 0 1 2.5 14.167V5.833Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                        <path d="M2.5 7.5l7.5 4.167L17.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.helpCardText}>
                      <p className={styles.helpCardTitle}>Check your emails from Affirm</p>
                      <p className={styles.helpCardBody}>
                        You can find your Loan ID at the bottom of Affirm emails.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

// ── Shared icon ───────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M8.75 1a.75.75 0 0 0-1.5 0v.367c-.89.095-1.636.273-2.314.619a6.75 6.75 0 0 0-2.95 2.95c-.39.765-.566 1.615-.652 2.662-.084 1.031-.084 2.317-.084 3.968v.868c0 1.651 0 2.937.084 3.968.086 1.047.262 1.897.652 2.662a6.75 6.75 0 0 0 2.95 2.95c.765.39 1.615.566 2.662.652 1.031.084 2.317.084 3.968.084h.868c1.652 0 2.937 0 3.968-.084 1.047-.086 1.897-.262 2.662-.652a6.75 6.75 0 0 0 2.95-2.95c.39-.765.566-1.615.652-2.662.084-1.031.084-2.317.084-3.968v-.868c0-1.651 0-2.937-.084-3.968-.086-1.047-.262-1.897-.652-2.662a6.75 6.75 0 0 0-2.95-2.95c-.678-.346-1.424-.524-2.314-.62V1a.75.75 0 0 0-1.5 0v.274c-.801-.024-1.73-.024-2.816-.024h-.868c-1.087 0-2.015 0-2.816.024zm6.5 3V2.775a98 98 0 0 0-2.85-.025h-.8c-1.142 0-2.07 0-2.85.025V4a.75.75 0 0 1-1.5 0V2.877c-.7.086-1.205.227-1.633.445a5.25 5.25 0 0 0-2.295 2.295c-.264.518-.415 1.15-.493 2.103-.078.963-.079 2.187-.079 3.88v.8c0 1.692 0 2.917.08 3.88.077.954.228 1.585.492 2.103a5.25 5.25 0 0 0 2.295 2.295c.518.264 1.15.415 2.103.493.963.078 2.187.079 3.88.079h.8c1.692 0 2.917 0 3.88-.08.954-.077 1.585-.228 2.103-.492a5.25 5.25 0 0 0 2.295-2.295c.264-.518.415-1.15.493-2.103.078-.963.079-2.188.079-3.88v-.8c0-1.693 0-2.917-.08-3.88-.077-.954-.228-1.585-.492-2.103a5.25 5.25 0 0 0-2.295-2.295c-.428-.218-.933-.359-1.633-.445V4a.75.75 0 0 1-1.5 0M7 7.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/>
  </svg>
)
