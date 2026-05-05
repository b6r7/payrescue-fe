import { UPayOrchestrator } from '@/modules/upay/UPayOrchestrator'
import { DemoSender } from '@/modules/upay/flows/DemoSender'

const getParams = () => new URLSearchParams(window.location.search)

/**
 * Entry point — reads the magic link token from the URL query parameter.
 *
 * Routes:
 *   ?mode=demo           → Demo sender page (send magic links via Resend)
 *   ?token=<jwt>         → UPay payment flow
 *   (no params)          → UPay flow with default mock token
 *
 * Real email CTA URL: https://pay.affirm.com/upay?token=<jwt>
 * Dev URL:            http://localhost:5173?token=mock123
 * Dev expired:        http://localhost:5173?token=expired
 * Demo sender:        http://localhost:5173?mode=demo
 */
const App = () => {
  const params = getParams()
  const mode = params.get('mode')
  const token = params.get('token') ?? 'mock123'
  const email = params.get('e') ?? ''

  return mode === 'demo'
    ? <DemoSender />
    : <UPayOrchestrator magicLinkToken={token} recipientEmail={email} />
}

export default App
