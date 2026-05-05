import { buildMagicLinkEmail } from './emailTemplate'

export type SendMagicLinkResult = {
  magicLinkUrl: string
  token: string
  emailSent: boolean
  error?: string
}

/**
 * Generate a demo magic link token.
 * In production this would be a signed JWT from the backend.
 */
const generateDemoToken = (email: string) =>
  `demo_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}_${Date.now()}`

/**
 * Send a magic link email via Resend's REST API.
 *
 * Called directly from the browser — requires VITE_RESEND_API_KEY to be set
 * at build time. Acceptable for internal demos; for production use the
 * Quicksilver backend's /api/upay/send-magic-link endpoint instead.
 *
 * From address: uses Resend's shared domain for demo.
 * For production: verify affirm.com domain in Resend and update FROM_ADDRESS.
 */
export const sendMagicLink = async (
  recipientEmail: string,
): Promise<SendMagicLinkResult> => {
  const token = generateDemoToken(recipientEmail)
  const baseUrl = window.location.origin
  const magicLinkUrl = `${baseUrl}?token=${token}&e=${encodeURIComponent(recipientEmail)}`

  // Email send is best-effort — the magic link is always returned regardless.
  const apiKey = import.meta.env.VITE_RESEND_API_KEY
  if (!apiKey) {
    return { magicLinkUrl, token, emailSent: false, error: 'No API key — use the link below to demo the flow.' }
  }

  const html = buildMagicLinkEmail(magicLinkUrl, recipientEmail)

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Affirm UPay <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: 'Action required: AutoPay failed for your Payrescue plan',
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = (err as { message?: string }).message ?? `Resend error ${res.status}`
      return { magicLinkUrl, token, emailSent: false, error: msg }
    }

    return { magicLinkUrl, token, emailSent: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error'
    return { magicLinkUrl, token, emailSent: false, error: msg }
  }
}
