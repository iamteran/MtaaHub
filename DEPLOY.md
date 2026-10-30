# Deploying MtaaHub to Vercel

The app is a standard Next.js 14 project, so Vercel handles it well. The only real blocker is the
database: **SQLite cannot run on Vercel.** Serverless functions get an ephemeral filesystem, so the
`prisma/dev.db` file is lost on every cold start. You need a hosted Postgres instance first.

This guide assumes [Neon](https://neon.tech) (free tier, no card) — Supabase or Vercel Postgres work
the same way, only the connection string differs.

---

## 1. Create the database

1. Sign in at <https://neon.tech> and create a project (region: `eu-central-1` or `aws-eu-west-1` is
   closest to Kenya).
2. From **Connection Details** copy two strings:
   - **Pooled** connection — host contains `-pooler`. This is the runtime URL.
   - **Direct** connection — same host without `-pooler`. Used for migrations.

They look like:

```
postgresql://user:pass@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
postgresql://user:pass@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## 2. Point Prisma at Postgres

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Add `directUrl` so migrations bypass the pooler (PgBouncer does not support all the statements
Prisma migrations need).

Your local `.env`:

```env
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

> The schema was written for SQLite, so enums are plain `String` columns and lists are JSON inside
> `String`. Those are valid on Postgres too — **no application code changes are required**, only the
> datasource provider.

## 3. Create the schema and seed

```bash
npx prisma migrate dev --name init     # creates prisma/migrations/*, applies it, regenerates client
npm run db:seed                        # 95 locations, demo users, listings, jobs, services, prices
```

Commit the generated `prisma/migrations/` directory — Vercel needs it.

## 4. Push to GitHub

```bash
git add -A
git commit -m "chore: postgres for deployment"
git push origin main
```

## 5. Import into Vercel

1. <https://vercel.com/new> → import `iamteran/MtaaHub`.
2. Framework preset: **Next.js** (auto-detected). Build command and output stay default.
3. Add the environment variables (Production **and** Preview):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** URL |
| `DIRECT_URL` | Neon **direct** URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` — must not be the dev value |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` (update after the first deploy if the domain is custom) |
| `GOOGLE_CLIENT_ID` | optional — omit and the Google button disappears |
| `GOOGLE_CLIENT_SECRET` | optional |

4. **Deploy.**

`package.json` already has `"postinstall": "prisma generate"`, so the Prisma client is built on
Vercel before `next build` runs.

## 6. After the first deploy

- If you created the schema *before* importing, you are done — the seed data is already in Neon.
- Otherwise run migrations once from your machine against Neon:
  ```bash
  $env:DATABASE_URL="<pooled>"; $env:DIRECT_URL="<direct>"; npx prisma migrate deploy
  npm run db:seed
  ```
- Sign in at `https://<project>.vercel.app/auth/signin` with `admin@mtaahub.co.ke` / `Password123!`
  and open `/admin` to confirm the staff guard works.

**Change the seeded password before sharing the URL.** It is public in this repository.

---

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| `the URL must start with the protocol postgresql://` | schema still says `sqlite`, or `DATABASE_URL` is the old `file:./dev.db` | update both |
| `PrismaClientInitializationError` at runtime | env var missing on Vercel (only set for Production, not Preview) | add to all environments |
| Build fails on `prisma generate` | no `postinstall` script | already fixed in this repo |
| `/admin` redirects to `/dashboard` | signed in as a non-staff account | use the seeded admin |
| Sign-in works locally, loops on Vercel | `NEXTAUTH_URL` mismatch or missing `NEXTAUTH_SECRET` | set both; the app sets `trustHost: true` |
| `Can't reach database server` from Vercel | using the direct URL at runtime, or Neon project asleep | use the pooled URL; Neon resumes on first query |
| Data disappears after a while | still on SQLite | this is the blocker — migrate |

## Notes

- **Free tier:** Neon suspends idle databases; the first request after a pause takes ~1s. Vercel
  cold starts add a little more. Fine for a demo, noticeable under load.
- **Uploads:** none yet. When listing photos land, they cannot go to `public/` on Vercel — use
  Vercel Blob, S3 or UploadThing.
- **Migrations in the build:** some teams run `prisma migrate deploy && next build`. For a demo,
  running migrations manually is safer — a failed migration then cannot block a deploy.
- **Preview deployments:** they share the production database unless you create a Neon branch per
  preview. Keep that in mind before pointing a preview at real data.
