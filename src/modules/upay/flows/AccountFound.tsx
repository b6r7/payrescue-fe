/**
 * ACCOUNT_FOUND step
 * Figma: node 10187:38254
 * "Looks like you already have an account" — shown after OTP confirmation.
 * Primary CTA advances to loan ID confirmation; secondary is non-interactive.
 */
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Color, Emphasis, Size } from '@/components/ui'
import styles from './AccountFound.module.css'

type Props = {
  onMakePayment: () => void
  /** Masked on-file phone resolved from the email-CTA loan_id, e.g. "(207) ***-2105".
   *  When absent (no loan_id in URL or backend couldn't resolve), we fall back to
   *  the original generic copy. */
  maskedPhone?: string
}

export const AccountFound = ({ onMakePayment, maskedPhone }: Props) => (
  <FlowCard>
    <div className={styles.copy}>
      <h1 className={styles.heading}>Looks like you already have an account</h1>
      <p className={styles.body}>
        Make a payment now without logging in—or access your full account by updating your phone number to {maskedPhone ?? '(xxx) xxx-7890'}.
      </p>
    </div>

    <div className={styles.actions}>
      <Button
        color={Color.Accent}
        emphasis={Emphasis.Primary}
        size={Size.Large}
        isFullWidth
        onClick={onMakePayment}
      >
        I'm here to make a payment
      </Button>

      <button type="button" className={styles.updatePhoneBtn} tabIndex={-1} aria-disabled="true">
        Update phone number
      </button>
    </div>
  </FlowCard>
)
