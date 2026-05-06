/**
 * UPay flow orchestrator — manages step transitions and shared state.
 * This is the top-level state machine for the entire flow.
 *
 * Flow:
 *   IDENTITY_ENTRY → OTP_ENTRY → PAYMENT_INITIATED → PAYMENT_CONFIRMED
 *                  ↘ (SSN/DOB/ZIP path, no OTP) ↗
 *   Any step → SESSION_EXPIRED | ERROR
 *
 * Legacy steps (AFFIRM_SIGNIN, MAGIC_LINK_LANDING, TOKEN_EXPIRED, VERIFICATION_FORM)
 * are still defined and reachable from non-default routes (e.g. ?mode=demo) but
 * no longer part of the default user journey.
 */
import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AffirmSignIn } from './flows/AffirmSignIn'
import { IdentityEntry } from './flows/IdentityEntry'
import { MagicLinkLanding } from './flows/MagicLinkLanding'
import { TokenExpired } from './flows/TokenExpired'
import { VerificationForm } from './flows/VerificationForm'
import { OTPEntry } from './flows/OTPEntry'
import { LoanSelector } from './flows/LoanSelector'
import { PaymentInitiated } from './flows/PaymentInitiated'
import { PaymentConfirmed } from './flows/PaymentConfirmed'
import { PaymentTransition } from './flows/PaymentTransition'
import { SessionExpired } from './flows/SessionExpired'
import { GenericError } from './flows/GenericError'
import { STEP } from './types'
import type { LoanItem } from './types'

// Steps ordered so we know which direction to slide
const STEP_ORDER = [
  STEP.AFFIRM_SIGNIN,
  STEP.IDENTITY_ENTRY,
  STEP.MAGIC_LINK_LANDING,
  STEP.TOKEN_EXPIRED,
  STEP.VERIFICATION_FORM,
  STEP.OTP_ENTRY,
  STEP.LOAN_SELECT,
  STEP.PAYMENT_INITIATED,
  STEP.PAYMENT_CONFIRMED,
  STEP.SESSION_EXPIRED,
  STEP.ERROR,
] as const

type FlowState =
  | { step: typeof STEP.AFFIRM_SIGNIN }
  | { step: typeof STEP.IDENTITY_ENTRY }
  | { step: typeof STEP.MAGIC_LINK_LANDING }
  | { step: typeof STEP.TOKEN_EXPIRED }
  | { step: typeof STEP.VERIFICATION_FORM; loanId: string; maskedEmail: string }
  | { step: typeof STEP.OTP_ENTRY; maskedEmail: string; sessionToken: string }
  | { step: typeof STEP.LOAN_SELECT; sessionToken: string; loans: LoanItem[] }
  | { step: typeof STEP.PAYMENT_INITIATED; sessionToken: string; selectedMerchant?: string }
  | { step: typeof STEP.PAYMENT_CONFIRMED; amount: string; instrument: string; instrumentType: string; merchant: string; date: string; time: string }
  | { step: typeof STEP.SESSION_EXPIRED }
  | { step: typeof STEP.ERROR; message?: string }

type Props = {
  /** Magic link token from email CTA URL — only used by legacy MAGIC_LINK_LANDING flow. */
  magicLinkToken?: string
  /** Recipient email encoded in the magic link URL (?e=...) for dynamic masking. */
  recipientEmail?: string
}

type ConfirmedData = { amount: string; instrument: string; instrumentType: string; merchant: string; date: string; time: string }

export const UPayOrchestrator = ({ magicLinkToken = '', recipientEmail = '' }: Props) => {
  const [state, setState] = useState<FlowState>({ step: STEP.IDENTITY_ENTRY })
  const [prevStep, setPrevStep] = useState<string>(STEP.IDENTITY_ENTRY)
  const [pendingConfirmed, setPendingConfirmed] = useState<ConfirmedData | null>(null)
  const [showTransition, setShowTransition] = useState(false)

  const goTo = useCallback((next: FlowState) => {
    setPrevStep(state.step)
    setState(next)
  }, [state.step])

  const prevIdx = STEP_ORDER.indexOf(prevStep as typeof STEP_ORDER[number])
  const currIdx = STEP_ORDER.indexOf(state.step as typeof STEP_ORDER[number])
  const direction = currIdx >= prevIdx ? 1 : -1

  // iOS-native: direction-aware variants via `custom` prop.
  // Enter slides in from the leading edge; exit pushes away at ~½ the distance
  // (parallax depth) while scaling back slightly — exactly what UIKit does.
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 64 : -64,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -32 : 32,
      opacity: 0,
      scale: 0.97,
    }),
  }

  // x uses spring (snappy, native), opacity + scale use a short tween
  const iosTransition = {
    x:       { type: 'spring' as const, stiffness: 360, damping: 36, mass: 0.85 },
    opacity: { type: 'tween' as const, duration: 0.2,  ease: 'easeOut' as const },
    scale:   { type: 'tween' as const, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
  }

  let content: React.ReactNode = null

  switch (state.step) {
    case STEP.AFFIRM_SIGNIN:
      content = (
        <AffirmSignIn
          onGetStarted={() => goTo({ step: STEP.IDENTITY_ENTRY })}
        />
      )
      break

    case STEP.IDENTITY_ENTRY:
      content = (
        <IdentityEntry
          onOTPRequired={(maskedEmail, sessionToken) =>
            goTo({ step: STEP.OTP_ENTRY, maskedEmail, sessionToken })
          }
          onDirectToPayment={(sessionToken) =>
            goTo({ step: STEP.PAYMENT_INITIATED, sessionToken })
          }
          onLoanSelect={(sessionToken, loans) =>
            goTo({ step: STEP.LOAN_SELECT, sessionToken, loans })
          }
        />
      )
      break

    case STEP.MAGIC_LINK_LANDING:
      content = (
        <MagicLinkLanding
          token={magicLinkToken}
          recipientEmail={recipientEmail}
          onValidated={(loanId, maskedEmail) =>
            goTo({ step: STEP.VERIFICATION_FORM, loanId, maskedEmail })
          }
          onExpired={() => goTo({ step: STEP.TOKEN_EXPIRED })}
        />
      )
      break

    case STEP.TOKEN_EXPIRED:
      content = (
        <TokenExpired
          onRequestNewLink={() => goTo({ step: STEP.IDENTITY_ENTRY })}
        />
      )
      break

    case STEP.VERIFICATION_FORM:
      content = (
        <VerificationForm
          prefilledLoanId={state.loanId}
          onOTPRequired={(maskedEmail, sessionToken) =>
            goTo({ step: STEP.OTP_ENTRY, maskedEmail, sessionToken })
          }
          onDirectToPayment={(sessionToken) =>
            goTo({ step: STEP.PAYMENT_INITIATED, sessionToken })
          }
          onLoanSelect={(sessionToken, loans) =>
            goTo({ step: STEP.LOAN_SELECT, sessionToken, loans })
          }
        />
      )
      break

    case STEP.LOAN_SELECT:
      content = (
        <LoanSelector
          loans={state.loans}
          onSelect={(loan) => goTo({ step: STEP.PAYMENT_INITIATED, sessionToken: state.sessionToken, selectedMerchant: loan.merchant_name })}
        />
      )
      break

    case STEP.OTP_ENTRY:
      content = (
        <OTPEntry
          maskedEmail={state.maskedEmail}
          sessionToken={state.sessionToken}
          onVerified={(sessionToken) =>
            goTo({ step: STEP.PAYMENT_INITIATED, sessionToken })
          }
          onBack={() =>
            goTo({ step: STEP.IDENTITY_ENTRY })
          }
        />
      )
      break

    case STEP.PAYMENT_INITIATED:
      content = (
        <PaymentInitiated
          sessionToken={state.sessionToken}
          selectedMerchant={state.selectedMerchant}
          onConfirmed={(data) => {
            setPendingConfirmed(data)
            setShowTransition(true)
          }}
          onSessionExpired={() => goTo({ step: STEP.SESSION_EXPIRED })}
        />
      )
      break

    case STEP.PAYMENT_CONFIRMED:
      content = (
        <PaymentConfirmed
          amount={state.amount}
          instrument={state.instrument}
          instrumentType={state.instrumentType}
          merchant={state.merchant}
          date={state.date}
          time={state.time}
        />
      )
      break

    case STEP.SESSION_EXPIRED:
      content = <SessionExpired onRestart={() => goTo({ step: STEP.IDENTITY_ENTRY })} />
      break

    case STEP.ERROR:
      content = (
        <GenericError
          message={state.message}
          onRetry={() => goTo({ step: STEP.IDENTITY_ENTRY })}
        />
      )
      break

    default:
      content = null
  }

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false)
    if (pendingConfirmed) {
      goTo({ step: STEP.PAYMENT_CONFIRMED, ...pendingConfirmed })
      setPendingConfirmed(null)
    }
  }, [pendingConfirmed, goTo])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 'var(--upay-max-width, 400px)', overflow: 'hidden' }}>
      {/* popLayout: exiting el becomes position:absolute so enter+exit animate simultaneously — iOS-native */}
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={state.step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={iosTransition}
          style={{ width: '100%', willChange: 'transform, opacity' }}
        >
          {content}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showTransition && (
          <PaymentTransition onComplete={handleTransitionComplete} />
        )}
      </AnimatePresence>
    </div>
  )
}
