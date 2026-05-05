export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  await sleep(500)
  const { method, payer_type } = req.body

  if (method === 'loan_id_dob' || payer_type === 'third_party') {
    return res.json({
      step: 'PAYMENT_INITIATED',
      session_token: 'mock-ephemeral-session-abc123',
    })
  }

  return res.json({
    step: 'OTP_ENTRY',
    session_token: 'mock-ephemeral-session-abc123',
    masked_email: 'j***@gmail.com',
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
