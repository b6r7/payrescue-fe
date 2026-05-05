export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // Demo: any 6-digit code is accepted
  const { otp } = req.body ?? {}
  if (!otp || String(otp).replace(/\D/g, '').length < 6) {
    return res.status(422).json({ ok: false, error: 'Invalid code' })
  }
  return res.status(200).json({ ok: true, message: 'Phone verified' })
}
