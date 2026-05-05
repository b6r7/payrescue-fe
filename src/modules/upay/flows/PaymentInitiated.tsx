/**
 * Step 5 — Payment Initiated (SINGLE_PAYMENT_INITIATED equivalent)
 * Shows loan info, payment amount options, and payment method selector.
 */
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Banner, Color, Emphasis, Size } from '@/components/ui'
import { AddCardModal } from './AddCardModal'
import { EditableText } from '@/components/ui/EditableText'
import type { PaymentInitiatedResponse, PaymentInstrument, PaymentAmount } from '../types'
import { STEP } from '../types'
import styles from './PaymentInitiated.module.css'

// ── Instrument icons for saved payment methods ────────

const ApplePayMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 210.2" width="38" height="16" aria-label="Apple Pay" fill="currentColor">
    <path d="M93.6 27.1C87.6 34.2 78 39.8 68.4 39c-1.2-9.6 3.5-19.8 9-26.1 6-7.3 16.5-12.5 25-12.9 1 10-2.9 19.8-8.8 27.1m8.7 13.8c-13.9-.8-25.8 7.9-32.4 7.9-6.7 0-16.8-7.5-27.8-7.3-14.3.2-27.6 8.3-34.9 21.2-15 25.8-3.9 64 10.6 85 7.1 10.4 15.6 21.8 26.8 21.4 10.6-.4 14.8-6.9 27.6-6.9 12.9 0 16.6 6.9 27.8 6.7 11.6-.2 18.9-10.4 26-20.8 8.1-11.8 11.4-23.3 11.6-23.9-.2-.2-22.4-8.7-22.6-34.3-.2-21.4 17.5-31.6 18.3-32.2-10-14.8-25.6-16.4-31-16.8m80.3-29v155.9h24.2v-53.3h33.5c30.6 0 52.1-21 52.1-51.4s-21.1-51.2-51.3-51.2zm24.2 20.4h27.9c21 0 33 11.2 33 30.9s-12 31-33.1 31h-27.8zM336.6 169c15.2 0 29.3-7.7 35.7-19.9h.5v18.7h22.4V90.2c0-22.5-18-37-45.7-37-25.7 0-44.7 14.7-45.4 34.9h21.8c1.8-9.6 10.7-15.9 22.9-15.9 14.8 0 23.1 6.9 23.1 19.6v8.6l-30.2 1.8c-28.1 1.7-43.3 13.2-43.3 33.2 0 20.2 15.7 33.6 38.2 33.6m6.5-18.5c-12.9 0-21.1-6.2-21.1-15.7 0-9.8 7.9-15.5 23-16.4l26.9-1.7v8.8c0 14.6-12.4 25-28.8 25m82 59.7c23.6 0 34.7-9 44.4-36.3L512 54.7h-24.6l-28.5 92.1h-.5l-28.5-92.1h-25.3l41 113.5-2.2 6.9c-3.7 11.7-9.7 16.2-20.4 16.2-1.9 0-5.6-.2-7.1-.4v18.7c1.4.4 7.4.6 9.2.6"/>
  </svg>
)

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="1" y="4" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.35"/>
    <path d="M1 8.5h18" stroke="currentColor" strokeWidth="1.35"/>
    <rect x="3" y="11.5" width="5" height="2" rx="0.5" fill="currentColor"/>
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2L2 6.5h16L10 2z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
    <path d="M3.5 7.5v7M7 7.5v7M13 7.5v7M16.5 7.5v7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
    <path d="M2 15.5h16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
  </svg>
)

const AddCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="1" y="4" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.35"/>
    <path d="M1 8.5h18" stroke="currentColor" strokeWidth="1.35"/>
    <path d="M11 12.5h4M13 10.5v4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
  </svg>
)

const InstrumentIcon = ({ type }: { type?: string }) => {
  if (type === 'apple_pay') return <ApplePayMark />
  if (type === 'ach') return <BankIcon />
  return <CardIcon />
}

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 9l4 4 6-7" stroke="var(--components-color-background-interactive-default)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--components-color-foreground-tertiary)' }}>
    <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M4.941 2.619A2.553 2.553 0 0 0 3.167 5.048v4.286c0 .941 0 1.618.043 2.149.044.524.126.864.266 1.137.272.534.704.967 1.237 1.238.273.14.613.222 1.138.266.53.043 1.207.043 2.148.043.942 0 1.618 0 2.149-.043.525-.044.864-.126 1.138-.266a2.83 2.83 0 0 0 1.238-1.238c.14-.274.222-.613.265-1.137.043-.531.044-1.208.044-2.149V5.048a2.553 2.553 0 0 0-1.774-2.429 1.832 1.832 0 0 1-1.726 1.214H6.667a1.832 1.832 0 0 1-1.726-1.214m5.382-1.019a3.549 3.549 0 0 1 2.71 3.448v4.308c0 .914 0 1.632-.047 2.208-.048.587-.147 1.072-.371 1.51a3.843 3.843 0 0 1-1.675 1.676c-.44.224-.924.323-1.51.37-.576.048-1.295.048-2.209.048h-.044c-.914 0-1.632 0-2.208-.047-.587-.048-1.072-.147-1.51-.371a3.843 3.843 0 0 1-1.676-1.675c-.224-.44-.323-.924-.37-1.51C1.865 12.988 1.865 12.27 1.866 11.356V5.048A3.549 3.549 0 0 1 4.878 1.6a1.832 1.832 0 0 1 1.789-1.432h2.666a1.832 1.832 0 0 1 1.79 1.432M5.833 2c0-.46.373-.833.834-.833h2.666a.833.833 0 1 1 0 1.666H6.667A.833.833 0 0 1 5.833 2" clipRule="evenodd"/>
  </svg>
)

const CheckSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

type Props = {
  sessionToken: string
  onConfirmed: (data: { amount: string; instrument: string; instrumentType: string; merchant: string; date: string; time: string }) => void
  onSessionExpired: () => void
}

export const PaymentInitiated = ({ sessionToken, onConfirmed, onSessionExpired }: Props) => {
  const [data, setData] = useState<PaymentInitiatedResponse['data'] | null>(null)
  const [localInstruments, setLocalInstruments] = useState<PaymentInstrument[]>([])
  const [selectedAmount, setSelectedAmount] = useState<PaymentAmount | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<PaymentInstrument | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/upay/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken }),
        })
        const json: PaymentInitiatedResponse = await res.json()
        setData(json.data)
        setLocalInstruments(json.data.instruments)
        const firstNonCustom = json.data.payment_amount_options.find((a) => a.type !== 'other_amount')
        setSelectedAmount(firstNonCustom ?? null)
        setSelectedInstrument(null)
      } catch {
        setError('Failed to load payment details. Please try again.')
      } finally {
        setIsFetching(false)
      }
    }
    void init()
  }, [sessionToken])

  const resolvedAmount =
    selectedAmount?.type === 'other_amount'
      ? Math.round(parseFloat(customAmount.replace(/[^0-9.]/g, '')) * 100)
      : selectedAmount?.amount ?? 0

  const payLabel =
    selectedAmount?.type === 'other_amount'
      ? customAmount.trim() ? `Pay $${parseFloat(customAmount.replace(/[^0-9.]/g, '')).toFixed(2)}` : 'Pay'
      : selectedAmount?.formatted_amount ? `Pay ${selectedAmount.formatted_amount}` : 'Pay'

  const handleConfirm = async () => {
    if (!selectedInstrument || resolvedAmount <= 0) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/upay/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_ari: selectedInstrument.ari,
          amount: resolvedAmount,
          payment_date: new Date().toISOString().split('T')[0],
          session_token: sessionToken,
          payment_authorization_evidence: document.documentElement.innerHTML,
        }),
      })

      const json = await res.json()

      if (json.step === STEP.PAYMENT_CONFIRMED) {
        const now = new Date()
        onConfirmed({
          amount: selectedAmount?.type === 'other_amount'
            ? `$${parseFloat(customAmount.replace(/[^0-9.]/g, '')).toFixed(2)}`
            : (selectedAmount?.formatted_amount ?? json.data.payment_amount),
          instrument: selectedInstrument?.label ?? json.data.instrument_description,
          instrumentType: selectedInstrument?.instrument_type ?? '',
          merchant: data?.merchant_name ?? json.data.merchant_name,
          date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        })
      } else if (json.step === STEP.SESSION_EXPIRED) {
        onSessionExpired()
      } else {
        setError('Payment failed. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardSaved = (instrument: PaymentInstrument) => {
    setLocalInstruments((prev) => [...prev, instrument])
    setSelectedInstrument(instrument)
    setShowAddCard(false)
  }

  if (isFetching) {
    return (
      <FlowCard>
        <div className={styles.loading}>
          <div className={styles.ring} />
          <p>Loading payment details…</p>
        </div>
      </FlowCard>
    )
  }

  if (!data) return null

  const AMOUNT_LABELS: Record<string, string> = {
    upcoming_amount: 'Upcoming payment',
    overdue_amount: 'Overdue amount',
    remaining_amount: 'Pay off in full',
    other_amount: 'Other amount',
    due_amount: 'Amount due',
    due_and_overdue_amount: 'Due + overdue',
  }

  return (
    <>
      <AnimatePresence>
        {showAddCard && (
          <AddCardModal
            onSave={handleCardSaved}
            onClose={() => setShowAddCard(false)}
          />
        )}
      </AnimatePresence>

      <FlowCard>
        <div className={styles.loanInfo}>
          <h1 className={styles.pageTitle}>Make a payment</h1>
          <p className={styles.pageSubtitle}>
            For your <EditableText id="merchant-name" defaultValue={data.merchant_name} className={styles.merchantInline} /> plan
          </p>
        </div>

        {/* ── Amount ── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Amount</p>
          <div className={styles.methodContainer}>
            {data.payment_amount_options.filter((o) => o.type !== 'other_amount').map((option, idx) => (
              <label
                key={option.type}
                className={[
                  styles.methodRow,
                  selectedAmount?.type === option.type ? styles['methodRow--selected'] : '',
                ].join(' ')}
              >
                {idx > 0 && <div className={styles.methodDividerAbsolute} />}
                <input
                  type="radio"
                  name="payment_amount"
                  value={option.type}
                  checked={selectedAmount?.type === option.type}
                  onChange={() => setSelectedAmount(option)}
                  className={styles.radioInput}
                />
                <div className={styles.amountOptionContent}>
                  <EditableText id={`amount-label-${option.type}`} defaultValue={AMOUNT_LABELS[option.type] ?? option.type} className={styles.amountLabel} />
                  <EditableText id={`amount-value-${option.type}`} defaultValue={option.formatted_amount} className={styles.amountValue} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Payment method ── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Payment method</p>
          <div className={styles.methodContainer}>
            {selectedInstrument ? (
              <label
                className={[styles.methodRow, styles['methodRow--selected']].join(' ')}
              >
                <input
                  type="radio"
                  name="instrument"
                  value={selectedInstrument.ari}
                  checked
                  readOnly
                  className={styles.radioInput}
                />
                <span className={styles.methodIconWrap} aria-hidden="true">
                  <InstrumentIcon type={selectedInstrument.instrument_type} />
                </span>
                <span className={styles.methodLabel}>{selectedInstrument.label}</span>
                <button
                  type="button"
                  className={styles.changeBtn}
                  onClick={() => { setSelectedInstrument(null); setShowAddCard(true) }}
                  aria-label="Change payment method"
                >
                  Change
                </button>
              </label>
            ) : (
              <button
                type="button"
                className={styles.methodRow}
                onClick={() => setShowAddCard(true)}
              >
                <span className={styles.methodLabel}>Enter a payment method</span>
                <ChevronIcon />
              </button>
            )}
          </div>
        </div>

        {error && <Banner variant="critical">{error}</Banner>}

        {selectedInstrument && (
          <p className={styles.authDisclaimer}>
            I agree to the{' '}
            <a
              href="https://www.affirm.com/legal"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.authDisclaimerLink}
            >
              One-Time Payment Authorization
            </a>
            .
          </p>
        )}

        <Button
          color={Color.Accent}
          emphasis={Emphasis.Primary}
          size={Size.Large}
          isFullWidth
          isLoading={isLoading}
          isDisabled={!selectedInstrument || resolvedAmount <= 0}
          onClick={handleConfirm}
        >
          {payLabel}
        </Button>
      </FlowCard>
    </>
  )
}
