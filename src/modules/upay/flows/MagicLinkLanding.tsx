/**
 * Step 1 — Magic Link Landing
 * User arrives via email CTA. We validate the token, then advance to VERIFICATION_FORM or TOKEN_EXPIRED.
 */
import { useEffect } from 'react'
import { FlowCard } from '@/components/layout/FlowCard'
import styles from './MagicLinkLanding.module.css'

type Props = {
  token: string
  recipientEmail?: string
  onValidated: (loanId: string, maskedEmail: string) => void
  onExpired: () => void
}

export const MagicLinkLanding = ({ token, recipientEmail = '', onValidated, onExpired }: Props) => {
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch('/api/upay/magic-link/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: recipientEmail }),
        })
        const data = await res.json()

        if (data.step === 'TOKEN_EXPIRED') {
          onExpired()
        } else {
          onValidated(data.loan_id ?? '', data.masked_email ?? '')
        }
      } catch {
        onExpired()
      }
    }

    void validate()
  }, [token, onValidated, onExpired])

  return (
    <FlowCard>
      <div className={styles.content}>
        <div className={styles.spinner} aria-label="Verifying your link…" role="status">
          <div className={styles.ring} />
        </div>
        <p className={styles.label}>Verifying your link…</p>
      </div>
    </FlowCard>
  )
}
