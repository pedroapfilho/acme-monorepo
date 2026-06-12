# AGENTS.md

Guidance for AI coding agents working in `acme` — the template monorepo and source of truth for all `saas`-profile sibling projects.

Project conventions and defaults live in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack dev), Hono on Node 24
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4, base-ui primitives, shadcn-style composition
- **Database:** Prisma 7, PostgreSQL 18
- **Auth:** Better Auth (email + password, secure cookies)
- **Email:** Resend via `@repo/transactional` (React Email templates)
- **Monorepo:** Turborepo + pnpm 11 workspaces (`apps/*`, `packages/*`)
- **Lint / format:** oxlint + oxfmt (NOT ESLint / Prettier)
- **Testing:** Vitest (unit), Playwright (e2e, chromium/firefox/webkit)

## Layout

```
apps/
  web/        Next.js — main app             https://acme.web.localhost
  landing/    Next.js — marketing site       https://acme.landing.localhost
  api/        Hono + tsdown — REST API       https://acme.api.localhost
packages/
  ui/                  Shared React components, TanStack Form fields, base styles
  auth/                Better Auth config — exports ./server (api) and ./client (web/landing)
  db/                  Prisma client singleton + schema (User, Session, Account, Verification)
  transactional/       React Email templates + Resend sender
  config-typescript/   Shared tsconfig bases (nextjs / server / react-library / vite)
  config-vitest/       Shared Vitest configs (react.ts, node.ts)
docs/                  CONVENTIONS.md + superpowers specs
agents/counselors/     Agent role definitions
tests/                 Root Playwright e2e specs
docker-compose.yml     Local Postgres 18 on :5432
```

## Dev workflow

Real scripts from root `package.json`:

```bash
pnpm dev                 # turbo dev — runs all apps behind portless concurrently
pnpm build               # turbo run build (db:generate runs first via dependsOn)
pnpm start               # turbo run start
pnpm typecheck           # turbo run typecheck (tsc --noEmit per workspace)
pnpm lint                # oxlint . at the root
pnpm format              # oxfmt (write)
pnpm format:check        # oxfmt --check (used in CI)

pnpm test                # turbo run test — Vitest in every workspace
pnpm test:e2e            # playwright test (requires web + api running)
pnpm test:e2e:ui         # playwright with interactive UI

pnpm db:generate         # prisma generate
pnpm db:push             # prisma db push
pnpm db:seed             # seed sample data

pnpm fallow:dead         # cross-file dead code / unused exports / cycles
pnpm fallow:dupes        # duplicate-code detection
pnpm fallow:health       # repo health score
pnpm fallow:audit        # base=main audit
pnpm clean               # turbo run clean && rm -rf node_modules
```

Per-app dev: `pnpm dev --filter=web` (or `api` / `landing`).

## Portless (dev URLs)

Every app's `dev` script wraps the framework in `portless run --name <subdomain> …`, giving each one a stable HTTPS URL on `:443` instead of guessing port numbers. Cookies, OAuth redirects, and CORS allowlists stay valid across worktree switches.

One-time per machine:

```bash
npm install -g portless
sudo portless proxy start --https     # binds :443, trusts the local cert
```

Worktrees auto-prefix the subdomain — `main` → `https://acme.web.localhost`, branch `fix-styles` → `https://fix-styles.acme.web.localhost`. Each gets an auto-assigned backing port; no collisions.

The api exposes `/openapi.json`, the Scalar UI at `/docs`, and a markdown export at `/llms.txt` — see `apps/api/src/lib/openapi.ts`.

## Conventions & gotchas

### Forms

- **@tanstack/react-form** (NOT react-hook-form). Validate `onBlur` + `onChange` with Zod.
- Render errors via `field.state.meta.isTouched && !field.state.meta.isValid`.
- Field primitives from `@repo/ui`: `Field`, `FieldGroup`, `FieldLabel`, `FieldError`.
- **Never** put `field` in a `useEffect` / `useCallback` dependency array — it's a new object every render. Use `field.form.setFieldValue(field.name, value)` with stable refs.

### Auth

- Password minimum **12 characters**. Sessions expire after 7 days.
- The Better Auth handler is mounted in `web` at `apps/web/src/app/api/auth/[...all]/route.ts` (`basePath: "/api/auth"` in `packages/auth/src/server.ts`).
- `web` / `landing` use `@repo/auth/client` → calls same-origin `/api/auth`.
- `api` consumes the auth instance from `@repo/auth/server` (Prisma adapter from `@repo/db`) for session middleware and observability identify — it does not serve the auth routes.
- `BETTER_AUTH_SECRET` must be **identical** across `apps/api/.env` and `apps/web/.env.local` — both validate sessions against it.
- `requireEmailVerification` is gated on the email-infra env vars being present (no bare `true`).

### API

- Routes versioned under `/api/v1/*`. Health at `/healthz`, `/readyz`.
- Hono app uses `@repo/observability` (evlog) for logging + `@hono/zod-openapi`.
- Build via **tsdown** (NOT tsc) — outputs to `dist/`.

### Prisma

- `prisma.config.ts` uses `process.env.DATABASE_URL ?? ""` (not `env("DATABASE_URL")`) so `prisma generate` works in CI without database credentials.
- `db:generate` is declared in `turbo.json` `build.dependsOn`, so `pnpm build` will regenerate the client before app builds.

### Tooling

- Linter: **oxlint**, config in `.oxlintrc.json` via `oxlint-config-awesomeness`.
- Formatter: **oxfmt**, config in `.oxfmtrc.json`. Sorts Tailwind classes and imports.
- Pre-commit: Husky + lint-staged runs `oxlint` on JS/TS files and `oxfmt` on JS/TS/JSON/MD.
- Bundler for `api`: **tsdown**. Next.js apps use Turbopack in dev.
- Path alias: `@/*` → `src/*` in every app and package.

### Turbo cache keys

`build.env` is sensitive to: `API_URL`, `AUTH_ALLOWED_HOSTS`, `BETTER_AUTH_SECRET`, `CORS_ORIGINS`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `TRUSTED_ORIGINS`, `WEB_APP_URL`. Changing any of these invalidates build cache.

## Environment

Each package loads env vars from **its own** directory — there is no root `.env`.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
```

`apps/landing` reads no runtime env vars. Key variables:

- `DATABASE_URL` — PostgreSQL connection string (matches `docker-compose.yml`: `postgres://acme:acme123@localhost:5432/acme`)
- `BETTER_AUTH_SECRET` — min 32 chars; identical across api and web
- `CORS_ORIGINS` / `TRUSTED_ORIGINS` — comma-separated allowed origins
- `NEXT_PUBLIC_API_URL` — API URL for client-side requests (defaults to portless URL)
- `BETTER_AUTH_URL` — Better Auth base URL (api hostname)

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

## CI (GitHub Actions)

Six workflows are checked in: `e2e.yml`, `fallow.yml`, `format.yml`, `lint.yml`, `react-doctor.yml`, `test.yml`. The standard workflows pin `actions/checkout`, `pnpm/action-setup`, and `actions/setup-node` to `@v6`, which run on Node 24 natively — no `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` env var. Keep `permissions: { contents: read }` on any new workflow (`react-doctor.yml` needs extra PR-comment permissions).

## Notable decisions

- **acme is the template.** Sibling repos (localcine, collabtime, frow, easeia) inherit every shared standard from here. Change acme first, then propagate — see `~/dev/orchestrator/standards.md`.
- **Prisma client field** of `prisma.config.ts` deliberately falls back to `""` to keep CI green without secrets.
- **pnpm 11 + Node 24** are the minimums (engines).
- **No `@repo/tailwind-config` package** — Tailwind v4 reads tokens directly from `packages/ui/src/styles/globals.css` via the `@theme` directive; shared base styles also live there.
- **base-ui (not Radix)** is the primitive layer. Wrappers in `@repo/ui` stay free of spurious `"use client"` directives.
- **landings expose `lib/urls.ts`** with a `webAppUrl()` helper — never hardcode production URLs in marketing pages.

## References

- Conventions: [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)
- Orchestrator (cross-repo standards + verifiers): `~/dev/orchestrator`
- Portless: <https://www.npmjs.com/package/portless>
- Better Auth: <https://www.better-auth.com>
- Turborepo: <https://turborepo.com>
- Hono: <https://hono.dev>
- React Email: <https://react.email>
