/**
 * PORTAL_PLACEHOLDER step
 *
 * Shown when the phone the user typed on AffirmSignIn matches the on-file
 * phone for the user resolved from the email-CTA `loan_id`. In a real
 * deployment this branch hands off to the actual Affirm signin flow
 * (`affirm.com/user/signin` → user portal, deep-linked to the loan from
 * the email URL). For the rescue demo we render a simple stand-in so the
 * flow doesn't dead-end.
 */
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Color, Emphasis, Size } from '@/components/ui'
import styles from './TokenExpired.module.css'

type Props = {
  onContinueAsRescue: () => void
  onRestart: () => void
}

export const PortalPlaceholder = ({ onContinueAsRescue, onRestart }: Props) => (
  <FlowCard>
    <div className={styles.copy}>
      <h1 className={styles.heading}>You'd be signed in</h1>
      <p className={styles.body}>
        In the real flow, this number is on file with your Affirm account, so you'd be sent to your account portal—right at the loan from your email. For this demo we don't wire the portal, so we'll keep going with the rescue flow instead.
      </p>
    </div>

    <Button
      color={Color.Accent}
      emphasis={Emphasis.Primary}
      size={Size.Large}
      isFullWidth
      onClick={onContinueAsRescue}
    >
      Continue with rescue flow
    </Button>

    <button type="button" className={styles.link} onClick={onRestart}>
      Use a different phone number
    </button>
  </FlowCard>
)
