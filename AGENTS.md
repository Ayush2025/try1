# AGENTS.md

## Cursor Cloud specific instructions

### Product
Single full-stack app: **BrainMate AI** (EdTech). Educators create AI tutors from uploaded
content; students chat with them. One Node process serves both the Express API and the Vite
React client on **port 5000** (`client/`, `server/`, `shared/`). Package manager is **npm**.

### Services / how to run
- Dev server (API + client together): `npm run dev` → http://localhost:5000 (dev binds `localhost`).
- Type-check: `npm run check` (see caveat below).
- Build (prod): `npm run build`; run prod build: `npm start`.
- DB schema push: `npm run db:push` (drizzle-kit).
- There is **no test or lint suite** configured (no Jest/Vitest/ESLint, no `test`/`lint` scripts).
  `npm run check` (tsc) is the only automated verification.

### Database
- Uses PostgreSQL via the **Neon serverless driver over WebSocket**. `DATABASE_URL` (in `.env`)
  points to a hosted Neon instance, so no local Postgres is needed. The app throws on startup if
  `DATABASE_URL` is unset (`server/db.ts`).
- Sessions use `connect-pg-simple` with `createTableIfMissing: false`, so the `sessions` table must
  already exist. Run `npm run db:push` if login fails with a missing-table error (schema is normally
  already in sync).

### Known caveats (non-obvious)
- **Dev-mode frontend is currently broken (code bug, not setup).** In `npm run dev` every route
  renders blank with `Uncaught SyntaxError: ... simli-client/dist/client.js ... does not provide an
  export named 'LogLevel'`. `client/src/components/chat/simliTeacherAvatar.tsx` uses ESM named
  imports (`import { LogLevel, SimliClient } from "simli-client/dist/client.js"`) from a CommonJS
  file that Vite's dev server does not convert to ESM. Because `chat.tsx` / `avatar-demo.tsx` are
  statically imported in `App.tsx`, this breaks all pages. `npm run build` (Rollup) is unaffected and
  succeeds, so the production build (`npm start`) renders fine. Fixing dev requires a code/config
  change (e.g. `optimizeDeps.include: ['simli-client']` in `vite.config.ts`, or a namespace/default
  import) — do not treat it as an environment/dependency problem.
- `npm run check` currently **fails on pre-existing syntax errors** in
  `client/src/pages/dashboard-broken.tsx` and `client/src/components/ar/SimpleAR.tsx`. These are
  unused/stale files unrelated to setup; the dev server still runs fine. Do not treat this tsc
  failure as an environment problem.
- **AI features require a valid `GROQ_API_KEY`.** The keys committed in `.env`/`.env.example` are
  invalid (Groq returns 401). Auth, tutor CRUD, and chat-session creation all work without it, but
  AI chat responses / quiz / flashcard generation will 401 until a valid `GROQ_API_KEY` is set.
- Optional integrations (Razorpay payments, OpenAI, HeyGen/Simli avatars) are feature-gated and
  absent keys do not block startup.
- Active auth is local email/password in `server/auth.ts` (`server/replitAuth.ts` is not wired in),
  despite older docs (`replit.md`) mentioning Replit Auth.
