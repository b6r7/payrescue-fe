/**
 * PhoneModal — two-step overlay for adding a phone number
 *   Step 1: enter  → phone number input
 *   Step 2: verify → 6-digit OTP
 *
 * Desktop-first: centered modal with motion-animated backdrop + panel.
 * Step transitions use a horizontal slide via AnimatePresence mode="wait".
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TextInput } from '../../../components/ui/TextInput'
import { PinInput } from '../../../components/ui/PinInput'
import { Button } from '../../../components/ui/Button'
import { Color, Emphasis, Size } from '../../../components/ui/Button'
import styles from './PhoneModal.module.css'

type Step = 'enter' | 'verify'

type Props = {
  onSuccess: () => void
  onClose: () => void
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const stepVariants = {
  enter: { opacity: 0, x: 28 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="6" y="2" width="16" height="24" rx="3" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="14" cy="22" r="1.2" fill="currentColor"/>
    <path d="M10.5 6h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <motion.path
      d="M5 11.5l4 4.5 8-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
    />
  </svg>
)

/* ─── Format phone display (for OTP subtitle) ───────── */
const maskPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 3) return raw
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`
}

/* ─── Component ──────────────────────────────────────── */

export const PhoneModal = ({ onSuccess, onClose }: Props) => {
  const [step, setStep] = useState<Step>('enter')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  const handleSendCode = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setPhoneError('Please enter a valid phone number')
      return
    }
    setPhoneError(null)
    setIsLoading(true)
    await fetch('/api/upay/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits }),
    }).catch(() => null)
    setIsLoading(false)
    setStep('verify')
  }

  const handleVerify = async () => {
    if (otp.length < 6) {
      setOtpError('Please enter the 6-digit code')
      return
    }
    setOtpError(null)
    setIsLoading(true)
    await fetch('/api/upay/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ''), otp }),
    }).catch(() => null)
    setIsLoading(false)
    onSuccess()
  }

  const handleResend = async () => {
    setResent(true)
    setOtp('')
    await fetch('/api/upay/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
    }).catch(() => null)
    setTimeout(() => setResent(false), 4000)
  }

  const handlePhoneKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendCode()
  }

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-label={step === 'enter' ? 'Add your phone number' : 'Verify your phone'}
    >
      <motion.div
        className={styles.panel}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {/* Close button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {/* Step content */}
        <AnimatePresence mode="wait" initial={false}>
          {step === 'enter' ? (
            <motion.div
              key="enter"
              className={styles.stepContent}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: EASE }}
            >
              <div className={styles.iconRing}>
                <PhoneIcon />
              </div>

              <div className={styles.copy}>
                <h2 className={styles.title}>Add your phone number</h2>
                <p className={styles.subtitle}>
                  We'll send a one-time verification code by SMS. Standard rates may apply.
                </p>
              </div>

              <TextInput
                label="Mobile number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(v) => { setPhone(v); setPhoneError(null) }}
                error={phoneError ?? undefined}
                autoFocus
                autoComplete="tel"
                onKeyDown={handlePhoneKey}
              />

              <Button
                color={Color.Accent}
                emphasis={Emphasis.Primary}
                size={Size.Large}
                isFullWidth
                isLoading={isLoading}
                onClick={handleSendCode}
                type="button"
              >
                Send code
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              className={styles.stepContent}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: EASE }}
            >
              <div className={styles.iconRing}>
                <CheckIcon />
              </div>

              <div className={styles.copy}>
                <h2 className={styles.title}>Verify your phone</h2>
                <p className={styles.subtitle}>
                  We sent a 6-digit code to{' '}
                  <strong className={styles.phoneDisplay}>{maskPhone(phone)}</strong>.
                  {' '}
                  <button
                    type="button"
                    className={styles.changeLink}
                    onClick={() => { setStep('enter'); setOtp('') }}
                  >
                    Change
                  </button>
                </p>
              </div>

              <PinInput
                length={6}
                value={otp}
                onChange={(v) => { setOtp(v); setOtpError(null) }}
                error={otpError ?? undefined}
                autoFocus
              />

              {otpError && (
                <p className={styles.fieldError} role="alert">{otpError}</p>
              )}

              <Button
                color={Color.Accent}
                emphasis={Emphasis.Primary}
                size={Size.Large}
                isFullWidth
                isLoading={isLoading}
                isDisabled={otp.length < 6}
                onClick={handleVerify}
                type="button"
              >
                Confirm
              </Button>

              <div className={styles.resendRow}>
                <AnimatePresence mode="wait">
                  {resent ? (
                    <motion.span
                      key="sent"
                      className={styles.resentMsg}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Code resent ✓
                    </motion.span>
                  ) : (
                    <motion.button
                      key="resend"
                      type="button"
                      className={styles.resendBtn}
                      onClick={handleResend}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Didn't get it? Resend code
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
