/**
 * Step 0 — Affirm Sign-In
 * Replicates affirm.com/user/signin. After tapping Continue an OTP dialog
 * appears as an overlay; entering any 6-digit code advances to the rescue flow.
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import styles from './AffirmSignIn.module.css'

type Props = {
  onGetStarted: (phone: string) => void
}

const AffirmLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="78" height="39" fill="none" aria-label="Affirm" color="#060809">
    <path fill="currentColor" d="M32.998 21.488h-2.84V20.39c0-1.44.833-1.856 1.552-1.856.796 0 1.401.341 1.401.341l.947-2.196s-.984-.644-2.764-.644c-2.007 0-4.279 1.136-4.279 4.657v.796H22.32V20.39c0-1.44.833-1.856 1.553-1.856.416 0 .946.076 1.4.341l.947-2.196c-.568-.34-1.514-.644-2.764-.644-2.007 0-4.279 1.136-4.279 4.657v.796H17.36v2.423h1.817v8.481h3.105v-8.481h4.771v8.481h3.105v-8.481h2.84zM40.571 21.488v10.904h3.105V27.13c0-2.499 1.515-3.218 2.575-3.218.416 0 .984.113 1.325.378l.568-2.877a4 4 0 0 0-1.401-.265c-1.59 0-2.613.72-3.294 2.158v-1.817z"/>
    <path fill="currentColor" fillRule="evenodd" d="M11.302 21.185c-1.78 0-3.862.833-4.998 1.741l1.022 2.159c.909-.833 2.348-1.515 3.673-1.515 1.25 0 1.931.417 1.931 1.25 0 .568-.454.833-1.325.946-3.219.417-5.755 1.288-5.755 3.787 0 1.969 1.4 3.18 3.597 3.18 1.552 0 2.953-.87 3.635-2.007v1.666h2.915v-7.118c0-2.916-2.044-4.09-4.695-4.09m-1.098 9.239c-.833 0-1.212-.417-1.212-1.06 0-1.25 1.363-1.667 3.9-1.932 0 1.666-1.136 2.992-2.688 2.992" clipRule="evenodd"/>
    <path fill="currentColor" d="M59.125 23.116c.643-.947 1.855-1.931 3.521-1.931 2.007 0 3.635 1.211 3.597 3.673v7.534h-3.105v-6.55c0-1.439-.87-2.045-1.704-2.045-1.022 0-2.044.947-2.044 2.992v5.603h-3.105V25.88c0-1.515-.795-2.083-1.704-2.083-.985 0-2.045.985-2.045 2.992v5.603h-3.105V21.488h2.992v1.666c.53-1.06 1.666-1.97 3.332-1.97 1.514 0 2.764.72 3.37 1.932M34.854 21.488h3.105v10.904h-3.105z"/>
    <path fill="#4a4af4" d="M53.028 6.266c-8.406 0-15.94 5.83-18.061 13.366h3.067c1.78-5.604 7.838-10.527 14.994-10.527 8.747 0 16.282 6.665 16.282 17.001 0 2.31-.303 4.43-.871 6.286h2.953l.038-.114c.492-1.893.72-3.976.72-6.172 0-11.51-8.407-19.84-19.122-19.84"/>
  </svg>
)


const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" stroke="#121319" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="none" aria-hidden="true" viewBox="0 0 20 20">
    <path fill="#0c0c14" fillRule="evenodd" d="M10 2.292a7.708 7.708 0 1 0 0 15.416 7.708 7.708 0 0 0 0-15.416M1.042 10a8.958 8.958 0 1 1 17.917 0 8.958 8.958 0 0 1-17.917 0m7.847 1.458c-.882 0-1.597.715-1.597 1.597 0 .269.218.486.486.486h4.445a.486.486 0 0 0 .486-.486c0-.882-.715-1.597-1.598-1.597zm-2.847 1.597a2.847 2.847 0 0 1 2.847-2.847h2.222a2.847 2.847 0 0 1 2.848 2.847c0 .96-.778 1.736-1.736 1.736H7.778a1.736 1.736 0 0 1-1.736-1.736m2.917-6.388a1.042 1.042 0 1 1 2.083 0 1.042 1.042 0 0 1-2.083 0M10 4.375a2.292 2.292 0 1 0 0 4.583 2.292 2.292 0 0 0 0-4.583" clipRule="evenodd"/>
  </svg>
)


export const AffirmSignIn = ({ onGetStarted }: Props) => {
  const [phone, setPhone] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const otpInputRef = useRef<HTMLInputElement>(null)

  const maskedPhone = phone.replace(/\D/g, '').length >= 10
    ? `(${phone.replace(/\D/g,'').slice(0,3)}) ${phone.replace(/\D/g,'').slice(3,6)}-${phone.replace(/\D/g,'').slice(6,10)}`
    : phone

  const handleContinue = () => {
    if (phone.replace(/\D/g, '').length > 0) {
      setOtp('')
      setShowOtp(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleContinue()
  }

  const handleCloseOtp = () => setShowOtp(false)

  const handleOtpChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6)
    setOtp(digits)
    if (digits.length === 6) {
      setTimeout(() => {
        setShowOtp(false)
        onGetStarted(phone)
      }, 180)
    }
  }

  useEffect(() => {
    if (showOtp) setTimeout(() => otpInputRef.current?.focus(), 80)
  }, [showOtp])

  return (
    <div className={styles.root}>
      {/* ── OTP dialog overlay ───────────────────────────── */}
      <AnimatePresence>
        {showOtp && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={handleCloseOtp}
            aria-label="Close dialog"
          >
            <motion.div
              className={styles.otpDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="otp-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close row */}
              <div className={styles.otpCloseRow}>
                <button type="button" className={styles.modalClose} onClick={handleCloseOtp} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              {/* Heading */}
              <h2 id="otp-title" className={styles.otpHeading}>We just texted you</h2>

              {/* Body */}
              <p className={styles.otpBody}>
                Enter the verification code we just sent to{' '}
                <span className={styles.otpPhone}>{maskedPhone}</span>.
              </p>

              {/* Hidden real input + visual digit display */}
              <div className={styles.otpFieldWrap} onClick={() => otpInputRef.current?.focus()}>
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={e => handleOtpChange(e.target.value)}
                  className={styles.otpHiddenInput}
                  aria-label="Verification code"
                />
                <span className={styles.otpCursor} aria-hidden="true" />
                <span className={styles.otpDigits} aria-hidden="true">
                  {otp.padEnd(6, '0').split('').map((d, i) => (
                    <span key={i} className={i < otp.length ? styles.otpDigitFilled : styles.otpDigitEmpty}>{d}</span>
                  ))}
                </span>
              </div>

              {/* Footer */}
              <div className={styles.otpFooter}>
                <button type="button" className={styles.otpResend} onClick={() => setOtp('')}>
                  Didn't get a code?
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top bar */}
      <header className={styles.topBar}>
        <AffirmLogo />
      </header>

      <main className={styles.main}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.avatar}>
            <PersonIcon />
          </div>

          <h1 className={styles.heading}>Log in</h1>

          {/* Live phone input */}
          <div className={styles.phoneField}>
            <label htmlFor="signin-phone" className={styles.phoneLabel}>Mobile number</label>
            <input
              id="signin-phone"
              type="tel"
              className={styles.phoneInput}
              placeholder="(800) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              aria-label="Mobile number"
              aria-invalid={false}
            />
          </div>

          <p className={styles.smsNote}>
            We'll send you a verification code via SMS. Message and data rates may apply.
          </p>

          <div className={styles.btnGroup}>
            <button
              type="button"
              className={styles.continueBtn}
              tabIndex={0}
              aria-label="Continue"
              disabled={phone.replace(/\D/g, '').length === 0}
              onClick={handleContinue}
            >
              Continue
            </button>

            <button
              type="button"
              className={styles.updatePhoneBtn}
              tabIndex={-1}
              aria-disabled="true"
            >
              Update my phone number
            </button>

          </div>

          <p className={styles.disclaimer}>
            By continuing, I agree to Affirm's{' '}
            <a href="#" className={styles.disclaimerLink} onClick={e => e.preventDefault()} tabIndex={0}>
              Terms of Service
            </a>{' '}
            and authorize Affirm to obtain, use, and share consumer reports about me. See our{' '}
            <a href="#" className={styles.disclaimerLink} onClick={e => e.preventDefault()} tabIndex={0}>
              Privacy Policy
            </a>{' '}
            to learn more about our privacy practices.
          </p>

        </motion.div>
      </main>
    </div>
  )
}
