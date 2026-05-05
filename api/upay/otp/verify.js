export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  await sleep(500)
  const { otp_code } = req.body

  if (otp_code !== '123456') {
    return res.json({
      step: 'ERROR',
      error: { code: 'INVALID_OTP', message: 'The code you entered is incorrect. Please try again.' },
    })
  }

  return res.json({
    step: 'PAYMENT_INITIATED',
    session_token: 'mock-ephemeral-session-abc123',
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
