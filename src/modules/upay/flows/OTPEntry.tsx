/**
 * Step 4 — OTP Verification (email path only)
 * 6-digit code sent to masked email. Test code: 123456.
 */
import { useState } from 'react'
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, PinInput, Banner, Color, Emphasis, Size } from '@/components/ui'
import type { OTPVerifyResponse } from '../types'
import { STEP } from '../types'
import styles from './OTPEntry.module.css'

type Props = {
  maskedEmail: string
  sessionToken: string
  onVerified: (sessionToken: string) => void
  onBack: () => void
}

export const OTPEntry = ({ maskedEmail, sessionToken, onVerified, onBack }: Props) => {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleVerify = async () => {
    if (code.length < 6) { setError('Please enter all 6 digits'); return }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/upay/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: code, session_token: sessionToken }),
      })

      const data: OTPVerifyResponse = await res.json()

      if (data.step === STEP.PAYMENT_INITIATED && data.session_token) {
        onVerified(data.session_token)
      } else {
        setError(data.error?.message ?? 'Invalid code. Please try again.')
        setCode('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendStatus('sending')
    setError(null)
    await new Promise((r) => setTimeout(r, 800))
    setResendStatus('sent')
    setTimeout(() => setResendStatus('idle'), 4000)
  }

  return (
    <FlowCard onBack={onBack}>
      <div className={styles.copy}>
        <h1 className={styles.heading}>Check your email</h1>
        <p className={styles.subheading}>
          We sent a 6-digit code to <strong>{maskedEmail}</strong>.
          Enter it below to continue.
        </p>
      </div>

      <div className={styles.pinWrapper}>
        <PinInput
          value={code}
          onChange={(v) => { setCode(v); setError(null) }}
          isDisabled={isLoading}
          error={error ?? undefined}
          autoFocus
        />
      </div>

      {resendStatus === 'sent' && (
        <Banner variant="positive">A new code has been sent to your email.</Banner>
      )}

      <Button
        color={Color.Accent}
        emphasis={Emphasis.Primary}
        size={Size.Large}
        isFullWidth
        isLoading={isLoading}
        isDisabled={code.length < 6}
        onClick={handleVerify}
      >
        Verify
      </Button>

      <div className={styles.actions}>
        <button
          className={styles.textAction}
          onClick={handleResend}
          disabled={resendStatus !== 'idle'}
          type="button"
        >
          {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Code sent!' : "Didn't get a code? Resend"}
        </button>
      </div>
    </FlowCard>
  )
}
