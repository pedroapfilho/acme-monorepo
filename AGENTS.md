# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
# Development (runs all apps concurrently via Turborepo)
pnpm dev                          # all apps: web(:3000), landing(:3001), api(:4000), workshop(:6006)
pnpm dev --filter=web             # single app
pnpm dev --filter=api

# Build / Lint / Typecheck
pnpm build                        # all packages + apps (turbo cached)
pnpm lint                         # oxlint across all packages
pnpm typecheck                    # tsc --noEmit across all packages
pnpm format                       # oxfmt (write)
pnpm format:check                 # oxfmt (check only, used in CI)

# Testing
pnpm test                         # vitest unit tests
pnpm test:e2e                     # playwright (requires web + api running)
pnpm test:e2e:ui                  # playwright with interactive UI

# Database (Prisma, schema in packages/db/prisma/schema.prisma)
pnpm db:generate                  # generate Prisma client
pnpm db:push                      # push schema to database
pnpm db:seed                      # seed database
```

## Architecture

**Monorepo** managed by pnpm workspaces + Turborepo. Node 24, pnpm 10.

### Apps

| App        | Framework                | Port | Purpose                   |
| ---------- | ------------------------ | ---- | ------------------------- |
| `web`      | Next.js 16 (App Router)  | 3000 | Main application          |
| `landing`  | Next.js 16 (App Router)  | 3001 | Marketing site            |
| `api`      | Hono on Node.js (tsdown) | 4000 | Backend API + auth server |
| `workshop` | Storybook 10 (Vite)      | 6006 | Component documentation   |

### Packages

| Package                   | Purpose                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `@repo/ui`                | Shared React components (Radix UI + Tailwind). Uses `cn()` utility for class merging.   |
| `@repo/auth`              | Better Auth config. Exports `./server` (for api) and `./client` (for web/landing).      |
| `@repo/db`                | Prisma client singleton + schema. Models: User, Session, Account, Verification.         |
| `@repo/typescript-config` | Shared tsconfig bases: `nextjs.json`, `server.json`, `react-library.json`, `vite.json`. |
| `@repo/tailwind-config`   | Shared Tailwind CSS config, PostCSS config, and design tokens (`shared-styles.css`).    |

### Key Relationships

- **Auth flow**: `web`/`landing` use `@repo/auth/client` → calls `api` at `/auth/*` → `api` uses `@repo/auth/server` with Prisma adapter from `@repo/db`.
- **API structure**: Hono app with versioned routes (`/api/v1/*`), Better Auth at `/auth/*`, health at `/healthz` and `/readyz`.
- **UI consumption**: `web`, `landing`, and `workshop` all import from `@repo/ui`. Components are Radix-based with Tailwind styling.
- **Build order**: Turborepo handles `^build` dependencies — packages build before apps that depend on them.

## Tooling (Non-Standard)

- **Linter**: Oxlint (not ESLint). Config in `.oxlintrc.json`. Run via `pnpm lint`.
- **Formatter**: Oxfmt (not Prettier). Config in `.oxfmtrc.json`. Sorts Tailwind classes and imports automatically.
- **Bundler (api)**: tsdown (not tsc). Outputs to `dist/`.
- **Pre-commit**: Husky + lint-staged runs `oxfmt` on staged files.

## Environment

Copy `.env.example` to `.env` at root. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — min 32 characters
- `CORS_ORIGINS` / `TRUSTED_ORIGINS` — comma-separated allowed origins
- `NEXT_PUBLIC_API_URL` — API URL for client-side requests (web/landing use this)

Web and landing apps use `.env.local` files; api uses `.env` at its app root.

## Conventions

- Path aliases: `@/*` maps to `src/*` in all apps and packages.
- Auth password minimum: 12 characters. Sessions expire after 7 days.
- API routes are versioned under `/api/v1/`. Auth routes are at `/auth/*`.
- Turbo caches are sensitive to `API_URL`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_API_URL`, and `DATABASE_URL`.
