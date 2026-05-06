/**
 * Step 1 — Confirm your loan ID
 * Figma: node 10194:38953
 * Simple pre-filled loan ID confirmation screen.
 * Tapping Continue submits to verify-identity → routes to loan select or OTP.
 */
import { useState } from 'react'
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Banner, Color, Emphasis, Size } from '@/components/ui'
import { apiUrl } from '@/utils/apiBase'
import type { VerifyIdentityResponse, LoanItem } from '../types'
import { STEP } from '../types'
import styles from './IdentityEntry.module.css'

// Greyed placeholder shown in the input when nothing is pre-filled. Shape
// of an Affirm charge ARI (4-char alphanumeric pairs separated by a dash,
// e.g. `8DP7-6U76`), not the legacy `LN-YYYYMMDD-NNNNN` format. Display
// only — never submitted on form post.
const LOAN_ID_PLACEHOLDER_HINT = '8DP7-6U76'

type Props = {
  /** Pre-fills the Loan ID input from `?loan_id=...` URL param (email CTA path). */
  prefilledLoanId?: string
  onOTPRequired: (maskedEmail: string, sessionToken: string) => void
  onDirectToPayment: (sessionToken: string) => void
  onLoanSelect: (sessionToken: string, loans: LoanItem[]) => void
}

export const IdentityEntry = ({ prefilledLoanId = '', onOTPRequired, onDirectToPayment, onLoanSelect }: Props) => {
  // Empty default when there's no email-CTA loan_id. The placeholder hint
  // shows greyed in the input but is NOT in state — so a misclick on
  // Continue with no input typed surfaces "Please enter your Loan ID"
  // instead of submitting against a hardcoded ARI.
  const [loanId, setLoanId] = useState(prefilledLoanId || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loanId.trim()) { setError('Please enter your Loan ID'); return }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(apiUrl('/api/upay/verify-identity'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_id: loanId, method: 'loan_id_email', payer_type: 'self' }),
      })

      if (!res.ok) { setError('Something went wrong. Please try again.'); return }

      const data: VerifyIdentityResponse = await res.json()

      if (data.step === STEP.LOAN_SELECT && data.session_token && data.loans) {
        onLoanSelect(data.session_token, data.loans)
      } else if (data.step === STEP.OTP_ENTRY && data.session_token) {
        onOTPRequired(data.masked_email ?? '', data.session_token)
      } else if (data.step === STEP.PAYMENT_INITIATED && data.session_token) {
        onDirectToPayment(data.session_token)
      } else {
        setError(data.error?.message ?? "We couldn't verify your identity. Please check the details and try again.")
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FlowCard>
      <div className={styles.copy}>
        <h1 className={styles.heading}>Confirm your loan ID</h1>
        <p className={styles.subheading}>
          Find your loan ID at the bottom of your Affirm email to make a payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.fieldWrap}>
          <label htmlFor="loan-id-input" className={styles.label}>Loan ID</label>
          <input
            id="loan-id-input"
            type="text"
            className={styles.input}
            value={loanId}
            onChange={e => setLoanId(e.target.value)}
            placeholder={LOAN_ID_PLACEHOLDER_HINT}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-label="Loan ID"
          />
        </div>

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
  )
}
