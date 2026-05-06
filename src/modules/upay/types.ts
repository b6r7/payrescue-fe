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
  ACCOUNT_FOUND: 'ACCOUNT_FOUND',
  PORTAL_PLACEHOLDER: 'PORTAL_PLACEHOLDER',
  IDENTITY_ENTRY: 'IDENTITY_ENTRY',
  MAGIC_LINK_LANDING: 'MAGIC_LINK_LANDING',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  VERIFICATION_FORM: 'VERIFICATION_FORM',
  OTP_ENTRY: 'OTP_ENTRY',
  LOAN_SELECT: 'LOAN_SELECT',
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ERROR: 'ERROR',
} as const

export type Step = typeof STEP[keyof typeof STEP]

// ─── Verification method options ─────────────────────────────────────────────

export type VerificationMethod = 'loan_id_email' | 'ssn_dob_zip'

export type PayerType = 'self' | 'third_party'

// ─── API contract types ───────────────────────────────────────────────────────

export interface MagicLinkValidateResponse {
  step: typeof STEP.VERIFICATION_FORM | typeof STEP.TOKEN_EXPIRED
  /** Partial loan info pre-loaded from the magic link token */
  loan_id?: string
  masked_email?: string
}

// ─── Phone-recognition pre-flight on AffirmSignIn ────────────────────────────

export interface CheckPhoneRequest {
  loan_id?: string
  phone: string
}

export interface CheckPhoneResponse {
  match: boolean
  /** Display-formatted masked phone, e.g. "(207) ***-2105". Null when the
   *  backend couldn't resolve the user (no loan_id, lookup failure, etc.). */
  masked_phone?: string
  error?: { code: string; message: string }
}

export interface VerifyIdentityRequest {
  loan_id?: string
  method: VerificationMethod
  payer_type: PayerType
  /** Provided when method is loan_id_email */
  email?: string
  /** Provided when method is ssn_dob_zip; format: MM/DD/YYYY */
  dob?: string
  /** Provided when method is ssn_dob_zip; 9-digit SSN */
  ssn9?: string
  /** Provided when method is ssn_dob_zip; 5-digit US ZIP */
  zip?: string
}

export interface LoanItem {
  ari: string
  merchant_name: string
  remaining_amount: string
  overdue_amount?: string
  plan_balance?: string
  next_payment?: string
  is_overdue: boolean
  installment_label?: string
  autopay_on?: boolean
  /** 0–1 fill ratio for the progress bar */
  progress: number
}

export interface VerifyIdentityResponse {
  step: typeof STEP.OTP_ENTRY | typeof STEP.PAYMENT_INITIATED | typeof STEP.LOAN_SELECT | typeof STEP.ERROR
  /** Ephemeral session token — short-lived, payment-scoped only */
  session_token?: string
  masked_email?: string
  loans?: LoanItem[]
  error?: { code: string; message: string }
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


export interface PaymentConfirmedResponse {
  step: typeof STEP.PAYMENT_CONFIRMED
  data: {
    payment_amount: string
    instrument_description: string
    merchant_name: string
    payment_date: string
  }
}

