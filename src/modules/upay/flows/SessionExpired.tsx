/**
 * Session Expired — shown when the ephemeral session token times out during payment.
 */
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Color, Emphasis, Size } from '@/components/ui'
import styles from './TokenExpired.module.css'

type Props = {
  onRestart: () => void
}

export const SessionExpired = ({ onRestart }: Props) => (
  <FlowCard>
    <div className={styles.icon} aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="var(--components-color-background-tertiary)" />
        <path d="M20 12v8l4 4" stroke="var(--components-color-foreground-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="10" stroke="var(--components-color-foreground-secondary)" strokeWidth="2"/>
      </svg>
    </div>

    <div className={styles.copy}>
      <h1 className={styles.heading}>Your session timed out</h1>
      <p className={styles.body}>
        For your security, payment sessions expire after 15 minutes of inactivity.
        Please start over to make your payment.
      </p>
    </div>

    <Button
      color={Color.Accent}
      emphasis={Emphasis.Primary}
      size={Size.Large}
      isFullWidth
      onClick={onRestart}
    >
      Start over
    </Button>
  </FlowCard>
)
