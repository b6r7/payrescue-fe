# Payment Rescue
### Affirm Hackathon — May 2026

**Team:** Rachel, Anupama, Caio, Bart, Krzysztof  
**Role:** Product Design + Frontend Engineering (Bart)  
**Stack:** React · TypeScript · Vite · CSS Modules · Framer Motion · MSW · Resend · Python FastAPI · LangChain · Claude Sonnet  
**Scope:** 2-day hackathon prototype — design system integration, full UI, mock backend, AI risk-scoring service

---

## The problem

Affirm has one auth gate for two different trust contracts.

Logging in grants capabilities. Paying fulfills an obligation. The gate optimizes for the wrong one: paying is harder than defaulting, and every friction point deletes the purest signal in lending — a user trying to pay us when we've made it hard.

| Signal | Number | Label |
|--------|--------|-------|
| Locked-out Affirm users | 3.9M | documented |
| Lockouts that are phone-related | 89% | documented |
| Users/month failing SSPC with payment due in 7 days | 80,000 | documented |
| SSPC failure rate | ~50% | estimated |
| Support calls/year just to pay by phone | 330,000 | estimated |
| At-risk annual payment GMV | ~$120M | estimated |

The locked-out user is the most extreme case. The actual problem is broader: anyone with a payment due, hitting friction.

---

## The approach

One surface, one mechanism, one moment, one action.

- **Surface:** `/payment-rescue`
- **Mechanism:** identifier-pair form. Trust Pulse AI risk scoring is a stretch goal layered on top.
- **Moment:** payment due or past due, user can't or won't log in
- **Action:** pay one loan

### Why email OTP instead of KBA

Knowledge-Based Authentication was the original plan. It was removed because:

1. KBA questions are largely answerable from breach corpora — SSN4 and DOB are effectively public
2. Email OTP provides actual proof-of-control of an identity — not just knowledge of facts
3. Removes the need for a question library, distractor generation, and answer-grading logic entirely

`WHY` Email OTP is a strictly stronger signal than KBA for the locked-out use case.  
`TRADE-OFF` Users who have also lost email access have no path. The explicit fallback is customer support — documented as a hard boundary, not papered over.

### Why no card-on-file

Every payment uses a freshly-added instrument. The session is authorized for one payment only.

`WHY` This is a security posture decision, not a product limitation. Surfacing wallet inventory in an auth-light session creates unacceptable account-enumeration risk.  
`TRADE-OFF` Repeat users have to re-enter their card. That friction is intentional — Payment Rescue is a one-time rescue, not a payment shortcut.

---

## Valid identifier pairs

The user provides any 2 factors. At least one must be a lookup so the system can resolve the right user.

| Factor | Type | Notes |
|--------|------|-------|
| Loan ID | Lookup | Resolves directly to a loan |
| Email | Lookup + OTP | Triggers email OTP for ownership proof |
| DOB | Confirmation | Knowledge factor |
| SSN4 | Confirmation | Knowledge factor |

| Pair | OTP required? |
|------|--------------|
| Email + Loan ID | Yes |
| Email + DOB | Yes |
| Email + SSN4 | Yes |
| Loan ID + DOB | No |
| Loan ID + SSN4 | No |
| DOB + SSN4 | **Invalid** — no lookup factor |

---

## User journeys

### J1 — Locked-out Maria (headline case)

`TRIGGER` → Maria has a payment due, can't get into her account (lost phone)

1. Lands on `/payment-rescue`
2. Enters Email + Loan ID
3. Receives email OTP, enters 4-digit code
4. Payment screen: merchant + amount + due date + instrument selector
5. Adds debit card, taps Pay
6. Confirmation → recovery CTA pointing to SSPC for full account recovery

*If Trust Pulse ships:* Email + Loan ID + known device + geo match → score 0.12 (low) → fast-lane, OTP step skipped.

---

### J2 — Multi-loan Marcus (disambiguation)

Same user-visible flow as J1. All work is server-side.

Resolution rule:
1. Resolve user from identifier pair
2. List loans with payments due
3. 0 due → "You're all caught up" state
4. 1 due → surface it
5. Multiple due → most overdue → soonest due

User never sees a loan list. "Wrong loan?" link routes to full login, never to a loan picker.

---

### J3 — Attacker Eve (blocked)

`TRIGGER` → Eve has phished Email + SSN4. Attempts self-serve.

- Pair validates (email + SSN4 match)
- OTP sent to Maria's inbox — Eve doesn't have access
- OTP fails → redirect to customer support

*If Trust Pulse ships:* Novel device + ZIP mismatch (record: 94103, IP geo: Lagos) → score 0.84 (high) → blocked before OTP step.

---

### J4 — All-caught-up Alex (nothing due)

Valid pair + OTP pass → 0 loans due → "You're all caught up" state. This state only surfaces *after* successful verification. An invalid pair never reaches this branch — leaking "this user has no loans due" is acceptable behind the email-OTP gate.

---

## Screens built

| Screen | Description |
|--------|-------------|
| **AffirmSignIn** | Mimics `affirm.com/user/signin`. Phone entry → "That phone number is invalid" modal → 3-button group: Continue / Update my phone number / Make a payment without logging in |
| **VerificationForm** | "Enter your information" — Loan ID + Email (OTP) or Date of Birth tab selector. Auto-formatted DOB (MM/DD/YYYY). "Where do I find this?" tooltip (desktop) / bottom drawer (mobile) |
| **OTPEntry** | 4-digit code entry. Real email delivery via Resend API |
| **PaymentInitiated** | Apple Pay, on-file Visa, add new credit card, add bank account — unified container. Click-to-copy Loan ID with clipboard → checkmark feedback |
| **PaymentConfirmed** | Amount paid, timestamp, next payment date. Recovery CTA → SSPC |
| **DemoSender** | Internal demo tool: enter email → sends real magic link → shows URL directly even if delivery fails |

---

## Trust Pulse — AI risk scoring

**Status:** stretch goal. M1 demos cleanly without it. Build only after core flow is solid.

**One job:** score a Payment Rescue request as low/med/high risk via a Claude LLM call. Output is advisory — `risk_framework` decides, Trust Pulse advises.

### Architecture

```
Payment Rescue request
        │
        ▼
POST /score (localhost:8001, 1.5s hard timeout)
        │
        ├─ Anthropic Claude Sonnet (claude-sonnet-4-6)
        │   Temperature: 0 / Structured output via Pydantic
        │   Latency target: <1s p95
        │
        └─ On failure → fixture cache (serve in <100ms)
                └─ Unknown loan_ari → default {score: 0.5, tier: "med"}
```

### Input signals

- Device fingerprint novelty (known / novel)
- IP geolocation
- ZIP-of-record vs IP-derived ZIP (mismatch flag)
- Account age (days)
- Prior payment count
- Collections status
- Request anomalies (high request rate, header mismatch)
- Identifier pair strength (strong / moderate / weak)

### Output

```json
{
  "score": 0.12,
  "tier": "low",
  "reasoning": "Known device, trusted geo, account history consistent. Strongest pair entered.",
  "source": "live"
}
```

Score-to-tier mapping is enforced in code post-parse — not trusted from LLM output.

### Demo scenarios

| Scenario | Score | Tier | Fast lane? |
|----------|-------|------|-----------|
| Maria — known device, ZIP match, 2yr account, strong pair | 0.12 | low | Yes — OTP skipped |
| Marcus — multi-loan, known device, strong pair | 0.34 | med | No — standard OTP |
| Eve — novel device, ZIP mismatch, weak pair | 0.84 | high | Blocked before OTP |

### Resilience contract

Every failure path lands the user on standard email OTP. Nothing breaks visibly.

| Failure | Behavior |
|---------|---------|
| Anthropic timeout (>1.2s) | Serve fixture cache |
| Anthropic 5xx / 429 | Serve fixture cache |
| Malformed LLM JSON | Pydantic parse fails → serve fixture cache |
| Trust Pulse service down | Main backend times out at 1.5s → default `tier=med` |
| `TRUST_PULSE_ENABLED=false` | Service never called → default `tier=med` |

---

## What failed / what was removed

**KBA flow** — Removed entirely. Email OTP is strictly stronger. No question library needed.

**Card-on-file picker** — Removed for security posture. Fresh instrument every time.

**"Can't pay?" rescue card on sign-in** — Removed after the 3-button group (Continue / Update phone / Pay without login) made it redundant.

**Direct Resend API calls** — Failed due to browser CORS. Fixed by adding a Vite dev proxy (`/api/send-email` → `https://api.resend.com`).

**MSW service worker scope** — Failed silently. Wrong `base` config meant API calls weren't being intercepted by the mock worker. Fixed by adding `Service-Worker-Allowed: /` header in Vite config and explicitly setting `scope: '/'` on registration.

**`@affirm/components-core` import** — Can't be imported directly into a Vite project without Affirm Artifactory credentials. Resolved by lifting design tokens manually — 13 CSS modules updated to use Affirm DS custom properties.

---

## Cost comparison — Trust Pulse vs Onfido

| | Onfido (full biometric IDV) | Trust Pulse |
|---|---|---|
| Per-check cost | ~$1.50 (enterprise estimate) | ~$0.003 (Claude Sonnet API) |
| Annual checks (80K/mo) | 960,000 | 960,000 |
| Annual cost | ~$1,440,000 | ~$2,880 |
| **Net savings** | | **~$1.44M/year** |

**500× cheaper per verification.** And the security posture is different — Trust Pulse scores behavioral signals, not biometric ID documents. The two aren't direct substitutes, but for the locked-out payment use case, email OTP + behavioral scoring covers the threat model without a full IDV vendor contract.

---

## Outcomes

| Metric | Value | Label |
|--------|-------|-------|
| At-risk annual payment GMV | $120M | estimated |
| Recoverable GMV (15% conversion) | $18M/year | estimated |
| Cost reduction vs Onfido | 500× | estimated |
| Annual cost avoidance | ~$1.44M | estimated |
| Trust Pulse latency | <500ms p95 | directional |
| Fallback latency (cache) | <100ms | directional |
| Prototype build time | 2 days | documented |

---

## Production path (~1 quarter, post-hackathon)

| Item | Effort |
|------|--------|
| Productionize payment-rescue product-flow module | ~1–2 weeks |
| Productionize repayment-experience gRPC handler | ~2 weeks |
| Trust Pulse: real device/IP/behavioral pipeline, evals, A/B | ~2 weeks |
| Fraud-middleware bypass / route allowlist (risk team) | calendar dependency |
| Compliance pre-read | calendar dependency |

**Future scope:** magic-link entry — tokenized URLs in payment comms, 15-min TTL single-use JWTs (`{sub: loan_ari, aud: payment_rescue, scope: pay_one, exp: now+15min, jti: uuid}`). One tap from email to paid in ~5 seconds.

---

## How we think

**Authorization surface ≠ payment surface.** Affirm's login gate was built to authorize account access — not to fulfill payment obligations. These are different trust contracts. We built a surface that handles only the latter, which is why it can be lighter and more accessible without compromising security on account capabilities.

**Friction is a signal, not a feature.** Every point where a user abandons a payment attempt is lost revenue and lost lending signal. The design goal wasn't to make paying "easier" — it was to remove friction that serves no security purpose, while preserving friction that does.

**AI advises. Rules decide.** Trust Pulse outputs a score and reasoning. It never makes the final auth call. `risk_framework` decides what to do with the score. This is the correct posture for an AI component in a high-stakes auth flow — augment existing decision authority, don't replace it.

**Resilience is a product feature.** Trust Pulse is architected to fail invisibly. The main flow has zero dependency on the AI service being up. The user experience doesn't degrade — it just doesn't get the fast lane. Every failure mode was designed before the happy path.

---

*Payment Rescue — Affirm Hackathon, May 2026*  
*For questions: bart.andrzejewski@affirm.com*
