/**
 * Step 2 (error path) — Token Expired / Invalid
 * Shown when the magic link is stale or already used.
 */
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Emphasis, Color, Size } from '@/components/ui'
import styles from './TokenExpired.module.css'

type Props = {
  onRequestNewLink: () => void
}

export const TokenExpired = ({ onRequestNewLink }: Props) => (
  <FlowCard>
    <div className={styles.icon} aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="var(--components-color-background-attention)" />
        <path d="M20 12v10M20 26v2" stroke="var(--components-color-foreground-attention)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>

    <div className={styles.copy}>
      <h1 className={styles.heading}>This link has expired</h1>
      <p className={styles.body}>
        Payment links expire after 24 hours for your security. Request a new one to continue.
      </p>
    </div>

    <Button
      color={Color.Accent}
      emphasis={Emphasis.Primary}
      size={Size.Large}
      isFullWidth
      onClick={onRequestNewLink}
    >
      Send me a new link
    </Button>

    <p className={styles.footnote}>
      Need help?{' '}
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
