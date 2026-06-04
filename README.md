# AI Resume Builder (workspace)

The Next.js app lives in the nested folder:

```bash
cd ai-resume-builder
```

Then run setup (choose one):

```bash
make all          # install + .env + docker + database
make dev          # start dev server
```

Or manually:

```bash
cp .env.example .env
docker compose up -d postgres redis
npm run db:generate
npm run db:push
npm run dev
```
