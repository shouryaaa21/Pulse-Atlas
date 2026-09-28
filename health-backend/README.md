# Health Console — Backend

An Express + TypeScript + PostgreSQL API that feeds the frontend from
real, public health data sources instead of invented content:

- **MedlinePlus** (U.S. National Library of Medicine / NIH) — condition
  and health-topic search
- **PubMed** (NCBI/NIH) — real, current research citations for a
  condition, to back up claims with actual sources
- **WHO Global Health Observatory** — 2,000+ country-level health
  indicators (life expectancy, maternal mortality ratio, premature NCD
  mortality to start, searchable for more)
- **CDC RSS feeds** (3 feeds: newsroom, travel notices, emerging
  infectious diseases) — real, live health news/outbreak items

None of this data is written by hand — it's fetched from these sources
at request time (and cached in Postgres so we're not hammering the
external APIs).

## 1. Install PostgreSQL

If you don't have Postgres yet:

1. Download it from https://www.postgresql.org/download/windows/ and run
   the installer.
2. During install, it'll ask you to set a password for the `postgres`
   user — remember it, you'll need it in step 2.
3. Leave the port as the default (5432).

## 2. Configure the database connection

1. Copy `.env.example` to a new file named `.env` in this folder.
2. Edit `DATABASE_URL` in `.env` — replace `yourpassword` with the
   Postgres password you set, and `health_console` with whatever
   database name you want (Postgres doesn't need it to exist yet —
   the next step creates it).

## 3. Install dependencies and create the tables

```bash
npm install
npx prisma migrate dev --name init
```

The second command reads `prisma/schema.prisma`, creates the
`health_console` database if it doesn't exist, and creates all the
tables.

## 4. Run it

```bash
npm run dev
```

You should see:

```
Health console API listening on http://localhost:4000
Ingested N news items on startup
```

## Try it

With the server running, open these in a browser (or use them from the
frontend):

- `http://localhost:4000/api/health` — should return `{"status":"ok"}`
- `http://localhost:4000/api/conditions/search?q=migraine` — real
  MedlinePlus data
- `http://localhost:4000/api/conditions/citations?q=migraine` — real,
  current PubMed research articles
- `http://localhost:4000/api/regions/indicator?country=IND&indicator=lifeExpectancy`
  — real WHO data for India
- `http://localhost:4000/api/regions/search-indicators?q=diabetes` —
  searches WHO's full indicator catalog by keyword, so you can find a
  real code for anything not already in the shortcut list
- `http://localhost:4000/api/news/latest` — the news items ingested on
  startup

## Connecting the frontend

In the Next.js project, the simplest approach is to fetch these
endpoints from your components (e.g. in `LookupPanel.tsx`, replace the
placeholder `content` object with a `fetch("http://localhost:4000/api/conditions/search?q=...")`
call) or set up a proxy in `next.config.mjs`. Ask me when you're ready
to wire a specific piece up and I'll make the exact edit.

## Adding more WHO indicators

`src/services/who.ts` has an `INDICATORS` map with three confirmed
shortcuts (`lifeExpectancy`, `maternalMortalityRatio`,
`prematureNCDMortality`). You don't have to add more by hand — the
`/api/regions/search-indicators?q=...` endpoint searches WHO's entire
live catalog for you, so you can pass any real code straight into
`/api/regions/indicator?indicator=<code>` without ever typing it into
this file. Add a friendly name to `INDICATORS` only if you want a
short alias for one you use often.

## Adding more news feeds

`src/services/news.ts` has a `FEEDS` array — add `{ name, url }` for
any other real RSS/Atom feed you find (WHO, national health ministries,
etc.) and it'll be ingested the same way.

## Important limits, honestly stated

- MedlinePlus gives one consolidated overview per topic — it does not
  pre-split content into "symptoms / precautions / medical cure /
  non-medical cure / historical remedies" the way the frontend's tabs
  suggest. Getting that exact breakdown, especially the historical-use
  angle, isn't something any free API provides — it would need real
  editorial/research work (with citations) on top of this, not
  fabricated text. I've left `searchCondition` returning the honest
  MedlinePlus overview + source link; how you split that into your
  five tabs is a content decision for you or a subject-matter reviewer,
  not something to auto-generate.
- This backend has no authentication yet. `userId` in the symptom log
  is just a string you pass in — fine for local development, not fine
  to ship as-is.
- I haven't been able to run `npm install` or actually hit these APIs
  from my end (no network access in my sandbox) — the code is written
  carefully but untested end-to-end. If something throws an error when
  you run it, paste it here and I'll fix it.
