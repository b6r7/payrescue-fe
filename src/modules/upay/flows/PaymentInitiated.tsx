/**
 * Step 5 — Payment Initiated (SINGLE_PAYMENT_INITIATED equivalent)
 * Shows loan info, payment amount options, and payment method selector.
 */
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { FlowCard } from '@/components/layout/FlowCard'
import { Button, Banner, Color, Emphasis, Size } from '@/components/ui'
import { AddCardModal, type NewCardData } from './AddCardModal'
import { EditableText } from '@/components/ui/EditableText'
import { apiUrl } from '@/utils/apiBase'
import type { PaymentInitiatedResponse, PaymentInstrument, PaymentAmount } from '../types'
import { STEP } from '../types'
import styles from './PaymentInitiated.module.css'


const ChevronIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--components-color-foreground-tertiary)' }}>
    <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

type Props = {
  sessionToken: string
  selectedMerchant?: string
  onConfirmed: (data: { amount: string; instrument: string; instrumentType: string; merchant: string; date: string; time: string }) => void
  onSessionExpired: () => void
}

export const PaymentInitiated = ({ sessionToken, selectedMerchant, onConfirmed, onSessionExpired }: Props) => {
  const [data, setData] = useState<PaymentInitiatedResponse['data'] | null>(null)
  const [_localInstruments, setLocalInstruments] = useState<PaymentInstrument[]>([])
  const [selectedAmount, setSelectedAmount] = useState<PaymentAmount | null>(null)
  const [customAmount, _setCustomAmount] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<PaymentInstrument | null>(null)
  // Raw card fields when the user adds a new card. Tagged with the synthetic
  // `ari` we attached to the PaymentInstrument so we only forward them when
  // the user actually selects that newly-added card on Pay submit.
  const [pendingCardData, setPendingCardData] = useState<(NewCardData & { ari: string }) | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(apiUrl('/api/upay/payment/initiate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, merchant: selectedMerchant }),
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
    // Guard against double-click / re-entry while a confirm is in-flight.
    // The Button's `isLoading` prop disables it visually, but the click
    // handler can still fire twice in the same event tick before React
    // re-renders. Backend has setIfAbsent(jti) protection too, but the
    // FE guard avoids the confusing "REPLAY" error UI on the second click.
    if (!selectedInstrument || resolvedAmount <= 0 || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // If the selected instrument is a freshly-added card, forward the raw
      // card fields so the backend can tokenize via instruments.legacy and
      // produce a real instrument_ari (the synthetic one we attached locally
      // wouldn't be accepted by makeLoanPayment).
      const cardFields =
        pendingCardData && pendingCardData.ari === selectedInstrument.ari
          ? {
              card_number: pendingCardData.card_number,
              exp_month: pendingCardData.exp_month,
              exp_year: pendingCardData.exp_year,
              cvc: pendingCardData.cvc,
              postal_code: pendingCardData.postal_code,
              card_holder_name: pendingCardData.card_holder_name,
            }
          : {}

      const res = await fetch(apiUrl('/api/upay/payment/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_ari: selectedInstrument.ari,
          amount: resolvedAmount,
          payment_date: new Date().toISOString().split('T')[0],
          session_token: sessionToken,
          // NOTE: an earlier version sent `document.documentElement.innerHTML`
          // here as `payment_authorization_evidence`. The intent was to
          // capture the rendered consent text the user saw at submit time.
          // The actual effect was sending the entire DOM (masked phone,
          // loan ID, merchant name) to the BE on every confirm — which then
          // landed in any request-body access logger. Removed.
          ...cardFields,
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

  const handleCardSaved = (instrument: PaymentInstrument, newCardData?: NewCardData) => {
    setLocalInstruments((prev) => [...prev, instrument])
    setSelectedInstrument(instrument)
    // Stash the raw card fields so handleConfirm can forward them; backend
    // tokenizes and overrides the synthetic instrument_ari we attached above.
    if (newCardData) setPendingCardData({ ...newCardData, ari: instrument.ari })
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

  // Initial load failed (e.g. /payment/initiate returned an error or the
  // tunnel dropped). Render a recoverable error card instead of a blank
  // screen so the user has a way to retry without refreshing.
  if (!data) {
    return (
      <FlowCard>
        <div className={styles.loanInfo}>
          <h1 className={styles.pageTitle}>Couldn't load payment details</h1>
          <p className={styles.pageSubtitle}>
            {error ?? 'Something went wrong. Please try again.'}
          </p>
        </div>
        <Button
          color={Color.Accent}
          emphasis={Emphasis.Primary}
          size={Size.Large}
          isFullWidth
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </FlowCard>
    )
  }

  const AMOUNT_LABELS: Record<string, string> = {
    upcoming_amount: 'Upcoming payment',
    overdue_amount: 'Overdue amount',
    due_and_overdue_amount: 'Overdue & upcoming payment',
    remaining_amount: 'Remaining balance',
    other_amount: 'Other amount',
    due_amount: 'Amount due',
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
                  <EditableText
                    id={`amount-value-${option.type}`}
                    defaultValue={option.formatted_amount}
                    className={[styles.amountValue, option.type === 'overdue_amount' ? styles['amountValue--overdue'] : ''].filter(Boolean).join(' ')}
                  />
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
                <span className={styles.methodLabelGroup}>
                  <span className={styles.methodLabel}>{selectedInstrument.label}</span>
                  {(selectedInstrument.instrument_type === 'debit' || selectedInstrument.instrument_type === 'credit') && (
                    <span className={styles.methodSubLabel}>
                      {selectedInstrument.instrument_type === 'debit' ? 'Debit card' : 'Credit card'}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className={styles.changeBtn}
                  onClick={() => { setSelectedInstrument(null); setShowAddCard(true) }}
                  aria-label="Change payment method"
                >
                  <ChevronIcon />
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
