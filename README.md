# Acme

Monorepo template for all projects. Source of truth for shared patterns, tooling, and configurations.

## Stack

- **Framework:** Next.js 16, Hono
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4, Radix UI, shadcn/ui patterns
- **Database:** Prisma 7, PostgreSQL
- **Auth:** Better Auth
- **Monorepo:** Turborepo, pnpm workspaces
- **Linting:** oxlint
- **Formatting:** oxfmt
- **Testing:** Vitest (unit), Playwright (e2e)

## Apps

| App       | Description      | Dev URL                          |
| --------- | ---------------- | -------------------------------- |
| `web`     | Main application | `https://acme.web.localhost`     |
| `api`     | Hono backend API | `https://acme.api.localhost`     |
| `landing` | Marketing site   | `https://acme.landing.localhost` |

## Packages

| Package                   | Description                    |
| ------------------------- | ------------------------------ |
| `@repo/ui`                | Shared React component library |
| `@repo/db`                | Prisma database client         |
| `@repo/auth`              | Authentication module          |
| `@repo/typescript-config` | Shared TypeScript configs      |
| `@repo/config-vitest`     | Shared Vitest test configs     |

## Setup

### Prerequisites

- **Node.js 24** (use `nvm install 24 && nvm use 24`)
- **pnpm 10** (`npm install -g pnpm@10`)
- **PostgreSQL** running locally on `:5432` (or use Docker — see below)
- **portless** for stable HTTPS dev URLs (see step 2)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Install portless and start the HTTPS proxy

Dev servers run behind [portless](https://www.npmjs.com/package/portless), which gives each app a stable `https://*.localhost` URL instead of a random port. This is required — the dev scripts wrap each app in `portless run …`, and Better Auth's secure cookies + CORS allowlists assume the portless hostnames.

One-time per machine:

```bash
npm install -g portless
sudo portless proxy start --https   # binds :443, trusts the local cert
```

The proxy auto-restarts on subsequent boots once trusted.

### 3. Start PostgreSQL

If you don't already have Postgres running:

```bash
docker run -d --name acme-pg \
  -e POSTGRES_USER=acme \
  -e POSTGRES_PASSWORD=acme123 \
  -e POSTGRES_DB=acme \
  -p 5432:5432 \
  postgres:16
```

### 4. Configure environment variables

Each package loads env vars from its **own** directory. Copy each example and edit as needed:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
```

(`apps/landing` reads no env vars at runtime, so it doesn't need a file.)

Then edit each file and set:

- `BETTER_AUTH_SECRET` — any 32+ char random string, **identical** across `apps/api/.env` and `apps/web/.env.local` (both validate sessions against it). Generate with `openssl rand -base64 32`.
- `DATABASE_URL` — Replace the name and password placeholders.

The URL variables (`NEXT_PUBLIC_API_URL`, `BETTER_AUTH_URL`, `CORS_ORIGINS`, `TRUSTED_ORIGINS`) are pre-set to the portless URLs and don't need changes for local dev.

### 5. Initialize the database

```bash
pnpm db:generate    # generate the Prisma client
pnpm db:push        # apply the schema to your database
pnpm db:seed        # optional: seed sample data
```

### 6. Run the dev servers

```bash
pnpm dev
```

Open:

- Web: <https://acme.web.localhost>
- Landing: <https://acme.landing.localhost>
- API: <https://acme.api.localhost>
  - OpenAPI docs (Scalar): <https://acme.api.localhost/docs>
  - Schema JSON: <https://acme.api.localhost/openapi.json>

### Worktrees

Branch name auto-prefixes the subdomain — concurrent worktrees don't collide:

```
main worktree:        https://acme.web.localhost
branch fix-styles:    https://fix-styles.acme.web.localhost
```

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Start all apps in development |
| `pnpm build`        | Build all apps and packages   |
| `pnpm test`         | Run unit tests                |
| `pnpm test:e2e`     | Run Playwright e2e tests      |
| `pnpm lint`         | Run oxlint                    |
| `pnpm format`       | Format with oxfmt             |
| `pnpm format:check` | Check formatting              |
| `pnpm typecheck`    | Run TypeScript checks         |
| `pnpm db:generate`  | Generate Prisma client        |
| `pnpm db:push`      | Push schema to database       |
| `pnpm db:seed`      | Seed database                 |
| `pnpm clean`        | Clean all build artifacts     |
