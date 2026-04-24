# AI Review App

A full-stack demo built for the **Vibe Coding Workshop**. Customers leave a
review in seconds — the AI drafts 3 natural-sounding options (tuned by platform,
tone, length & rating) and the customer just picks one, edits if they want,
and posts. The merchant side has a dashboard for campaigns, staff, gallery,
analytics, and AI-prompt tuning.

> **Stack**: React 19 + Vite + TypeScript + Tailwind on the front, Node/Express
> on the back, Turso (libSQL) for the DB, Cloudflare R2 for images, and
> Gemini Flash Lite (with MiniMax as an auto-fallback) for the AI.

---

## 1. Quick start (5 min)

**Prerequisites:** Node.js 18+ and `npm`.

```bash
# 1. Clone
git clone https://github.com/jtpk2168/ai-review-app.git
cd ai-review-app

# 2. Install
npm install

# 3. Set up your secrets
cp .env.example .env.local
#   …then open .env.local in your editor and paste your keys.
#   The MINIMUM to run the app end-to-end is:
#     - VITE_GEMINI_API_KEY   (free → https://aistudio.google.com/apikey)
#     - TURSO_DATABASE_URL    (free → https://turso.tech)
#     - TURSO_AUTH_TOKEN

# 4. Run (two terminals)
npm run server   # backend on http://localhost:3005
npm run dev      # frontend on http://localhost:3002
```

Open **http://localhost:3002** in your browser.

### Logging in as the merchant

The first time the server starts it seeds a default admin account:

| Username | Password   |
| -------- | ---------- |
| `admin`  | `admin123` |

Visit `/merchant/login` and use those. Change the password from the Users tab
before putting this anywhere public.

---

## 2. What's where

```
├── server.js              ← Express API + Turso + R2 + AI provider logic
├── api/index.js           ← Vercel serverless entry (just re-exports server.js)
├── vite.config.ts         ← dev server config, proxies /api → :3005
├── src/
│   ├── App.tsx            ← Router + auth guard
│   ├── constants.ts       ← Brand/product/branch mocks — edit these first
│   ├── pages/
│   │   ├── customer/      ← The public review flow (CustomerFlow.tsx)
│   │   └── merchant/      ← Login + Dashboard
│   ├── components/        ← Layouts + shared UI
│   ├── context/           ← Global app state
│   └── services/
│       └── geminiService.ts  ← Frontend → /api/generate-reviews
└── .env.example           ← Copy to .env.local
```

---

## 3. Vibing with Claude Code — what to try next

This is a live demo, not a finished product. Open the repo in Claude Code and
try these prompts — they're ordered from easiest to most ambitious.

### Easy wins (5–15 min each)

- *"Replace all the Anniks Beauty branding with my own business. Update
  [src/constants.ts](src/constants.ts), [index.html](index.html), and the logos
  in [public/](public/)."*
- *"Add a new review tone called 'Professional' and wire it through the
  picker in [src/pages/customer/CustomerFlow.tsx](src/pages/customer/CustomerFlow.tsx)
  and the prompt logic in [server.js](server.js)."*
- *"Change the reward from 'Mystery Gift' to a 10% discount code. The campaign
  config lives in [src/constants.ts](src/constants.ts)."*

### Medium (30–60 min)

- *"Add a 'copy to clipboard' button next to each generated draft, with a
  toast on success."*
- *"Swap Gemini for Anthropic Claude. The provider functions are in
  [server.js](server.js) around line 110."*
- *"Add a new merchant dashboard tab that shows a leaderboard of top therapists
  by review count."*
- *"Persist the customer's language choice so returning customers skip the
  language picker."*

### Ambitious (a weekend)

- *"Replace Turso with Supabase — migrate the schema in
  [server.js](server.js) (search `CREATE TABLE`) and update the queries."*
- *"Add WhatsApp notifications when a customer submits a review, using the
  Twilio API."*
- *"Turn the customer flow into a PWA so it works offline up to the
  submit step."*

### Workflow tips

- Use `/plan` in Claude Code before bigger changes — cheaper than fixing a
  wrong implementation.
- `server.js` is big (~1800 lines). When asking Claude to change it, point at
  a route (e.g. `/api/generate-reviews`) instead of the whole file.
- The AI prompt for review generation lives in the `ai_config` table and is
  editable from the **Settings → AI** tab in the merchant dashboard — you can
  iterate on the prompt without redeploying.

---

## 4. Deploying

The `vercel.json` is already wired up. After pushing to GitHub:

1. Import the repo on [vercel.com](https://vercel.com).
2. Paste the same variables from your `.env.local` into the Vercel project's
   **Environment Variables**.
3. Deploy.

The build uses `npm run build` (Vite) for the frontend; the Express server
runs as a serverless function from `api/index.js`.

---

## 5. Troubleshooting

| Symptom                                    | Likely cause & fix |
| ------------------------------------------ | ------------------ |
| `Error: No AI provider available`          | Neither `VITE_GEMINI_API_KEY` nor `MINIMAX_API_KEY` is set in `.env.local`. |
| `TURSO_DATABASE_URL` undefined at startup  | You ran `npm run dev` before filling in `.env.local`. Fix it, then restart. |
| Frontend loads but `/api/*` calls 404      | You forgot `npm run server`. Both dev servers need to run. |
| Logged in as admin but got `403` on API    | The mock token expired/was cleared. Log out and back in. |
| R2 upload errors                           | R2 vars are blank — gallery uploads are optional; clear them to disable. |

---

## License

MIT. Fork it, rip it apart, ship your own thing.
