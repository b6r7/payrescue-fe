/**
 * LOAN_SELECT step — shown after SSN+DOB+ZIP verification.
 * Presents all active plans so the user can choose which one to pay.
 * Design: figma.com/design/OJni8npwEGI3SJ2zy9PFDx node 10162-3133
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
  return (
    <div className={styles.logoCircle}>
      {src
        ? <img src={src} alt={name} className={styles.logoImg} />
        : <span className={styles.logoInitial}>{name[0]}</span>
      }
    </div>
  )
}

/* ── Single plan card ─────────────────────────────────── */
const PlanCard = ({ loan, onSelect }: { loan: LoanItem; onSelect: () => void }) => (
  <div className={styles.planCard}>
    {/* Leading logo */}
    <MerchantLogo name={loan.merchant_name} />

    {/* Text block */}
    <div className={styles.planText}>
      <span className={styles.planName}>{loan.merchant_name}</span>

      {loan.is_overdue && loan.overdue_amount ? (
        <span className={styles.overdueStatus}>{`Overdue payment: ${loan.overdue_amount}`}</span>
      ) : (
        <span className={styles.normalStatus}>
          {loan.next_payment ? `Next payment: ${loan.next_payment}` : ''}
        </span>
      )}

      {loan.plan_balance && (
        <span className={styles.planBalance}>{`Plan balance: ${loan.plan_balance}`}</span>
      )}
    </div>

    {/* Pay CTA */}
    <button
      type="button"
      className={styles.payBtn}
      onClick={onSelect}
      aria-label={`Pay ${loan.merchant_name} plan`}
    >
      Pay
    </button>
  </div>
)

/* ── Component ────────────────────────────────────────── */
export const LoanSelector = ({ loans, onSelect }: Props) => (
  <FlowCard>
    <motion.div
      className={styles.copy}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <h1 className={styles.heading}>Choose a plan</h1>
      <p className={styles.subheading}>Select a plan to make a payment.</p>
    </motion.div>

    <motion.div
      className={styles.planList}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.34, ease: EASE }}
    >
      {loans.map((loan) => (
        <PlanCard key={loan.ari} loan={loan} onSelect={() => onSelect(loan)} />
      ))}
    </motion.div>
  </FlowCard>
)
