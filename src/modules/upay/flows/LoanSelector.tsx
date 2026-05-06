/**
 * LOAN_SELECT step — shown after SSN+DOB+ZIP verification.
 * Presents all active plans so the user can choose which one to pay.
 */
import { motion } from 'motion/react'
import { FlowCard } from '@/components/layout/FlowCard'
import type { LoanItem } from '../types'
import styles from './LoanSelector.module.css'

type Props = {
  loans: LoanItem[]
  onSelect: (loan: LoanItem) => void
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ── Merchant logo ────────────────────────────────────── */
const LOGO_MAP: Record<string, string> = {
  Apple: './apple-logo.png',
  Target: './target-logo.png',
}

const MerchantLogo = ({ name }: { name: string }) => {
  const src = LOGO_MAP[name]
  if (src) {
    return (
      <div className={styles.logoCircle}>
        <img src={src} alt={name} className={styles.logoImg} />
      </div>
    )
  }
  return (
    <div className={styles.logoCircle}>
      <span className={styles.logoInitial}>{name[0]}</span>
    </div>
  )
}

/* ── Warning icon (for overdue) ───────────────────────── */
const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M7 1.5L12.5 11H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M7 5.5v3M7 10h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)

/* ── Chevron ──────────────────────────────────────────── */
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Single loan row ──────────────────────────────────── */
const LoanRow = ({ loan, onSelect }: { loan: LoanItem; onSelect: () => void }) => (
  <button
    type="button"
    className={styles.loanRow}
    onClick={onSelect}
    aria-label={`Select ${loan.merchant_name} plan, ${loan.remaining_amount} remaining`}
  >
    <div className={styles.loanRowInner}>
      {/* Leading logo */}
      <MerchantLogo name={loan.merchant_name} />

      {/* Text */}
      <div className={styles.loanText}>
        <span className={styles.loanName}>{loan.merchant_name}</span>
        {loan.is_overdue && loan.overdue_amount ? (
          <span className={styles.overdueLabel}>
            <WarningIcon />
            {`Overdue payment: ${loan.overdue_amount}`}
          </span>
        ) : (
          <span className={styles.progressLabel}>
            {loan.next_payment ? `Next payment: ${loan.next_payment}` : loan.autopay_on === false ? 'AutoPay: Off' : loan.autopay_on === true ? 'AutoPay: On' : ''}
          </span>
        )}
        {loan.plan_balance && (
          <span className={styles.progressLabel}>{`Plan balance: ${loan.plan_balance}`}</span>
        )}
      </div>

      {/* Right amount + chevron */}
      <div className={styles.loanRight}>
        <div className={styles.loanAmountGroup}>
          <span className={styles.loanAmount}>{loan.remaining_amount}</span>
          <span className={styles.loanAmountLabel}>remaining</span>
        </div>
        <span className={styles.chevron}><ChevronRight /></span>
      </div>
    </div>

    {/* Progress bar */}
    <div className={styles.progressTrack}>
      <div
        className={`${styles.progressFill} ${loan.is_overdue ? styles.progressFillOverdue : styles.progressFillNormal}`}
        style={{ width: `${Math.round(loan.progress * 100)}%` }}
      />
    </div>
  </button>
)

/* ── Component ────────────────────────────────────────── */
export const LoanSelector = ({ loans, onSelect }: Props) => {
  const total = loans.reduce((acc, l) => {
    const num = parseFloat(l.remaining_amount.replace(/[^0-9.]/g, ''))
    return acc + (isNaN(num) ? 0 : num)
  }, 0)

  const formattedTotal = total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <FlowCard>
      <motion.div
        className={styles.copy}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <h1 className={styles.heading}>Select loan to be paid</h1>
        <p className={styles.subheading}>Below you'll find the current Plans that you still need to pay.</p>
      </motion.div>

      <motion.div
        className={styles.body}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.34, ease: EASE }}
      >
        {/* Total row */}
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalAmount}>{formattedTotal}</span>
        </div>

        {/* Loan list card */}
        <div className={styles.loanCard}>
          {loans.map((loan, idx) => (
            <div key={loan.ari}>
              {idx > 0 && <div className={styles.divider} aria-hidden="true" />}
              <LoanRow loan={loan} onSelect={() => onSelect(loan)} />
            </div>
          ))}
        </div>
      </motion.div>
    </FlowCard>
  )
}
