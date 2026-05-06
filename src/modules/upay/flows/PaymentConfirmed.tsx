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
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M8.75 1a.75.75 0 0 0-1.5 0v.367c-.89.095-1.636.273-2.314.619a6.75 6.75 0 0 0-2.95 2.95c-.39.765-.566 1.615-.652 2.662-.084 1.031-.084 2.317-.084 3.968v.868c0 1.651 0 2.937.084 3.968.086 1.047.262 1.897.652 2.662a6.75 6.75 0 0 0 2.95 2.95c.765.39 1.615.566 2.662.652 1.031.084 2.317.084 3.968.084h.868c1.652 0 2.937 0 3.968-.084 1.047-.086 1.897-.262 2.662-.652a6.75 6.75 0 0 0 2.95-2.95c.39-.765.566-1.615.652-2.662.084-1.031.084-2.317.084-3.968v-.868c0-1.651 0-2.937-.084-3.968-.086-1.047-.262-1.897-.652-2.662a6.75 6.75 0 0 0-2.95-2.95c-.678-.346-1.424-.524-2.314-.62V1a.75.75 0 0 0-1.5 0v.274c-.801-.024-1.73-.024-2.816-.024h-.868c-1.087 0-2.015 0-2.816.024zm6.5 3V2.775a98 98 0 0 0-2.85-.025h-.8c-1.142 0-2.07 0-2.85.025V4a.75.75 0 0 1-1.5 0V2.877c-.7.086-1.205.227-1.633.445a5.25 5.25 0 0 0-2.295 2.295c-.264.518-.415 1.15-.493 2.103-.078.963-.079 2.187-.079 3.88v.8c0 1.692 0 2.917.08 3.88.077.954.228 1.585.492 2.103a5.25 5.25 0 0 0 2.295 2.295c.518.264 1.15.415 2.103.493.963.078 2.187.079 3.88.079h.8c1.692 0 2.917 0 3.88-.08.954-.077 1.585-.228 2.103-.492a5.25 5.25 0 0 0 2.295-2.295c.264-.518.415-1.15.493-2.103.078-.963.079-2.188.079-3.88v-.8c0-1.693 0-2.917-.08-3.88-.077-.954-.228-1.585-.492-2.103a5.25 5.25 0 0 0-2.295-2.295c-.428-.218-.933-.359-1.633-.445V4a.75.75 0 0 1-1.5 0M7 7.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/>
  </svg>
)

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M8.367 2.25h7.266c1.092 0 1.958 0 2.655.057.714.058 1.317.18 1.869.46a4.75 4.75 0 0 1 2.075 2.077c.281.55.403 1.154.461 1.868.057.697.057 1.563.057 2.655v5.266c0 1.092 0 1.958-.057 2.655-.058.714-.18 1.317-.46 1.869a4.75 4.75 0 0 1-2.076 2.075c-.552.281-1.155.403-1.869.461-.697.057-1.563.057-2.655.057H8.367c-1.092 0-1.958 0-2.655-.057-.714-.058-1.317-.18-1.868-.46a4.75 4.75 0 0 1-2.076-2.076c-.281-.552-.403-1.155-.461-1.869-.057-.697-.057-1.563-.057-2.655V9.367c0-1.092 0-1.958.057-2.655.058-.714.18-1.317.46-1.868a4.75 4.75 0 0 1 2.077-2.076c.55-.281 1.154-.403 1.868-.461.697-.057 1.563-.057 2.655-.057M5.834 3.802c-.62.05-1.005.147-1.31.302a3.25 3.25 0 0 0-1.42 1.42c-.155.305-.251.69-.302 1.31q-.016.195-.026.416h18.448a12 12 0 0 0-.026-.416c-.05-.62-.147-1.005-.302-1.31a3.25 3.25 0 0 0-1.42-1.42c-.305-.155-.69-.251-1.31-.302-.63-.051-1.433-.052-2.566-.052H8.4c-1.132 0-1.937 0-2.566.052M2.75 9.4v-.65h18.5v5.85c0 1.133 0 1.937-.052 2.566-.05.62-.147 1.005-.302 1.31a3.25 3.25 0 0 1-1.42 1.42c-.305.155-.69.251-1.31.302-.63.051-1.433.052-2.566.052H8.4c-1.132 0-1.937 0-2.566-.052-.62-.05-1.005-.147-1.31-.302a3.25 3.25 0 0 1-1.42-1.42c-.155-.305-.251-.69-.302-1.31-.051-.63-.052-1.434-.052-2.566zM6 11.25a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/>
  </svg>
)

const AppleLogo = () => (
  <img src="./apple-logo.png" alt="" aria-hidden="true" width="16" height="16" style={{ objectFit: 'contain', display: 'block' }} />
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
                  <AppleLogo />
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
