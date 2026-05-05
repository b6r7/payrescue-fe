/**
 * UPay types — net-new flow types plus re-exports from
 * the real repayment module (web-ux/product-flows/src/modules/repayment/types.ts).
 *
 * When this ships in web-ux, import the repayment types directly:
 *   import type { PaymentInstrument, PaymentAmount } from '@src/modules/repayment/types'
 */

// ─── Re-typed from web-ux/product-flows/src/modules/repayment/types.ts ───────

export type PaymentInstrumentType =
  | ''
  | 'credit'
  | 'debit'
  | 'ach'
  | 'taa'
  | 'uk_bacs'
  | 'apple_pay'
  | 'unknown'

export interface PaymentInstrument {
  ari: string
  label: string
  instrument_type?: PaymentInstrumentType
  balance?: number
  has_active_mandate?: boolean | null
  disclosure_copy_key?: null | string
}

export interface PaymentAmount {
  label_flow_copy_key: string
  subtext_flow_copy_key?: string
  amount: number
  formatted_amount: string
  type:
    | 'upcoming_amount'
    | 'remaining_amount'
    | 'other_amount'
    | 'overdue_amount'
    | 'due_amount'
    | 'due_and_overdue_amount'
}

export interface NewPaymentMethod {
  flow_copy_key: string
  action_key: string
  card_type?: string
}

// ─── UPay-specific step names ───────────────────────────────────────────

export const STEP = {
  AFFIRM_SIGNIN: 'AFFIRM_SIGNIN',
  MAGIC_LINK_LANDING: 'MAGIC_LINK_LANDING',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  VERIFICATION_FORM: 'VERIFICATION_FORM',
  OTP_ENTRY: 'OTP_ENTRY',
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ERROR: 'ERROR',
} as const

export type Step = typeof STEP[keyof typeof STEP]

// ─── Verification method options ─────────────────────────────────────────────

export type VerificationMethod = 'loan_id_email' | 'loan_id_dob' | 'ssn_dob_zip'

export type PayerType = 'self' | 'third_party'

// ─── API contract types ───────────────────────────────────────────────────────

export interface MagicLinkValidateResponse {
  step: typeof STEP.VERIFICATION_FORM | typeof STEP.TOKEN_EXPIRED
  /** Partial loan info pre-loaded from the magic link token */
  loan_id?: string
  masked_email?: string
}

export interface VerifyIdentityRequest {
  loan_id?: string
  method: VerificationMethod
  payer_type: PayerType
  /** Provided when method is loan_id_email */
  email?: string
  /** Provided when method is loan_id_dob; format: MM/DD/YYYY */
  dob?: string
  /** Provided when method is ssn_dob_zip; 9-digit SSN */
  ssn9?: string
  /** Provided when method is ssn_dob_zip; 5-digit US ZIP */
  zip?: string
}

export interface VerifyIdentityResponse {
  step: typeof STEP.OTP_ENTRY | typeof STEP.PAYMENT_INITIATED | typeof STEP.ERROR
  /** Ephemeral session token — short-lived, payment-scoped only */
  session_token?: string
  masked_email?: string
  error?: { code: string; message: string }
}

export interface OTPVerifyRequest {
  otp_code: string
  session_token: string
}

export interface OTPVerifyResponse {
  step: typeof STEP.PAYMENT_INITIATED | typeof STEP.ERROR
  session_token?: string
  error?: { code: string; message: string }
}

export interface PaymentInitiatedResponse {
  step: typeof STEP.PAYMENT_INITIATED
  ari: string
  session_token: string
  data: {
    loan_id: string
    merchant_name: string
    next_due_date: string
    payment_amount_options: PaymentAmount[]
    instruments: PaymentInstrument[]
    new_payment_method_options: NewPaymentMethod[]
    flow_copy: {
      heading: string
      subheading: string
      payment_authorization: string
    }
  }
}

export interface PaymentConfirmRequest {
  instrument_ari: string
  amount: number
  payment_date: string
  session_token: string
  payment_authorization_evidence: string
}

export interface PaymentConfirmedResponse {
  step: typeof STEP.PAYMENT_CONFIRMED
  data: {
    payment_amount: string
    instrument_description: string
    merchant_name: string
    payment_date: string
  }
}

// ─── Session state ────────────────────────────────────────────────────────────

export interface UPaySession {
  token: string
  loanId: string
  expiresAt: number
  step: Step
}
