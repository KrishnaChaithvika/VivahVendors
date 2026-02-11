# VivahVendors

## Project Overview
Global wedding vendor marketplace with culturally-aware categorization.
Two-sided platform: customers browse/book vendors, vendors manage listings/orders.

## Tech Stack
- Next.js 16 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui
- PostgreSQL + Prisma ORM, Auth.js v5
- Stripe + Razorpay for payments, Cloudinary for images
- Vitest + Playwright for testing

## Development Commands
- `npm run dev` — start dev server (http://localhost:3000)
- `docker compose up -d` — start PostgreSQL + Redis
- `npx prisma migrate dev` — run database migrations
- `npx prisma db seed` — seed categories + taxonomy data
- `npx prisma studio` — visual DB browser
- `npm run lint` — run ESLint
- `npm run test` — run Vitest unit + integration tests
- `npm run test:e2e` — run Playwright E2E tests
- `npx tsx src/crawler/index.ts --seed` — run crawler seed

## Project Structure
- `src/app/` — Next.js pages and API routes (App Router)
- `src/components/` — React components (ui/, layout/, vendor/, search/, booking/, order/, review/, auth/)
- `src/actions/` — Server Actions (mutations)
- `src/services/` — Data access layer (Prisma queries)
- `src/crawler/` — Web crawler pipeline (standalone)
- `src/lib/` — Shared utilities (db, auth, validators)
- `prisma/` — Schema, migrations, seed
- `tests/` — unit/, integration/, e2e/, fixtures/
- `docs/` — System design document

## Conventions
- Use Server Components by default; add "use client" only when needed
- All mutations go through Server Actions (src/actions/), not API routes
- Data queries go through services layer (src/services/)
- Validate with Zod schemas from src/lib/validators/ (shared client + server)
- Use shadcn/ui components from src/components/ui/
- Feature branches: feature/<name>, bug fixes: fix/<name>
- Never commit .env files or secrets

## Database
- Local: Docker PostgreSQL (see docker-compose.yml)
- Production: Neon (serverless PostgreSQL)
- Always run `npx prisma migrate dev` after schema changes
