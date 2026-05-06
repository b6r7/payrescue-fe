/**
 * AddCardModal — three-step bottom sheet
 * Step 1: Method picker (Bank account / Debit or credit card / ApplePay)
 * Step 2: Bank sheet (Plaid-style bank picker)
 * Step 3: Card form (Card Number, MM/YY, CVC, ZIP → "Add debit card")
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { PaymentInstrument } from '../types'
import styles from './AddCardModal.module.css'

type Props = {
  onSave: (instrument: PaymentInstrument) => void
  onClose: () => void
}

type View = 'picker' | 'bank' | 'bankForm' | 'bankSuccess' | 'card'

/* ─── Bank logo assets — imported so Vite hashes paths for Quickhost ── */
import wellsFargoSrc  from '@/assets/banks/wells-fargo.png'
import citibankSrc    from '@/assets/banks/citibank.png'
import chaseSrc       from '@/assets/banks/chase.png'
import chimeSrc       from '@/assets/banks/chime.png'
import tdBankSrc      from '@/assets/banks/td-bank.png'
import usBankSrc      from '@/assets/banks/us-bank.png'
import pncSrc         from '@/assets/banks/pnc.png'
import capitalOneSrc  from '@/assets/banks/capital-one.png'

const LOGO = {
  wellsFargo:  wellsFargoSrc,
  citibank:    citibankSrc,
  chase:       chaseSrc,
  chime:       chimeSrc,
  tdBank:      tdBankSrc,
  usBank:      usBankSrc,
  pnc:         pncSrc,
  capitalOne:  capitalOneSrc,
} as const

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ─── Brand detection ────────────────────────────────── */
type Brand = 'visa' | 'mastercard' | 'amex' | 'discover' | null

const detectBrand = (raw: string): Brand => {
  const n = raw.replace(/\D/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^6(?:011|5)/.test(n)) return 'discover'
  return null
}

const brandLabel: Record<NonNullable<Brand>, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
}

/* ─── Formatters ─────────────────────────────────────── */
const formatCardNumber = (raw: string, brand: Brand): string => {
  const digits = raw.replace(/\D/g, '').slice(0, brand === 'amex' ? 15 : 16)
  if (brand === 'amex') {
    return digits.replace(/(\d{4})(\d{1,6})?(\d{1,5})?/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' ')
    )
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const formatExpiry = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/* ─── Icons ──────────────────────────────────────────── */
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2L2 6.5h16L10 2z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
    <path d="M3.5 7.5v7M7 7.5v7M13 7.5v7M16.5 7.5v7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
    <path d="M2 15.5h16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
  </svg>
)

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="1" y="4" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.35"/>
    <path d="M1 8.5h18" stroke="currentColor" strokeWidth="1.35"/>
    <rect x="3" y="11.5" width="5" height="2" rx="0.5" fill="currentColor"/>
  </svg>
)

const ApplePayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" baseProfile="tiny" viewBox="0 0 512 210.2" style={{ maxHeight: 24, width: 'auto', display: 'block' }} aria-label="Apple Pay" fill="currentColor">
    <path d="M93.6 27.1C87.6 34.2 78 39.8 68.4 39c-1.2-9.6 3.5-19.8 9-26.1 6-7.3 16.5-12.5 25-12.9 1 10-2.9 19.8-8.8 27.1m8.7 13.8c-13.9-.8-25.8 7.9-32.4 7.9-6.7 0-16.8-7.5-27.8-7.3-14.3.2-27.6 8.3-34.9 21.2-15 25.8-3.9 64 10.6 85 7.1 10.4 15.6 21.8 26.8 21.4 10.6-.4 14.8-6.9 27.6-6.9 12.9 0 16.6 6.9 27.8 6.7 11.6-.2 18.9-10.4 26-20.8 8.1-11.8 11.4-23.3 11.6-23.9-.2-.2-22.4-8.7-22.6-34.3-.2-21.4 17.5-31.6 18.3-32.2-10-14.8-25.6-16.4-31-16.8m80.3-29v155.9h24.2v-53.3h33.5c30.6 0 52.1-21 52.1-51.4s-21.1-51.2-51.3-51.2zm24.2 20.4h27.9c21 0 33 11.2 33 30.9s-12 31-33.1 31h-27.8zM336.6 169c15.2 0 29.3-7.7 35.7-19.9h.5v18.7h22.4V90.2c0-22.5-18-37-45.7-37-25.7 0-44.7 14.7-45.4 34.9h21.8c1.8-9.6 10.7-15.9 22.9-15.9 14.8 0 23.1 6.9 23.1 19.6v8.6l-30.2 1.8c-28.1 1.7-43.3 13.2-43.3 33.2 0 20.2 15.7 33.6 38.2 33.6m6.5-18.5c-12.9 0-21.1-6.2-21.1-15.7 0-9.8 7.9-15.5 23-16.4l26.9-1.7v8.8c0 14.6-12.4 25-28.8 25m82 59.7c23.6 0 34.7-9 44.4-36.3L512 54.7h-24.6l-28.5 92.1h-.5l-28.5-92.1h-25.3l41 113.5-2.2 6.9c-3.7 11.7-9.7 16.2-20.4 16.2-1.9 0-5.6-.2-7.1-.4v18.7c1.4.4 7.4.6 9.2.6"/>
  </svg>
)

/* ─── Bank building icon ─────────────────────────────── */
const BankBuildingIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M6 16.5h28M6 30.5h28M12 16.5v14M20 16.5v14M28 16.5v14M20 9.5L6 16.5h28L20 9.5Z" stroke="#0c0c14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="8.5" y="30.5" width="23" height="2.5" rx="1" fill="#0c0c14"/>
  </svg>
)

/* ─── Green checkmark badge ──────────────────────────── */
const CheckBadge = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#1DB954"/>
    <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ─── Search icon ────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

/* ─── Bank logo tiles ─────────────────────────────────── */
const WellsFargoLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.wellsFargo} alt="Wells Fargo" className={styles.bankLogoImg} />
  </div>
)

const CitibankLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.citibank} alt="Citibank" className={styles.bankLogoImg} />
  </div>
)

const ChaseLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.chase} alt="Chase" className={styles.bankLogoImg} />
  </div>
)

const ChimeLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.chime} alt="Chime" className={styles.bankLogoImg} />
  </div>
)

const TDLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.tdBank} alt="TD Bank" className={styles.bankLogoImg} />
  </div>
)

const USBankLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.usBank} alt="US Bank" className={styles.bankLogoImg} />
  </div>
)

const PNCLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.pnc} alt="PNC" className={styles.bankLogoImg} />
  </div>
)

const CapitalOneLogo = () => (
  <div className={styles.bankLogoSimple}>
    <img src={LOGO.capitalOne} alt="Capital One" className={styles.bankLogoImg} />
  </div>
)

const BANKS = [
  { name: 'Wells Fargo',  Logo: WellsFargoLogo },
  { name: 'Citibank',     Logo: CitibankLogo   },
  { name: 'Chase',        Logo: ChaseLogo      },
  { name: 'Chime',        Logo: ChimeLogo      },
  { name: 'TD Bank',      Logo: TDLogo         },
  { name: 'US Bank',      Logo: USBankLogo     },
  { name: 'PNC',          Logo: PNCLogo        },
  { name: 'Capital One',  Logo: CapitalOneLogo },
] as const

const CardBrandBadge = ({ brand }: { brand: Brand }) => brand ? (
  <motion.span
    key={brand}
    className={styles.brandBadge}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.15 }}
  >
    {brandLabel[brand]}
  </motion.span>
) : null

/* ─── Component ──────────────────────────────────────── */
export const AddCardModal = ({ onSave, onClose }: Props) => {
  const [view, setView] = useState<View>('picker')

  /* bank form state */
  const [bankName, setBankName]         = useState('')
  const [routingNum, setRoutingNum]     = useState('')
  const [accountNum, setAccountNum]     = useState('')
  const [bankErrors, setBankErrors]     = useState<Record<string, string>>({})
  const [isBankSaving, setIsBankSaving]           = useState(false)
  const [savedBankInstrument, setSavedBankInstrument] = useState<PaymentInstrument | null>(null)

  const validateBank = (): boolean => {
    const errs: Record<string, string> = {}
    if (bankName.trim().length < 2)                       errs.bankName    = 'Enter your full name'
    if (routingNum.replace(/\D/g, '').length !== 9)       errs.routingNum  = 'Routing number must be 9 digits'
    if (accountNum.replace(/\D/g, '').length < 4)         errs.accountNum  = 'Enter a valid account number'
    setBankErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleBankSave = async () => {
    if (!validateBank()) return
    setIsBankSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    const last4 = accountNum.replace(/\D/g, '').slice(-4)
    const newInstrument: PaymentInstrument = {
      ari: `ari:affirm:instrument:us:1:ach_${Date.now()}`,
      label: `Bank account ••••${last4}`,
      instrument_type: 'ach',
    }
    setIsBankSaving(false)
    setSavedBankInstrument(newInstrument)
    setView('bankSuccess')
  }

  /* card form state */
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [zip, setZip] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const brand = detectBrand(cardNumber)
  const rawDigits = cardNumber.replace(/\D/g, '')
  const maxLength = brand === 'amex' ? 15 : 16

  const canSave = rawDigits.length >= 15 && expiry.length >= 5 && cvv.length >= 3 && zip.replace(/\D/g, '').length >= 5

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (rawDigits.length < maxLength) errs.cardNumber = 'Enter a valid card number'
    const [mm, yy] = expiry.split('/')
    if (!mm || !yy || expiry.replace(/\D/g, '').length < 4 || parseInt(mm) > 12 || parseInt(mm) < 1) {
      errs.expiry = 'Enter a valid expiry (MM/YY)'
    }
    const cvvLen = brand === 'amex' ? 4 : 3
    if (cvv.length < cvvLen) errs.cvv = `Enter ${cvvLen}-digit code`
    if (zip.replace(/\D/g, '').length < 5) errs.zip = 'Enter ZIP'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    const last4 = rawDigits.slice(-4)
    const label = `${brand ? brandLabel[brand] : 'Visa'} •••• ${last4}`
    const newInstrument: PaymentInstrument = {
      ari: `ari:affirm:instrument:us:1:card_${Date.now()}`,
      label,
      instrument_type: 'debit',
    }
    setIsSaving(false)
    onSave(newInstrument)
  }

  const handleCardNumberChange = (raw: string) => {
    const b = detectBrand(raw)
    setCardNumber(formatCardNumber(raw, b))
    setErrors((e) => ({ ...e, cardNumber: '' }))
  }

  const handleExpiryChange = (raw: string) => {
    setExpiry(formatExpiry(raw))
    setErrors((e) => ({ ...e, expiry: '' }))
  }

  const handleCvvChange = (raw: string) => {
    const cvvMax = brand === 'amex' ? 4 : 3
    setCvv(raw.replace(/\D/g, '').slice(0, cvvMax))
    setErrors((e) => ({ ...e, cvv: '' }))
  }

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-label="Payment method"
    >
      <motion.div
        className={styles.panel}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {/* Drag handle */}
        <div className={styles.dragHandle} aria-hidden="true" />

        <AnimatePresence mode="wait" initial={false}>

          {/* ── View 1: Method picker ─────────────────────── */}
          {view === 'picker' && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <div className={styles.header}>
                <h2 className={styles.headerTitle}>Enter a payment method</h2>
                <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              <ul className={styles.pickerList} role="list">
                <li>
                  <button
                    type="button"
                    className={styles.pickerRow}
                    onClick={() => setView('bank')}
                    aria-label="Bank account"
                  >
                    <span className={styles.pickerIconWrap} aria-hidden="true"><BankIcon /></span>
                    <span className={styles.pickerLabel}>Bank account</span>
                    <ChevronRight />
                  </button>
                </li>
                <li className={styles.pickerDividerWrap}><div className={styles.pickerDivider} /></li>
                <li>
                  <button
                    type="button"
                    className={styles.pickerRow}
                    onClick={() => setView('card')}
                    aria-label="Debit or credit card"
                  >
                    <span className={styles.pickerIconWrap} aria-hidden="true"><CardIcon /></span>
                    <span className={styles.pickerLabel}>Debit or credit card</span>
                    <ChevronRight />
                  </button>
                </li>
                <li className={styles.pickerDividerWrap}><div className={styles.pickerDivider} /></li>
                <li>
                  <button
                    type="button"
                    className={styles.pickerRow}
                    onClick={() => setView('card')}
                    aria-label="Apple Pay"
                  >
                    <span className={[styles.pickerIconWrap, styles['pickerIconWrap--dark']].join(' ')} aria-hidden="true">
                      <ApplePayIcon />
                    </span>
                    <span className={styles.pickerLabel}>ApplePay</span>
                    <ChevronRight />
                  </button>
                </li>
              </ul>
            </motion.div>
          )}

          {/* ── View 2: Bank picker ───────────────────────── */}
          {view === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <div className={styles.header}>
                <button type="button" className={styles.backBtn} onClick={() => setView('picker')} aria-label="Go back">
                  <BackIcon />
                </button>
                <h2 className={styles.headerTitle}>Enter your bank details</h2>
                <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.bankContent}>
                <p className={styles.bankSubtitle}>Securely link your account to Affirm with Plaid.</p>

                <div className={styles.bankContainer}>
                  {/* Search field */}
                  <div className={styles.bankSearch}>
                    <span className={styles.bankSearchIcon}><SearchIcon /></span>
                    <span className={styles.bankSearchPlaceholder}>Search for your bank</span>
                  </div>

                  {/* Bank grid */}
                  <div className={styles.bankGrid}>
                    {BANKS.map(({ name, Logo }) => (
                      <button
                        key={name}
                        type="button"
                        className={styles.bankChip}
                        onClick={() => setView('card')}
                        aria-label={name}
                      >
                        <Logo />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer link */}
                <button
                  type="button"
                  className={styles.bankManualLink}
                  onClick={() => setView('bankForm')}
                >
                  Manually enter details instead
                </button>
              </div>
            </motion.div>
          )}

          {/* ── View 3: Bank account form ─────────────────── */}
          {view === 'bankForm' && (
            <motion.div
              key="bankForm"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <div className={styles.header}>
                <button type="button" className={styles.backBtn} onClick={() => setView('bank')} aria-label="Go back">
                  <BackIcon />
                </button>
                <h2 className={styles.headerTitle}>Enter your bank details</h2>
                <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.bankFormContent}>
                <div className={styles.bankFormInputs}>
                  {/* Name */}
                  <div className={styles.bankField}>
                    <input
                      className={`${styles.bankInput} ${bankErrors.bankName ? styles.bankInputError : ''}`}
                      type="text"
                      placeholder="First and last name"
                      value={bankName}
                      onChange={(e) => { setBankName(e.target.value); setBankErrors((p) => ({ ...p, bankName: '' })) }}
                      autoComplete="name"
                      aria-label="First and last name"
                    />
                    {bankErrors.bankName && <span className={styles.bankFieldError}>{bankErrors.bankName}</span>}
                  </div>

                  {/* Routing */}
                  <div className={styles.bankField}>
                    <input
                      className={`${styles.bankInput} ${bankErrors.routingNum ? styles.bankInputError : ''}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="Routing number"
                      value={routingNum}
                      maxLength={9}
                      onChange={(e) => { setRoutingNum(e.target.value.replace(/\D/g, '')); setBankErrors((p) => ({ ...p, routingNum: '' })) }}
                      autoComplete="off"
                      aria-label="Routing number"
                    />
                    {bankErrors.routingNum && <span className={styles.bankFieldError}>{bankErrors.routingNum}</span>}
                  </div>

                  {/* Account */}
                  <div className={styles.bankField}>
                    <input
                      className={`${styles.bankInput} ${bankErrors.accountNum ? styles.bankInputError : ''}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="Account number"
                      value={accountNum}
                      maxLength={17}
                      onChange={(e) => { setAccountNum(e.target.value.replace(/\D/g, '')); setBankErrors((p) => ({ ...p, accountNum: '' })) }}
                      autoComplete="off"
                      aria-label="Account number"
                    />
                    {bankErrors.accountNum && <span className={styles.bankFieldError}>{bankErrors.accountNum}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.bankSaveBtn}
                  onClick={handleBankSave}
                  disabled={isBankSaving}
                  aria-busy={isBankSaving}
                >
                  {isBankSaving ? 'Adding…' : 'Add bank account'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── View 4: Bank added success ────────────────── */}
          {view === 'bankSuccess' && (
            <motion.div
              key="bankSuccess"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {/* X close — no back button on success */}
              <div className={styles.successCloseRow}>
                <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              {/* Visual: bank circle + checkmark badge */}
              <div className={styles.successVisual}>
                <div className={styles.successIconCircle}>
                  <BankBuildingIcon />
                  <span className={styles.successCheckBadge}><CheckBadge /></span>
                </div>
              </div>

              {/* Text */}
              <div className={styles.successContent}>
                <h2 className={styles.successTitle}>You added a bank account</h2>
                <p className={styles.successBody}>You can make a payment with this bank account.</p>
              </div>

              {/* CTA */}
              <div className={styles.successCta}>
                <button
                  type="button"
                  className={styles.bankSaveBtn}
                  onClick={() => savedBankInstrument && onSave(savedBankInstrument)}
                >
                  Continue to payment
                </button>
              </div>
            </motion.div>
          )}

          {/* ── View 5: Card form ─────────────────────────── */}
          {view === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <div className={styles.header}>
                <button type="button" className={styles.backBtn} onClick={() => setView('picker')} aria-label="Go back">
                  <BackIcon />
                </button>
                <h2 className={styles.headerTitle}>Enter your card details</h2>
                <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.form}>
                {/* Card number */}
                <div className={styles.field}>
                  <div className={[styles.fieldInputWrap, errors.cardNumber ? styles['fieldInputWrap--error'] : ''].join(' ')}>
                    <input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      placeholder="Card Number"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className={styles.fieldInput}
                      autoComplete="cc-number"
                      autoFocus
                      aria-label="Card number"
                      aria-invalid={!!errors.cardNumber}
                    />
                    <div className={styles.fieldRight}>
                      <AnimatePresence mode="wait">
                        <CardBrandBadge brand={brand} />
                      </AnimatePresence>
                    </div>
                  </div>
                  {errors.cardNumber && <span className={styles.fieldError} role="alert">{errors.cardNumber}</span>}
                </div>

                {/* MM/YY · CVC · ZIP — 3 columns */}
                <div className={styles.fieldRow3}>
                  <div className={styles.field}>
                    <div className={[styles.fieldInputWrap, errors.expiry ? styles['fieldInputWrap--error'] : ''].join(' ')}>
                      <input
                        id="expiry"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className={styles.fieldInput}
                        autoComplete="cc-exp"
                        maxLength={5}
                        aria-label="Expiry date"
                        aria-invalid={!!errors.expiry}
                      />
                    </div>
                    {errors.expiry && <span className={styles.fieldError} role="alert">{errors.expiry}</span>}
                  </div>

                  <div className={styles.field}>
                    <div className={[styles.fieldInputWrap, errors.cvv ? styles['fieldInputWrap--error'] : ''].join(' ')}>
                      <input
                        id="cvv"
                        type="text"
                        inputMode="numeric"
                        placeholder={brand === 'amex' ? 'CID' : 'CVC'}
                        value={cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        className={styles.fieldInput}
                        autoComplete="cc-csc"
                        aria-label="Security code"
                        aria-invalid={!!errors.cvv}
                      />
                    </div>
                    {errors.cvv && <span className={styles.fieldError} role="alert">{errors.cvv}</span>}
                  </div>

                  <div className={styles.field}>
                    <div className={[styles.fieldInputWrap, errors.zip ? styles['fieldInputWrap--error'] : ''].join(' ')}>
                      <input
                        id="zip"
                        type="text"
                        inputMode="numeric"
                        placeholder="ZIP"
                        value={zip}
                        onChange={(e) => { setZip(e.target.value.replace(/\D/g, '').slice(0, 5)); setErrors((er) => ({ ...er, zip: '' })) }}
                        className={styles.fieldInput}
                        autoComplete="postal-code"
                        maxLength={5}
                        aria-label="ZIP code"
                        aria-invalid={!!errors.zip}
                      />
                    </div>
                    {errors.zip && <span className={styles.fieldError} role="alert">{errors.zip}</span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={[styles.saveBtn, (!canSave || isSaving) ? styles['saveBtn--disabled'] : ''].join(' ')}
                onClick={handleSave}
                disabled={!canSave || isSaving}
                aria-busy={isSaving}
              >
                {isSaving ? <span className={styles.spinner} aria-hidden="true" /> : 'Add debit card'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
