# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
# Development (runs all apps concurrently via Turborepo)
pnpm dev                          # all apps via portless
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

| App       | Framework                | Dev URL                          | Purpose                   |
| --------- | ------------------------ | -------------------------------- | ------------------------- |
| `web`     | Next.js 16 (App Router)  | `https://acme.web.localhost`     | Main application          |
| `landing` | Next.js 16 (App Router)  | `https://acme.landing.localhost` | Marketing site            |
| `api`     | Hono on Node.js (tsdown) | `https://acme.api.localhost`     | Backend API + auth server |

### Packages

| Package                   | Purpose                                                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@repo/ui`                | Shared React components (Tailwind + CVA). Uses `ui:` prefix for Tailwind classes. Includes TanStack Form field components (`Field`, `FieldGroup`, `FieldLabel`, `FieldError`). `cn()` uses `extendTailwindMerge` with `experimentalParseClassName` to handle `ui:` prefix. |
| `@repo/config-vitest`     | Shared Vitest config. Exports `react.ts` and `node.ts` configs.                                                                                                                                                                                                            |
| `@repo/auth`              | Better Auth config. Exports `./server` (for api) and `./client` (for web/landing).                                                                                                                                                                                         |
| `@repo/db`                | Prisma client singleton + schema. Models: User, Session, Account, Verification.                                                                                                                                                                                            |
| `@repo/typescript-config` | Shared tsconfig bases: `nextjs.json`, `server.json`, `react-library.json`, `vite.json`.                                                                                                                                                                                    |
| `@repo/tailwind-config`   | Shared Tailwind CSS config, PostCSS config, and design tokens (`shared-styles.css`).                                                                                                                                                                                       |

### Key Relationships

- **Auth flow**: `web`/`landing` use `@repo/auth/client` → calls `api` at `/auth/*` → `api` uses `@repo/auth/server` with Prisma adapter from `@repo/db`.
- **API structure**: Hono app with versioned routes (`/api/v1/*`), Better Auth at `/auth/*`, health at `/healthz` and `/readyz`.
- **UI consumption**: `web` and `landing` both import from `@repo/ui`. Components use Tailwind with `ui:` prefix inside the package, unprefixed in consumer apps.
- **Build order**: Turborepo handles `^build` dependencies — packages build before apps that depend on them.

## Portless (Dev URLs)

Every dev server runs behind portless, which gives each app a stable HTTPS URL on `.localhost` instead of guessing port numbers. Cookies, OAuth redirects, and CORS allowlists stay valid across project switches.

### Setup (one-time per machine)

```bash
npm install -g portless                # global install (or upgrade)
sudo portless proxy start --https      # start the daemon on :443
```

The proxy auto-restarts on subsequent invocations once trusted.

### URLs

| Service   | URL                              | Started by |
| --------- | -------------------------------- | ---------- |
| `web`     | `https://acme.web.localhost`     | `pnpm dev` |
| `api`     | `https://acme.api.localhost`     | `pnpm dev` |
| `landing` | `https://acme.landing.localhost` | `pnpm dev` |

The api also exposes `/openapi.json`, the Scalar UI at `/docs`, and a markdown export at `/llms.txt` — see `apps/api/src/lib/openapi.ts`.

### Worktrees

Branch name auto-prefixes the subdomain — no port collisions between concurrent worktrees, each gets its own auto-assigned backing port:

```
main worktree:        https://acme.web.localhost
branch fix-styles:    https://fix-styles.acme.web.localhost
```

## Dev Tools (Development Only)

- **React Scan** — highlights unnecessary re-renders, loaded via `<script>` in root layout when `NODE_ENV=development`
- **React Grab** — inspect React component tree, loaded via `<script>` in root layout when `NODE_ENV=development`
- Neither tool runs in production builds

## Tooling

- **Linter**: oxlint (NOT ESLint). Config in `.oxlintrc.json`. Uses `oxlint-config-awesomeness`.
- **Formatter**: oxfmt (NOT Prettier). Config in `.oxfmtrc.json`. Sorts Tailwind classes and imports.
- **Pre-commit**: Husky + lint-staged runs `oxlint` (on `.ts,.tsx,.js,.jsx` files) and `oxfmt` (on `.ts,.tsx,.js,.jsx,.json,.md` files).
- **Testing**: Vitest for unit tests, Playwright for e2e (chromium, firefox, webkit). `@repo/config-vitest` exports `react.ts` and `node.ts` configs.
- **Bundler (api)**: tsdown (not tsc). Outputs to `dist/`. Turbopack for Next.js dev.

## Forms

- **@tanstack/react-form** (NOT react-hook-form)
- Validation: `onBlur` + `onChange` validators with Zod schemas
- Display errors with `field.state.meta.isTouched && !field.state.meta.isValid`
- Field components from `@repo/ui`: `Field`, `FieldGroup`, `FieldLabel`, `FieldError`
- NEVER use `field.handleChange` inside `useEffect` or `useCallback` with `field` in deps — use `field.form.setFieldValue(field.name, value)` with stable refs

## CI (GitHub Actions)

- `test.yml` — `pnpm test`
- `lint.yml` — `pnpm oxlint --format=github .`
- `format.yml` — `pnpm run format:check`
- `fallow.yml` — `pnpm fallow:dead` (cross-file dead code, unused exports, circular deps)
- All use `permissions: { contents: read }` and `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`

## Prisma

`prisma.config.ts` uses `process.env.DATABASE_URL ?? ""` (not `env("DATABASE_URL")`) so `prisma generate` works in CI without database credentials.

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
