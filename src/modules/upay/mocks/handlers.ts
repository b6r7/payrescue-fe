/**
 * MSW handlers — mirrors pattern from web-ux/product-flows/src/modules/repayment/mocks/handlers.ts
 *
 * Routes mirror the real UPay API surface:
 *   POST /api/upay/magic-link/validate
 *   POST /api/upay/verify-identity
 *   POST /api/upay/otp/verify
 *   POST /api/upay/payment/initiate
 *   POST /api/upay/payment/confirm
 */
import { http, HttpResponse, delay } from 'msw'
import type {
  MagicLinkValidateResponse,
  VerifyIdentityResponse,
  OTPVerifyResponse,
  PaymentInitiatedResponse,
  PaymentConfirmedResponse,
  LoanItem,
} from '../types'
import { STEP } from '../types'

const SESSION_TOKEN = 'mock-ephemeral-session-abc123'

const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return 'j***@gmail.com'
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}

export const handlers = [
  /**
   * Validate magic link token from email CTA.
   * Query param: ?token=<magic-link-token>
   * Happy path: returns VERIFICATION_FORM step.
   * Expired path: use token=expired in the URL.
   */
  http.post('/api/upay/magic-link/validate', async ({ request }) => {
    await delay(600)
    const { token, email } = await request.json() as { token: string; email?: string }

    if (token === 'expired') {
      return HttpResponse.json<MagicLinkValidateResponse>({
        step: STEP.TOKEN_EXPIRED,
      })
    }

    return HttpResponse.json<MagicLinkValidateResponse>({
      step: STEP.VERIFICATION_FORM,
      loan_id: 'LN-20250428-00042',
      masked_email: maskEmail(email ?? ''),
    })
  }),

  /**
   * Identity verification — two methods:
   *   loan_id_email  → email OTP step
   *   ssn_dob_zip    → straight to payment (no OTP, knowledge-only)
   */
  http.post('/api/upay/verify-identity', async ({ request }) => {
    await delay(800)
    const body = await request.json() as { loan_id?: string; method: string; payer_type?: string; email?: string; dob?: string; ssn9?: string; zip?: string }

    const mockLoans: LoanItem[] = [
      {
        ari: 'ari:affirm:charge:us:1:apple_mock',
        merchant_name: 'Apple',
        remaining_amount: '$1,000.00',
        overdue_amount: '$49.99',
        plan_balance: '$109.10',
        is_overdue: true,
        progress: 0.87,
      },
      {
        ari: 'ari:affirm:charge:us:1:target_mock',
        merchant_name: 'Target',
        remaining_amount: '$256.00',
        next_payment: '$49.99',
        plan_balance: '$109.10',
        is_overdue: false,
        autopay_on: false,
        progress: 0.5,
      },
    ]

    // SSN+DOB+ZIP path → show loan selector (user may have multiple plans)
    if (body.method === 'ssn_dob_zip') {
      return HttpResponse.json<VerifyIdentityResponse>({
        step: STEP.LOAN_SELECT,
        session_token: SESSION_TOKEN,
        loans: mockLoans,
      })
    }

    // Email path without Loan ID → show loan selector (can't scope to one loan)
    if (body.method === 'loan_id_email' && !body.loan_id?.trim()) {
      return HttpResponse.json<VerifyIdentityResponse>({
        step: STEP.LOAN_SELECT,
        session_token: SESSION_TOKEN,
        loans: mockLoans,
      })
    }

    // loan_id_email with loan ID → skip OTP, go straight to payment
    return HttpResponse.json<VerifyIdentityResponse>({
      step: STEP.PAYMENT_INITIATED,
      session_token: SESSION_TOKEN,
    })
  }),

  /**
   * OTP verification — 6-digit code sent to masked email.
   * Test code: 123456 → success.
   * Any other code → error.
   */
  http.post('/api/upay/otp/verify', async ({ request }) => {
    await delay(700)
    const { otp_code } = await request.json() as { otp_code: string; session_token: string }

    if (otp_code !== '123456') {
      return HttpResponse.json<OTPVerifyResponse>({
        step: STEP.ERROR,
        error: { code: 'INVALID_OTP', message: 'The code you entered is incorrect. Please try again.' },
      })
    }

    return HttpResponse.json<OTPVerifyResponse>({
      step: STEP.PAYMENT_INITIATED,
      session_token: SESSION_TOKEN,
    })
  }),

  /**
   * Payment initiation — loads loan data and available instruments.
   * Mirrors SINGLE_PAYMENT_INITIATED from web-ux repayment module.
   * Reads `merchant` from request body to return dynamic merchant-specific data.
   */
  http.post('/api/upay/payment/initiate', async ({ request }) => {
    await delay(500)
    const body = await request.json() as { session_token: string; merchant?: string }
    const merchant = body.merchant ?? 'Apple'

    return HttpResponse.json<PaymentInitiatedResponse>({
      step: STEP.PAYMENT_INITIATED,
      ari: `ari:affirm:charge:us:1:${merchant.toLowerCase()}_mock`,
      session_token: SESSION_TOKEN,
      data: {
        loan_id: 'LN-20250428-00042',
        merchant_name: merchant,
        next_due_date: '2026-05-15',
        payment_amount_options: [
          { type: 'overdue_amount', amount: 25000, formatted_amount: '$250.00', label_flow_copy_key: 'overdue_input_label', subtext_flow_copy_key: 'overdue_input_label_subtext' },
          { type: 'due_and_overdue_amount', amount: 37500, formatted_amount: '$375.00', label_flow_copy_key: 'due_and_overdue_label' },
          { type: 'remaining_amount', amount: 87500, formatted_amount: '$875.00', label_flow_copy_key: 'remaining_input_label' },
          { type: 'other_amount', amount: 0, formatted_amount: '', label_flow_copy_key: 'other_input_label' },
        ],
        instruments: [
          { ari: 'ari:affirm:instrument:apple_pay', label: 'Apple Pay', instrument_type: 'apple_pay' },
          { ari: 'ari:affirm:instrument:visa_1231', label: 'Visa •••• 1231', instrument_type: 'credit' },
        ],
        new_payment_method_options: [
          { flow_copy_key: 'add_card_option', action_key: 'add_card' },
          { flow_copy_key: 'launch_plaid_option', action_key: 'launch_plaid' },
        ],
        flow_copy: {
          heading: 'Make a payment',
          subheading: `${merchant} · LN-20250428-00042`,
          payment_authorization: 'By confirming, you authorize Affirm to process this payment.',
        },
      },
    })
  }),

  /**
   * Payment confirmation.
   */
  http.post('/api/upay/payment/confirm', async () => {
    await delay(1000)

    return HttpResponse.json<PaymentConfirmedResponse>({
      step: STEP.PAYMENT_CONFIRMED,
      data: {
        payment_amount: '$125.00',
        instrument_description: 'Visa Debit ••••4242',
        merchant_name: 'Apple',
        payment_date: '2026-04-28',
      },
    })
  }),
]
