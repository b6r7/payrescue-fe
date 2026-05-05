/**
 * Generic Error — catch-all for API failures, locked accounts, etc.
 */
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Color, Emphasis, Size } from '@/components/ui'
import styles from './TokenExpired.module.css'

type Props = {
  message?: string
  onRetry?: () => void
}

export const GenericError = ({
  message = 'Something went wrong. Please try again or contact support.',
  onRetry,
}: Props) => (
  <FlowCard>
    <div className={styles.icon} aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="var(--components-color-background-critical)" />
        <path d="M14 14l12 12M26 14L14 26" stroke="var(--components-color-foreground-critical)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>

    <div className={styles.copy}>
      <h1 className={styles.heading}>Something went wrong</h1>
      <p className={styles.body}>{message}</p>
    </div>

    {onRetry && (
      <Button
        color={Color.Accent}
        emphasis={Emphasis.Primary}
        size={Size.Large}
        isFullWidth
        onClick={onRetry}
      >
        Try again
      </Button>
    )}

    <p className={styles.footnote}>
      <a
        href="https://affirm.com/help"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Contact support
      </a>
    </p>
  </FlowCard>
)
