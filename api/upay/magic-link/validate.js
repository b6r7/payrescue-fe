export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  await sleep(400)
  const { token } = req.body

  if (token === 'expired') {
    return res.json({ step: 'TOKEN_EXPIRED' })
  }

  return res.json({
    step: 'VERIFICATION_FORM',
    loan_id: 'LN-20250428-00042',
    masked_email: 'j***@gmail.com',
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
