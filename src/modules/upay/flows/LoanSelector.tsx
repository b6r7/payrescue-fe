/**
 * LOAN_SELECT step — shown after SSN+DOB+ZIP verification.
 * Presents all active plans so the user can choose which one to pay.
 * Design: figma.com/design/OJni8npwEGI3SJ2zy9PFDx node 10162-3133
 */
import type React from 'react'
import { motion } from 'motion/react'
import { FlowCard } from '@/components/layout/FlowCard'
import type { LoanItem } from '../types'
import styles from './LoanSelector.module.css'

type Props = {
  loans: LoanItem[]
  onSelect: (loan: LoanItem) => void
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ── Merchant logos — inline SVG, no asset loading needed ── */
const AppleLogo = () => (
  <svg width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M13.5625 5.41657C11.7168 5.27999 10.1511 6.44739 9.27743 6.44739C8.40379 6.44739 7.02428 5.44556 5.57533 5.47303C3.6724 5.50126 1.91902 6.58015 0.937793 8.28394C-1.03839 11.7144 0.433447 16.7968 2.35851 19.5802C3.30005 20.9407 4.4232 22.4728 5.89809 22.4171C7.31804 22.3614 7.85519 21.4984 9.57119 21.4984C11.2872 21.4984 11.7702 22.4171 13.2718 22.3888C14.8001 22.3606 15.7683 21.0009 16.703 19.6329C17.7842 18.0542 18.229 16.5259 18.2557 16.445C18.2221 16.4321 15.2769 15.3021 15.2472 11.909C15.2205 9.07212 17.5629 7.70863 17.669 7.64302C16.3398 5.68515 14.2858 5.46922 13.5625 5.41581V5.41657Z" fill="#231F20"/>
    <path d="M12.4241 3.57925C13.2077 2.6316 13.7357 1.31237 13.5899 0C12.4615 0.0450173 11.0972 0.751559 10.2884 1.69845C9.56356 2.53699 8.92721 3.88064 9.10042 5.16554C10.3578 5.26244 11.6412 4.52691 12.4248 3.57925H12.4241Z" fill="#231F20"/>
  </svg>
)

const TargetLogo = () => (
  <svg width="17" height="23" viewBox="0 0 17 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 17.9014C9.34808 17.9014 9.72102 18.1006 9.91992 18.4238V18.001H10.7412V20.96C10.7411 21.7802 10.2683 22.3515 9.125 22.3516C8.40397 22.3516 7.78215 21.9785 7.73242 21.332H8.60254C8.67713 21.6304 8.90096 21.7549 9.24902 21.7549C9.69656 21.7549 9.94531 21.4816 9.94531 20.9844V20.5615C9.74641 20.8847 9.37295 21.0835 9 21.0586C8.10522 21.0584 7.6582 20.4124 7.6582 19.4678C7.65821 18.6723 8.13007 17.9016 9 17.9014ZM12.6309 17.9756C13.5753 17.9261 14.122 18.6971 14.1221 19.6416V19.8154H11.8594C11.8842 20.3624 12.1336 20.6113 12.6309 20.6113C12.9537 20.6112 13.2514 20.4126 13.3262 20.2139H14.0977C13.8739 20.9347 13.3765 21.2831 12.6309 21.2832C11.6363 21.2832 11.0146 20.5864 11.0146 19.6416C11.0147 18.6721 11.6613 17.9756 12.6309 17.9756ZM3.7793 17.9268C4.69913 17.9268 5.14646 18.2246 5.14648 18.8213V20.3379C5.14648 20.5367 5.17149 20.5869 5.37012 20.5869H5.39551V21.1582C5.29606 21.2079 5.17119 21.2334 5.04688 21.2334C4.64928 21.2333 4.45055 21.1084 4.37598 20.835C4.17711 21.0835 3.80419 21.2577 3.28223 21.2578C2.63591 21.2578 2.21305 20.9348 2.21289 20.3135C2.18803 20.0648 2.28742 19.8156 2.48633 19.6416C2.68523 19.4676 2.98384 19.3929 3.50586 19.3184C4.0775 19.2438 4.30171 19.2191 4.30176 18.9209C4.30176 18.5728 4.05226 18.498 3.75391 18.498C3.40608 18.4982 3.20747 18.6476 3.18262 18.9707H2.3125C2.33736 18.2745 2.90909 17.9268 3.7793 17.9268ZM1.39258 18.001H2.01367V18.5723H1.39258V20.1387C1.39258 20.437 1.46727 20.5117 1.76562 20.5117C1.8649 20.5117 1.93973 20.5121 2.03906 20.4873V21.1582C1.86502 21.1831 1.69064 21.1836 1.5166 21.1836C0.870192 21.1836 0.522461 20.9839 0.522461 20.4121V18.5723H0V18.001H0.522461V17.0557H1.39258V18.001ZM15.415 18.001H16.0371V18.5723H15.415V20.1387C15.415 20.437 15.4897 20.5117 15.7881 20.5117C15.8875 20.5117 15.9621 20.5122 16.0615 20.4873V21.1582C15.8875 21.1831 15.7131 21.1836 15.5391 21.1836C14.8928 21.1835 14.5449 20.9839 14.5449 20.4121V18.5723H14.0225V18.001H14.5449V17.0557H15.415V18.001ZM7.43359 17.9014C7.50814 17.9262 7.55829 17.9264 7.63281 17.9512V18.7471C7.5335 18.7223 7.43427 18.7217 7.33496 18.7217C6.71341 18.7217 6.48927 19.1445 6.48926 19.7412V21.1582H5.61914V18.001H6.43945V18.5723C6.61351 18.1748 7.01122 17.9016 7.43359 17.9014ZM4.27637 19.6172C4.20173 19.6917 4.05206 19.7418 3.75391 19.7666C3.30666 19.8163 3.05859 19.9157 3.05859 20.2637C3.0587 20.5121 3.20741 20.6611 3.58008 20.6611C4.05239 20.6611 4.27629 20.4127 4.27637 19.9404V19.6172ZM9.1748 18.5723C8.72727 18.5723 8.47852 18.9457 8.47852 19.4678C8.47852 19.9899 8.67754 20.4121 9.1748 20.4121C9.647 20.4119 9.91992 20.0391 9.91992 19.542C9.91985 19.0946 9.79592 18.5725 9.1748 18.5723ZM12.5557 18.5723C12.1828 18.5475 11.8598 18.8215 11.835 19.1943V19.2441H13.252C13.1774 18.7717 12.9535 18.5723 12.5557 18.5723ZM8.03125 0C12.4569 0 16.0381 3.58026 16.0381 8.00586C16.0381 12.4315 12.4569 16.0117 8.03125 16.0117C3.60585 16.0363 0.0253906 12.4313 0.0253906 8.00586C0.025416 3.58042 3.60586 0.000260205 8.03125 0ZM8.03125 2.66016C5.07278 2.66042 2.68655 5.04734 2.68652 8.00586C2.68652 10.9644 5.07277 13.3513 8.03125 13.3516C10.99 13.3516 13.377 10.9646 13.377 8.00586C13.3769 5.04718 10.9899 2.66016 8.03125 2.66016ZM8.03125 5.3457C9.49815 5.3457 10.6924 6.53896 10.6924 8.00586C10.6924 9.47278 9.49817 10.666 8.03125 10.666C6.56455 10.6658 5.37109 9.47262 5.37109 8.00586C5.37112 6.53912 6.56457 5.34596 8.03125 5.3457Z" fill="#CC0000"/>
  </svg>
)

const LOGO_COMPONENTS: Record<string, React.FC> = {
  Apple: AppleLogo,
  Target: TargetLogo,
}

const MerchantLogo = ({ name }: { name: string }) => {
  const LogoComponent = LOGO_COMPONENTS[name]
  return (
    <div className={styles.logoCircle}>
      {LogoComponent
        ? <LogoComponent />
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
