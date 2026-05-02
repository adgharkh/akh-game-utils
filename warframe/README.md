# Warframe Utils

This subdirectory is for tools relating to the game Warframe. For more info, check https://www.warframe.com.

## The Descendia — Community Condition Tracker

A web app for tracking the weekly randomized stage conditions across all 21 stages of The Descendia. Conditions reset every week; this tool lets the community see the current state at a glance.

### Architecture

| Layer      | Choice                  | Cost  |
|------------|-------------------------|-------|
| Frontend   | React + TypeScript, Vite | Free  |
| Hosting    | Vercel (free tier)       | Free  |
| Database   | Supabase (free tier)     | Free  |
| Domain     | `*.vercel.app` subdomain | Free  |

Supabase provides a Postgres database with a REST API and row-level security:
- **Anon key** (in the frontend): read-only access enforced by RLS policies
- **Service role key** (never in the frontend): used for admin writes only

### Data model

**`stages`** — static, seeded once (21 rows), shared across variants
- `id` (1–21), `is_choice_floor`
- Stages 7 and 14 are choice floors (pick one of two rewards; no objective/penance)
- No `label` column — stage numbers are self-describing; display formatting is handled in the frontend

**`weekly_conditions`** — one row per stage + variant per week, versioned
- `stage_id`, `variant` (`'normal'` or `'steel_path'`), `for_week_starting` (date)
- `objective`, `penance`, `reward` (normal stages; penance and reward may be null)
- `choice_option_a`, `choice_option_b` (choice floors only)
- `is_latest` (boolean), `last_updated` (timestamp), `submitted_by`
- When a correction is submitted, the old row is marked `is_latest = false` and a new row is inserted — full history is preserved

### Project structure

```
warframe/
├── README.md
├── config.yaml
├── requirements.txt          # Python deps for any helper scripts
├── db/
│   └── migrations/
│       └── 001_initial_schema.sql
├── src/                      # React/TypeScript app (Vite)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example          # Copy to .env.local — never commit secrets
│   └── src/
│       ├── main.tsx
│       ├── index.css
│       ├── App.tsx
│       ├── types/
│       │   └── descendia.ts  # Core domain types
│       ├── lib/
│       │   ├── supabaseClient.ts
│       │   ├── descendiaApi.ts
│       │   └── weekUtils.ts
│       ├── hooks/
│       │   └── useDescendiaTracker.ts
│       ├── components/
│       │   ├── ConditionTable.tsx
│       │   └── ConditionTable.module.css
│       └── pages/
│           ├── TrackerPage.tsx
│           └── TrackerPage.module.css
└── tst/
```

### Setup

#### 1. Supabase

1. Create a free project at https://supabase.com
2. In the SQL editor, run `db/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings > API**

#### 2. Frontend

```bash
cd warframe/src
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
npm install
npm run dev
```

#### 3. Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel; set the **root directory** to `warframe/src`
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in Vercel

### Submitting conditions (admin)

For now, conditions are submitted directly via the Supabase table editor or SQL.
An admin submit form (using the service role key, never exposed publicly) is planned as a next step.

### Planned features

- [ ] Admin submit form (quick entry for all 21 stages)
- [ ] Weekly countdown timer
- [ ] Hover tooltips per objective/penance
- [ ] History browser (past weeks)
- [ ] Wiki parsing for tooltip content
