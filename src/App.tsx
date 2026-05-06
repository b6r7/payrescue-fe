import { UPayOrchestrator } from '@/modules/upay/UPayOrchestrator'
import { DemoSender } from '@/modules/upay/flows/DemoSender'

const getParams = () => new URLSearchParams(window.location.search)

/**
 * Entry point.
 *
 * Routes:
 *   ?mode=demo  → Demo sender page (send magic links via Resend, kept for Bart's tooling)
 *   (default)   → UPay flow, starts at IDENTITY_ENTRY (login form with two identifier pairs)
 *
 * Magic-link query params (?token=, ?e=) are still forwarded into the orchestrator
 * for the legacy MAGIC_LINK_LANDING step, but the default landing is now the
 * IDENTITY_ENTRY form — no magic link required.
 */
const App = () => {
  const params = getParams()
  const mode = params.get('mode')
  const token = params.get('token') ?? ''
  const email = params.get('e') ?? ''
  // Email-CTA pre-population. The payment-reminder email's "Make a payment"
  // link carries `?loan_id=...` so the user lands on the Confirm Loan ID
  // screen with their loan already filled in. No PII in the URL — loan_id
  // doesn't tie to user identity directly.
  const loanId = params.get('loan_id') ?? ''

  return mode === 'demo'
    ? <DemoSender />
    : <UPayOrchestrator magicLinkToken={token} recipientEmail={email} prefilledLoanId={loanId} />
}

export default App
