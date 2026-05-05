import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { sendMagicLink } from '@/utils/sendMagicLink'
import styles from './DemoSender.module.css'

type State =
  | { phase: 'idle' }
  | { phase: 'sending' }
  | { phase: 'sent'; email: string; magicLinkUrl: string; emailSent: boolean; emailError?: string }

const AffirmLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="78" height="39" fill="none" aria-label="Affirm">
    <path fill="currentColor" d="M32.998 21.488h-2.84V20.39c0-1.44.833-1.856 1.552-1.856.796 0 1.401.341 1.401.341l.947-2.196s-.984-.644-2.764-.644c-2.007 0-4.279 1.136-4.279 4.657v.796H22.32V20.39c0-1.44.833-1.856 1.553-1.856.416 0 .946.076 1.4.341l.947-2.196c-.568-.34-1.514-.644-2.764-.644-2.007 0-4.279 1.136-4.279 4.657v.796H17.36v2.423h1.817v8.481h3.105v-8.481h4.771v8.481h3.105v-8.481h2.84zM40.571 21.488v10.904h3.105V27.13c0-2.499 1.515-3.218 2.575-3.218.416 0 .984.113 1.325.378l.568-2.877a4 4 0 0 0-1.401-.265c-1.59 0-2.613.72-3.294 2.158v-1.817z"/>
    <path fill="currentColor" fillRule="evenodd" d="M11.302 21.185c-1.78 0-3.862.833-4.998 1.741l1.022 2.159c.909-.833 2.348-1.515 3.673-1.515 1.25 0 1.931.417 1.931 1.25 0 .568-.454.833-1.325.946-3.219.417-5.755 1.288-5.755 3.787 0 1.969 1.4 3.18 3.597 3.18 1.552 0 2.953-.87 3.635-2.007v1.666h2.915v-7.118c0-2.916-2.044-4.09-4.695-4.09m-1.098 9.239c-.833 0-1.212-.417-1.212-1.06 0-1.25 1.363-1.667 3.9-1.932 0 1.666-1.136 2.992-2.688 2.992" clipRule="evenodd"/>
    <path fill="currentColor" d="M59.125 23.116c.643-.947 1.855-1.931 3.521-1.931 2.007 0 3.635 1.211 3.597 3.673v7.534h-3.105v-6.55c0-1.439-.87-2.045-1.704-2.045-1.022 0-2.044.947-2.044 2.992v5.603h-3.105V25.88c0-1.515-.795-2.083-1.704-2.083-.985 0-2.045.985-2.045 2.992v5.603h-3.105V21.488h2.992v1.666c.53-1.06 1.666-1.97 3.332-1.97 1.514 0 2.764.72 3.37 1.932M34.854 21.488h3.105v10.904h-3.105z"/>
    <path fill="#4a4af4" d="M53.028 6.266c-8.406 0-15.94 5.83-18.061 13.366h3.067c1.78-5.604 7.838-10.527 14.994-10.527 8.747 0 16.282 6.665 16.282 17.001 0 2.31-.303 4.43-.871 6.286h2.953l.038-.114c.492-1.893.72-3.976.72-6.172 0-11.51-8.407-19.84-19.122-19.84"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

export const DemoSender = () => {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ phase: 'idle' })
  const [copied, setCopied] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSend = async () => {
    if (!isValidEmail || state.phase === 'sending') return
    setState({ phase: 'sending' })

    const result = await sendMagicLink(email)
    setState({
      phase: 'sent',
      email,
      magicLinkUrl: result.magicLinkUrl,
      emailSent: result.emailSent,
      emailError: result.error,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setEmail('')
    setState({ phase: 'idle' })
  }

  return (
    <div className={styles.root}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden="true" />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <AffirmLogo />
          </div>
          <div className={styles.badge}>Demo mode</div>
        </div>

        <AnimatePresence mode="wait">
          {state.phase !== 'sent' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className={styles.heading}>Send a payment link</h1>
              <p className={styles.sub}>
                Enter any email address to send a live magic link demo.
                The recipient can complete a full payment flow without logging in.
              </p>

              <div className={styles.field}>
                <label htmlFor="demo-email" className={styles.label}>Recipient email</label>
                <input
                  id="demo-email"
                  type="email"
                  className={styles.input}
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  aria-label="Recipient email address"
                  disabled={state.phase === 'sending'}
                />
              </div>


              <motion.button
                className={styles.cta}
                onClick={handleSend}
                disabled={!isValidEmail || state.phase === 'sending'}
                whileTap={{ scale: 0.97 }}
                aria-label="Send magic link"
                tabIndex={0}
              >
                {state.phase === 'sending' ? (
                  <span className={styles.spinner} aria-label="Sending…" />
                ) : (
                  'Send magic link'
                )}
              </motion.button>

              <p className={styles.hint}>
                Or test locally — open{' '}
                <a
                  href="/?token=mock123"
                  className={styles.hintLink}
                  onClick={e => { e.preventDefault(); window.location.href = '/?token=mock123' }}
                >
                  /?token=mock123
                </a>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className={styles.successPane}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <motion.div
                className={styles.checkCircle}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              >
                <CheckIcon />
              </motion.div>

              <h2 className={styles.successHeading}>
                {state.phase === 'sent' && state.emailSent ? 'Link sent' : 'Link ready'}
              </h2>
              <p className={styles.successSub}>
                {state.phase === 'sent' && state.emailSent
                  ? <>Magic link delivered to <strong>{state.email}</strong></>
                  : <>Email delivery unavailable in demo mode — use the link below to open the flow directly.</>
                }
              </p>

              <div className={styles.linkBox}>
                <span className={styles.linkUrl}>{state.magicLinkUrl}</span>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopy(state.magicLinkUrl)}
                  aria-label="Copy magic link"
                  tabIndex={0}
                >
                  {copied ? 'Copied!' : <CopyIcon />}
                </button>
              </div>

              <p className={styles.linkHint}>
                You can also open this link directly to demo the flow.
              </p>

              <div className={styles.successActions}>
                <a
                  href={state.magicLinkUrl}
                  className={styles.openBtn}
                  tabIndex={0}
                  aria-label="Open payment flow"
                >
                  Open payment flow
                </a>
                <button
                  className={styles.resetBtn}
                  onClick={handleReset}
                  tabIndex={0}
                  aria-label="Send another"
                >
                  Send another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <p className={styles.footer}>
        UPay · Internal demo · Hackathon 2026
      </p>
    </div>
  )
}
