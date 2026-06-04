# AI Resume Builder

AI Resume Builder is a production-oriented SaaS foundation for an AI-powered career operating system.

## Functional Job Seeker MVP

The job seeker MVP is now wired end-to-end:

- Google / LinkedIn OAuth via NextAuth
- Protected dashboard and API routes
- Resume CRUD with version history
- AI resume generation, ATS scans, job matching, cover letters
- Application tracker with live funnel analytics
- AI career coach chat with persisted threads
- Command Center dashboard powered by PostgreSQL data

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand
- Backend: Next.js route handlers, Prisma ORM, PostgreSQL
- AI: OpenAI Responses API with structured JSON parsing
- Infrastructure: Docker, Redis-ready cache helper, S3-ready upload helper, GitHub Actions
- Auth: NextAuth, Google OAuth, LinkedIn OAuth, JWT sessions

## Getting Started

Run all commands from this folder (`ai-resume-builder/ai-resume-builder`), not the parent workspace directory.

### Quick setup with Make

```bash
make all    # install, create .env, start Docker DB, run migrations
make dev    # start http://localhost:3000
```

See `make help` for all targets (`makeall` is an alias for `all`).

```bash
cd ai-resume-builder   # if you are in the parent Desktop folder
cp .env.example .env
npm install
```

### Database (required for sign-in and saving data)

**Option A — Docker (recommended)**

1. Start **Docker Desktop** and wait until it is running.
2. Then:

```bash
docker compose up -d postgres redis
npm run db:generate
npm run db:push
```

**Option B — Hosted Postgres (no Docker)**

Set `DATABASE_URL` in `.env` to your Neon/Supabase/Railway connection string, then:

```bash
npm run db:generate
npm run db:push
```

### Run the app

```bash
npm run dev
```

Open `http://localhost:3000`, sign in, then visit `/dashboard`.

### Common errors

| Error | Fix |
|-------|-----|
| `package.json` not found | `cd` into nested `ai-resume-builder` folder |
| `Cannot connect to Docker daemon` | Open Docker Desktop, then retry `docker compose up` |
| `P1001 Can't reach database server` | Postgres is not running; start Docker + `docker compose up -d postgres` or use hosted `DATABASE_URL` |
| `zsh: command not found: #` | Do not paste comment lines; only run the commands |
| Long `callbackUrl` in the URL | Refresh `/` or sign in again (fixed in app to redirect to `/dashboard`) |

## Environment Variables

Configure `.env` from `.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, defaults to `gpt-4.1`)

## Main Routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Command Center analytics |
| `/dashboard/resumes` | Resume list and builder |
| `/dashboard/ats` | ATS intelligence scanner |
| `/dashboard/job-match` | Job description matching |
| `/dashboard/cover-letters` | Cover letter generator |
| `/dashboard/applications` | Job application tracker |
| `/dashboard/coach` | AI career coach chat |
| `/dashboard/versions` | Resume version history |

## API Endpoints

- `POST/GET /api/resumes`
- `GET/PATCH/DELETE /api/resumes/:id`
- `POST /api/resumes/:id/generate`
- `POST /api/resumes/:id/ats`
- `POST /api/ai/resume`
- `POST /api/jobs/match`
- `POST /api/cover-letter`
- `GET/POST /api/applications`
- `PATCH/DELETE /api/applications/:id`
- `GET/POST /api/coach/threads`
- `GET/POST /api/coach/threads/:id/messages`

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run db:push
```

## Deployment

```bash
docker compose up --build
```

Run Prisma migrations or `db:push` before promoting to production.

## Next Phase

Recruiter portal, Stripe billing, PDF/DOCX parsing, embeddings search, drag-and-drop builder, and enterprise RBAC enforcement remain for the next release.
