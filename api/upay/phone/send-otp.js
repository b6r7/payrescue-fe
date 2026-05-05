export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // In production this would trigger an actual SMS via Twilio / SNS
  return res.status(200).json({ ok: true, message: 'OTP sent' })
}
