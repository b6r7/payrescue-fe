# UPay Deployment Guide

Two hosting tiers, one decision tree:

| Your app | Use |
|---|---|
| 100% static, all mocks | **Quickhost** |
| Needs real email sending or a live backend | **Quickhost** (frontend) + **Quicksilver** (backend) |

For the hackathon demo the simplest path is **Quickhost + browser Resend** —
MSW runs in the browser and handles all payment API calls; Resend is called
directly from the `?mode=demo` sender page. No backend server required.

---

## Path A — Quickhost (recommended for the demo)

### 1. Set environment variables

```bash
cp .env.example .env.local
# Edit .env.local and set:
#   VITE_RESEND_API_KEY=re_your_key_here
#   VITE_ENABLE_MOCKS=true
```

### 2. Build

```bash
npm run build
# Output: dist/
```

### 3. Deploy to Quickhost

Follow the internal [Quickhost guide](https://www.notion.so/Product-Design-How-to-Host-on-Quickhost-v2-34440e54ae38812e8991ffb72f3ab66e)
and point it at the `dist/` folder.

### 4. Test

| URL | What it does |
|---|---|
| `https://your-quickhost-url/` | UPay flow (token=mock123) |
| `https://your-quickhost-url/?mode=demo` | Demo sender (email → Resend) |
| `https://your-quickhost-url/?token=expired` | Expired link screen |

---

## Path B — Quicksilver (full internal hosting)

The Quicksilver backend serves both the FastAPI API *and* the built React SPA
from a single container — one URL for everything.

### Prerequisites

- [ ] Access to `Affirm/lakehouse` GitHub repo  
      → Ask in `#proj-quicksilver` or your team's eng contact
- [ ] Access to Buildkite at buildkite.com/affirm-inc  
      → Sign in with Affirm SSO; ask `#proj-quicksilver` for `quicksilver-deploy` pipeline
- [ ] `RESEND_API_KEY` provisioned as a Quicksilver secret  
      → Ask in `#proj-quicksilver`: "Can you add RESEND_API_KEY to affirm-upay?"

### Step 1 — Build the React SPA

```bash
VITE_ENABLE_MOCKS=false npm run build
# This produces dist/ — all API calls will hit the Quicksilver backend
```

### Step 2 — Prepare the Quicksilver folder

```bash
# Copy built SPA into the backend directory so the Dockerfile can pick it up
cp -r dist quicksilver-deploy/backend/dist
```

### Step 3 — Copy files to your lakehouse clone

```bash
# Assuming lakehouse is cloned at ~/code/lakehouse
LAKEHOUSE=~/code/lakehouse
APP=affirm-upay

mkdir -p "$LAKEHOUSE/quicksilver/apps/$APP"
cp quicksilver-deploy/app.yaml          "$LAKEHOUSE/quicksilver/apps/$APP/"
cp quicksilver-deploy/Dockerfile        "$LAKEHOUSE/quicksilver/apps/$APP/"
cp quicksilver-deploy/service-spec.yaml "$LAKEHOUSE/quicksilver/apps/$APP/"
cp -r quicksilver-deploy/backend        "$LAKEHOUSE/quicksilver/apps/$APP/"
```

### Step 4 — Commit and open a PR

```bash
cd ~/code/lakehouse
git checkout -b add-affirm-upay
git add quicksilver/apps/affirm-upay/
git commit -m "feat: add affirm-upay to Quicksilver"
git push origin add-affirm-upay
```

Open a PR on GitHub. A bot will review it automatically — paste any bot
comments into Cursor and it'll fix them for you.

### Step 5 — Deploy via Buildkite

1. Go to buildkite.com/affirm-inc
2. Find the `quicksilver-deploy` pipeline
3. Click **New Build**
4. Add environment variable: `QS_APP_NAME=affirm-upay`
5. Click **Create Build** — wait ~10 minutes

### Step 6 — Verify

Open `https://your-qs-url/health` in a browser (Affirm SSO login required).
You should see `{"status": "ok"}`.

Then open `https://your-qs-url/?mode=demo` to send a magic link.

---

## Resend notes

- Free tier: up to 3,000 emails/month, 100/day
- The `from` address is currently `onboarding@resend.dev` (Resend's shared domain)
- For production: verify `affirm.com` domain in Resend and change to  
  `from: 'Affirm <noreply@affirm.com>'` in both `sendMagicLink.ts` and `main.py`

---

## Local development

```bash
npm install
npm run dev
# → http://localhost:5173?token=mock123        (payment flow)
# → http://localhost:5173?mode=demo            (demo sender)
```

The local Python backend is optional — MSW handles all API calls in the browser.
To run the Python backend locally anyway:

```bash
cd quicksilver-deploy
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --port 8000 --reload
```
