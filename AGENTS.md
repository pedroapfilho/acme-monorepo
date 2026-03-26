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

| App        | Framework                | Dev URL                         | Purpose                   |
| ---------- | ------------------------ | ------------------------------- | ------------------------- |
| `web`      | Next.js 16 (App Router)  | `http://web.localhost:1355`     | Main application          |
| `landing`  | Next.js 16 (App Router)  | `http://landing.localhost:1355` | Marketing site            |
| `api`      | Hono on Node.js (tsdown) | `http://api.localhost:1355`     | Backend API + auth server |
| `workshop` | Storybook 10 (Vite)      | `:6006`                         | Component documentation   |

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
- **UI consumption**: `web`, `landing`, and `workshop` all import from `@repo/ui`. Components use Tailwind with `ui:` prefix inside the package, unprefixed in consumer apps.
- **Build order**: Turborepo handles `^build` dependencies — packages build before apps that depend on them.

## Portless (Dev URLs)

All dev scripts use `portless <name>` prefix. Dev URLs follow the pattern `http://<name>.localhost:1355`. Portless must be installed globally: `npm install -g portless`. No hardcoded port numbers in dev scripts.

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
