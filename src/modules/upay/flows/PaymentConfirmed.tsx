/**
 * Step 6 — Payment Confirmed
 * Redesigned to match Figma: "Redesign L2 Envelope screen (delightful)"
 * Layout: large hero → Summary card (date / instrument → merchant) → recovery CTA
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FlowCard } from '../../../components/layout/FlowCard'
import { PhoneModal } from './PhoneModal'
import styles from './PaymentConfirmed.module.css'

type Props = {
  amount: string
  instrument: string
  instrumentType: string
  merchant: string
  date: string
  time: string
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ─── Icons ──────────────────────────────────────────── */
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 9h16M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="1" y="4" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.35"/>
    <path d="M1 8.5h18" stroke="currentColor" strokeWidth="1.35"/>
    <rect x="3" y="11.5" width="5" height="2" rx="0.5" fill="currentColor"/>
  </svg>
)

const StoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 7.5h14l-1.5 9H4.5L3 7.5z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
    <path d="M1 4.5h18M7.5 4.5L6 7.5M12.5 4.5L14 7.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
    <path d="M8.5 11.5v4M11.5 11.5v4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
  </svg>
)

const DownArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ─── Component ──────────────────────────────────────── */
export const PaymentConfirmed = ({ amount, instrument, date, time, merchant }: Props) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneAdded, setPhoneAdded] = useState(false)

  const handlePhoneSuccess = () => {
    setShowPhoneModal(false)
    setPhoneAdded(true)
  }

  return (
    <>
      <AnimatePresence>
        {showPhoneModal && (
          <PhoneModal
            onSuccess={handlePhoneSuccess}
            onClose={() => setShowPhoneModal(false)}
          />
        )}
      </AnimatePresence>

      <FlowCard>
        {/* ── Hero ─────────────────────────────────────── */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: EASE }}
        >
          <h1 className={styles.title}>Thanks for your payment</h1>
          <p className={styles.subtitle}>You're one step closer to paying off your purchase.</p>
        </motion.div>

        {/* ── Summary section ───────────────────────────── */}
        <motion.div
          className={styles.summarySection}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.38, ease: EASE }}
        >
          <p className={styles.sectionLabel}>Summary</p>

          <div className={styles.summaryCard}>
            {/* Date row */}
            <div className={styles.summaryRow}>
              <span className={styles.leadingIcon} aria-hidden="true">
                <CalendarIcon />
              </span>
              <div className={styles.rowText}>
                <span className={styles.rowTitle}>{date}</span>
                <span className={styles.rowSubtitle}>{time}</span>
              </div>
            </div>

            <div className={styles.cardDivider} />

            {/* Instrument → merchant group */}
            <div className={styles.summaryGroup}>
              {/* Instrument row */}
              <div className={styles.summaryRow}>
                <span className={styles.leadingIconRound} aria-hidden="true">
                  <CardIcon />
                </span>
                <div className={styles.rowText}>
                  <span className={styles.rowTitle}>{instrument}</span>
                </div>
              </div>

              {/* Down arrow connector */}
              <div className={styles.arrowWrap} aria-hidden="true">
                <DownArrowIcon />
              </div>

              {/* Merchant / plan row */}
              <div className={styles.summaryRow}>
                <span className={styles.leadingIconRound} aria-hidden="true">
                  <StoreIcon />
                </span>
                <div className={styles.rowText}>
                  <span className={styles.rowTitle}>Your {merchant} plan</span>
                  <span className={[styles.rowSubtitle, styles.rowSubtitleBold].join(' ')}>{amount}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Recovery CTA ──────────────────────────────── */}
        <motion.div
          className={styles.ctaWrap}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.38, ease: EASE }}
        >
          <AnimatePresence mode="wait">
            {phoneAdded ? (
              <motion.p
                key="done"
                className={styles.phoneAddedNote}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: EASE, duration: 0.26 }}
              >
                ✓ Phone number updated. You're all set.
              </motion.p>
            ) : (
              <motion.button
                key="cta"
                type="button"
                className={styles.primaryBtn}
                onClick={() => setShowPhoneModal(true)}
                aria-label="Update my phone number"
              >
                Update my phone number
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </FlowCard>
    </>
  )
}
