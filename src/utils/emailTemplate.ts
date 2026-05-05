/**
 * Affirm-branded magic link email HTML template.
 * Matches the Figma "Payment Failure Email Updates" design (node 666:9888).
 * The "Pay now" button is wired to the magic link URL for demo validation.
 */
export const buildMagicLinkEmail = (magicLinkUrl: string, recipientEmail: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AutoPay failed — action required</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table width="568" cellpadding="0" cellspacing="0" border="0" style="max-width:568px;width:100%;">

          <!-- ── HEADER: Logo ── -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:36px 20px 20px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="78" height="39" fill="none" viewBox="0 0 78 39">
                <path fill="#121319" d="M32.998 21.488h-2.84V20.39c0-1.44.833-1.856 1.552-1.856.796 0 1.401.341 1.401.341l.947-2.196s-.984-.644-2.764-.644c-2.007 0-4.279 1.136-4.279 4.657v.796H22.32V20.39c0-1.44.833-1.856 1.553-1.856.416 0 .946.076 1.4.341l.947-2.196c-.568-.34-1.514-.644-2.764-.644-2.007 0-4.279 1.136-4.279 4.657v.796H17.36v2.423h1.817v8.481h3.105v-8.481h4.771v8.481h3.105v-8.481h2.84zM40.571 21.488v10.904h3.105V27.13c0-2.499 1.515-3.218 2.575-3.218.416 0 .984.113 1.325.378l.568-2.877a4 4 0 0 0-1.401-.265c-1.59 0-2.613.72-3.294 2.158v-1.817z"/>
                <path fill="#121319" fill-rule="evenodd" d="M11.302 21.185c-1.78 0-3.862.833-4.998 1.741l1.022 2.159c.909-.833 2.348-1.515 3.673-1.515 1.25 0 1.931.417 1.931 1.25 0 .568-.454.833-1.325.946-3.219.417-5.755 1.288-5.755 3.787 0 1.969 1.4 3.18 3.597 3.18 1.552 0 2.953-.87 3.635-2.007v1.666h2.915v-7.118c0-2.916-2.044-4.09-4.695-4.09m-1.098 9.239c-.833 0-1.212-.417-1.212-1.06 0-1.25 1.363-1.667 3.9-1.932 0 1.666-1.136 2.992-2.688 2.992" clip-rule="evenodd"/>
                <path fill="#121319" d="M59.125 23.116c.643-.947 1.855-1.931 3.521-1.931 2.007 0 3.635 1.211 3.597 3.673v7.534h-3.105v-6.55c0-1.439-.87-2.045-1.704-2.045-1.022 0-2.044.947-2.044 2.992v5.603h-3.105V25.88c0-1.515-.795-2.083-1.704-2.083-.985 0-2.045.985-2.045 2.992v5.603h-3.105V21.488h2.992v1.666c.53-1.06 1.666-1.97 3.332-1.97 1.514 0 2.764.72 3.37 1.932M34.854 21.488h3.105v10.904h-3.105z"/>
                <path fill="#4a4af4" d="M53.028 6.266c-8.406 0-15.94 5.83-18.061 13.366h3.067c1.78-5.604 7.838-10.527 14.994-10.527 8.747 0 16.282 6.665 16.282 17.001 0 2.31-.303 4.43-.871 6.286h2.953l.038-.114c.492-1.893.72-3.976.72-6.172 0-11.51-8.407-19.84-19.122-19.84"/>
              </svg>
            </td>
          </tr>

          <!-- ── TITLE ── -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 50px 0;">
              <p style="margin:0;font-size:28px;font-weight:600;color:#1f2937;line-height:32px;">
                AutoPay failed for your Payrescue plan
              </p>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 50px 40px;">

              <!-- Description -->
              <p style="margin:0 0 24px;font-size:16px;font-weight:400;color:#1f2937;line-height:24px;">
                We couldn&rsquo;t process your <strong style="font-weight:600;">$100.00</strong> payment due <strong style="font-weight:600;">today</strong> using <strong style="font-weight:600;">your payment method</strong>. Make a one-time payment <strong style="font-weight:600;">today</strong>. Check your balance before paying or use a different payment method.
              </p>

              <!-- Pay now CTA -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" bgcolor="#4a4af4" style="background-color:#4a4af4;border-radius:8px;padding:11px 24px;">
                    <a href="${magicLinkUrl}" style="display:inline-block;font-size:18px;font-weight:600;color:#ffffff;text-decoration:none;line-height:26px;white-space:nowrap;">
                      Pay now
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Help link -->
              <p style="margin:0 0 16px;font-size:16px;color:#1f2937;line-height:24px;">
                Read about <a href="https://www.affirm.com/help/articles/payment-failed" style="color:#4a4af4;text-decoration:none;">failed payments</a> and how to avoid them in our Help Center.
              </p>

              <!-- Info box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td bgcolor="#e6e6fc" style="background-color:#e6e6fc;border-radius:4px;padding:10px 14px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td valign="top" width="24" style="padding-right:10px;padding-top:5px;">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="7" cy="7" r="6.5" stroke="#4a4af4" stroke-width="1"/>
                            <rect x="6.4" y="6" width="1.2" height="5" rx="0.5" fill="#4a4af4"/>
                            <rect x="6.4" y="3.2" width="1.2" height="1.2" rx="0.5" fill="#4a4af4"/>
                          </svg>
                        </td>
                        <td>
                          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#101820;line-height:21px;">Your on-time payments matter</p>
                          <p style="margin:0;font-size:14px;font-weight:400;color:#101820;line-height:21px;">Missing a due date limits your ability to make new pay-over-time purchases with Affirm.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td bgcolor="#f9fafb" style="background-color:#f9fafb;padding:40px 50px;">

              <p style="margin:0 0 8px;font-size:16px;font-weight:400;color:#6b7280;line-height:24px;">
                Plan ID: DEMO-${new Date().getFullYear()}
              </p>
              <p style="margin:0 0 8px;font-size:16px;font-weight:400;color:#6b7280;line-height:24px;">
                If you need help, <a href="https://www.affirm.com/help" style="color:#4a4af4;text-decoration:none;">visit our Help Center</a>.
              </p>
              <p style="margin:0 0 24px;font-size:16px;font-weight:400;color:#6b7280;line-height:24px;">
                You received this email because you made a purchase with Affirm. Visit
                <a href="https://www.affirm.com" style="color:#4a4af4;text-decoration:none;">affirm.com</a>
                for our
                <a href="https://www.affirm.com/terms" style="color:#4a4af4;text-decoration:none;">Terms of Service</a>
                and
                <a href="https://www.affirm.com/privacy" style="color:#4a4af4;text-decoration:none;">Privacy Policy</a>.
              </p>

              <!-- Social icons -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:16px;">
                    <a href="https://twitter.com/affirm" style="text-decoration:none;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" fill="#6B7280"/>
                      </svg>
                    </a>
                  </td>
                  <td style="padding-right:16px;">
                    <a href="https://facebook.com/affirm" style="text-decoration:none;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#6B7280"/>
                      </svg>
                    </a>
                  </td>
                  <td>
                    <a href="https://instagram.com/affirm" style="text-decoration:none;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="#6B7280"/>
                      </svg>
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
