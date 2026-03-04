# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build (also runs type-check)
npm run lint      # ESLint
npx tsc --noEmit  # Type-check only

# Database
npx prisma migrate dev --name <migration-name>  # Create + apply a migration
npx prisma generate                              # Regenerate Prisma client after schema changes
npx prisma studio                                # GUI to inspect DB data
```

## Prerequisites Before Running

1. PostgreSQL must be running (Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=stock_portfolio postgres:16`)
2. `.env` must have `DATABASE_URL`, `NEXTAUTH_SECRET` (32+ chars), `NEXTAUTH_URL`, and `ANTHROPIC_API_KEY`
3. Run `npx prisma migrate dev --name init` on first setup

## Critical Dependency Constraints

- **Prisma is pinned to v5** (`prisma@5`, `@prisma/client@5`). Do not upgrade to v7+. Prisma v7 removed `url` from `datasource` in `schema.prisma`, which would require a full migration to `prisma.config.ts`.
- **Next.js 16** uses `src/proxy.ts` instead of `src/middleware.ts` for route protection. Do not rename it back.

## Architecture Overview

### Data Flow

The app is a standard Next.js App Router project with server components doing the heavy lifting:

1. **Auth** — `src/lib/auth.ts` exports `{ handlers, auth, signIn, signOut }` from NextAuth v5. The `auth()` function is used in server components and API routes to get the session. JWT strategy; `userId` is attached to the token in the `jwt` callback and forwarded to the session via the `session` callback. Types for `session.user.id` are extended in `src/types/next-auth.d.ts`.

2. **Route protection** — `src/proxy.ts` wraps `auth()` as middleware. Protected routes: `/dashboard`, `/portfolio`, `/insights`. Auth routes (`/auth/*`) redirect logged-in users to `/dashboard`.

3. **Portfolio data** — All Prisma queries are scoped to `userId` from the session. The `/api/portfolio` GET route fetches holdings and enriches them in parallel with live quotes from `yahoo-finance2`. DELETE uses `findFirst({ where: { id, userId } })` before deleting to enforce ownership.

4. **Dashboard chart** — `src/app/dashboard/page.tsx` is a server component. It fetches historical data for all portfolio symbols plus `^GSPC` (S&P 500) in parallel, computes daily portfolio value by summing `shares × close` per day, and normalizes S&P 500 to the portfolio's starting value for comparison. The result is passed as `ChartDataPoint[]` to the client `PerformanceChart` component.

5. **AI agents** — Both `/api/ai/monitor` and `/api/ai/advisor` receive pre-computed portfolio data from the client (`InsightsClient.tsx`), assemble a prompt, call `anthropic.messages.create()` with `claude-sonnet-4-6`, and parse the JSON response. Both agents are instructed to return strict JSON with no markdown.

### Key Library Files

| File | Purpose |
|---|---|
| `src/lib/prisma.ts` | Singleton `PrismaClient` (global cache to avoid hot-reload exhaustion) |
| `src/lib/auth.ts` | NextAuth config — all auth logic lives here |
| `src/lib/anthropic.ts` | Singleton `Anthropic` client |
| `src/lib/yahoo-finance.ts` | `getStockQuote(symbol)` and `getHistoricalData(symbol, start, end)` — wraps `yahoo-finance2` with typed interfaces. Uses `any` casts because yahoo-finance2 types don't match strict mode well. |
| `src/lib/utils.ts` | `cn()` (Tailwind merge), `formatCurrency()`, `formatPercent()`, `formatDate()` |

### Component Patterns

- **Server components** (no `"use client"`): pages (`dashboard`, `portfolio`, `insights`), `Navbar` (reads session server-side, contains a server action for sign-out)
- **Client components**: All `*Form.tsx`, `PortfolioClient.tsx`, `InsightsClient.tsx`, `PerformanceChart.tsx`
- **UI primitives** in `src/components/ui/` are hand-written shadcn-style components (Button, Input, Label, Card) — not installed via the shadcn CLI

### Validation

Every API route and server action validates input with Zod before touching the database. The `addHoldingSchema` in `/api/portfolio/route.ts` calls `getStockQuote()` to verify the symbol is real before persisting.

### Database Schema

Two models: `User` (email, passwordHash, name) and `Holding` (userId FK, symbol, shares as Decimal(15,6), purchasePrice as Decimal(15,4), purchaseDate as Date). Cascade delete removes holdings when a user is deleted.
