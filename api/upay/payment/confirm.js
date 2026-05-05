export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  await sleep(600)

  return res.json({
    step: 'PAYMENT_CONFIRMED',
    data: {
      payment_amount: '$125.00',
      instrument_description: 'Visa Debit ••••4242',
      merchant_name: 'Apple',
      payment_date: new Date().toISOString().split('T')[0],
    },
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
