export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  await sleep(400)

  return res.json({
    step: 'PAYMENT_INITIATED',
    ari: 'ari:affirm:charge:us:1:charge_mock_abc123',
    session_token: 'mock-ephemeral-session-abc123',
    data: {
      loan_id: 'LN-20250428-00042',
      merchant_name: 'Apple',
      next_due_date: '2026-05-15',
      payment_amount_options: [
        {
          type: 'upcoming_amount',
          amount: 12500,
          formatted_amount: '$125.00',
          label_flow_copy_key: 'upcoming_payment_label',
          subtext_flow_copy_key: 'upcoming_due_date_subtext',
        },
        {
          type: 'overdue_amount',
          amount: 25000,
          formatted_amount: '$250.00',
          label_flow_copy_key: 'overdue_input_label',
          subtext_flow_copy_key: 'overdue_input_label_subtext',
        },
        {
          type: 'remaining_amount',
          amount: 87500,
          formatted_amount: '$875.00',
          label_flow_copy_key: 'remaining_input_label',
        },
        {
          type: 'other_amount',
          amount: 0,
          formatted_amount: '',
          label_flow_copy_key: 'other_input_label',
        },
      ],
      instruments: [],
      new_payment_method_options: [
        { flow_copy_key: 'add_apple_pay_option', action_key: 'apple_pay' },
        { flow_copy_key: 'add_debit_card_option', action_key: 'add_card', card_type: 'debit' },
      ],
      flow_copy: {
        heading: 'Make a payment',
        subheading: 'Apple · LN-20250428-00042',
        payment_authorization: 'By confirming, you authorize Affirm to process this payment.',
      },
    },
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
