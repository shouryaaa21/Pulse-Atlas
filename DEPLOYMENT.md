# PulseAtlas deployment

PulseAtlas is intentionally split into two Vercel projects:

- `medical-console` — Next.js frontend
- `health-backend` — Express API exposed through a Vercel Node function

## 1. Create the database

Use a hosted PostgreSQL provider such as Neon, Supabase, or Vercel Postgres. Copy its connection string into `health-backend/.env` locally and run:

```bash
cd health-backend
npm install
npx prisma migrate dev --name init
```

For a fresh production database, run `npx prisma migrate deploy` once from a trusted machine or CI job.

## 2. Deploy the API

Create a Vercel project pointing at the repository root, set **Root Directory** to `health-backend`, and add:

- `DATABASE_URL` — production PostgreSQL URL
- `FRONTEND_ORIGIN` — the final frontend URL (commas are supported for multiple origins)

Vercel detects `vercel.json` and serves the API at `/api/*`. Verify `/api/health` after deployment.

## 3. Deploy the frontend

Create a second Vercel project with **Root Directory** set to `medical-console`. Add:

- `NEXT_PUBLIC_API_URL` — the deployed backend URL, for example `https://pulseatlas-api.vercel.app`

The frontend build command is `npm run build` and the output is handled by Next.js automatically.

## 4. Local development

```bash
cd health-backend && cp .env.example .env && npm install && npm run dev
cd medical-console && cp .env.local.example .env.local && npm install && npm run dev
```

The frontend defaults to `http://localhost:4000` for the API.
