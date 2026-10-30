# MtaaHub — Your Mtaa. Our Hub.

A free, trusted Kenyan community platform for finding homes, jobs, local services, comparing prices, staying safe from scams and running a small business — in one account.

**Connect · Compare · Thrive.**

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, Server Components + Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 with a custom MtaaHub theme |
| Database | SQLite for development via Prisma 5 (swap the provider for PostgreSQL in production) |
| Auth | NextAuth v5 (Auth.js) — email/password + optional Google OAuth, JWT sessions |
| Fonts | Self-hosted Inter + Poppins (`src/app/fonts`) — no build-time network calls |

## Quick start

```bash
npm install
cp .env.example .env          # then set NEXTAUTH_SECRET
npx prisma db push            # create prisma/dev.db from the schema
npm run db:seed               # 95 locations, demo users, listings, jobs, services, prices
npm run dev                   # http://localhost:3000
```

### Demo accounts (created by the seed)

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `admin@mtaahub.co.ke` | `Password123!` |
| Member | `brian@mtaahub.co.ke` | `Password123!` |
| Member | `wanjiku@mtaahub.co.ke` | `Password123!` |

Sign in at `/auth/signin`. The admin console lives at `/admin` and is limited to `SUPER_ADMIN`, `MODERATOR`, `VERIFICATION_OFFICER` and `SUPPORT_STAFF` roles.

### Environment

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32>"

# Optional — Google sign-in appears only when both are set
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Routes

**Public** — `/` home, `/nyumba` (+ `/nyumba/[id]`, `/nyumba/list`), `/jobs` (+ `/jobs/[id]`, `/jobs/post`), `/services` (+ `/services/[id]`, `/services/register`), `/prices` (+ `/prices/submit`), `/safety`, `/biashara`, `/ai`.

**Signed in** — `/dashboard`, `/profile`.

**Staff** — `/admin` overview, `/admin/users`, `/admin/reports`, `/admin/verifications`, `/admin/community`, `/admin/settings`.

**API** — `/api/*` mirrors every resource (`listings`, `jobs`, `services`, `prices`, `reports`, `verifications`, `properties`, `favourites`, `notifications`, `locations`, `search`, `business`, `user`).

## Project structure

```
prisma/
  schema.prisma          # single source of truth (Location, Listing, JobPost, ServiceProvider, ...)
  seed.ts                # idempotent demo seed
src/
  app/
    (site)/              # marketing + browse + user pages (header/footer shell)
    (auth)/auth/         # sign in, welcome, auth error (no site chrome)
    admin/               # Sentinel-style dark ops console (own shell)
    api/                 # route handlers
    actions.ts           # server actions: create listing/job/service/price, favourites, reports, admin
  components/
    admin/               # sidebar, sparkline, topbar
    brand/               # logo
    site/                # listing/job/service cards, sign-out button
    ui/                  # button, card, badge, input, avatar
  lib/                   # auth, prisma, utils (money, dates, Kenya data)
  middleware.ts          # JWT-based route protection (no Prisma on the Edge)
```

## Conventions

- **Money is stored as whole Kenyan shillings** (`Int`), never cents. Always render with `formatKSH()`.
- **Dates** go through `timeAgo()` / `formatDate()`.
- **Writes** happen in server actions (`src/app/actions.ts`); pages stay server components and read Prisma directly.
- **Sessions are JWTs** so `middleware.ts` can authorize without touching the database on the Edge.
- **JSON-in-String columns** (`amenities`, `images`, `areasServed`, `requirements`, `evidence`) are parsed with `safeJsonParse()`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Sync schema to the database |
| `npm run db:seed` | Seed demo data (safe to re-run) |
| `npm run db:studio` | Prisma Studio |

## Verification helpers

`scripts/` contains local QA utilities (not part of the app):

```bash
node scripts/e2e.cjs          # signs in, creates a listing, checks every public route (needs a server on :3100)
node scripts/screenshot.cjs   # captures shots/{home,admin,nyumba,dashboard,jobs}.png
```

## Media

Photography is sourced from Wikimedia Commons (CC BY-SA 4.0 and public domain). Attribution lives in
[`IMAGE-CREDITS.md`](IMAGE-CREDITS.md) and on the public `/credits` page linked from the footer. Swap the files in
`public/images/` for your own shots and update both places.

Built for a better Kenya 🇰🇪
