# Deslop & Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove structural slop, unify cross-cutting patterns, and codify defaults across the acme monorepo in three independent PRs that can land in any order.

**Architecture:** A small **Preflight PR** lands the previously-uncommitted middleware test fixes so `main` has green CI. Then three independent feature PRs (**A**, **B**, **C**) branch off `main` and ship in parallel — none share a code file. PR A handles structural cleanup + the api `services/` → `lib/` rename + dead deps. PR B handles response-envelope normalization + RSC error propagation + the transactional `utils/` → `lib/` rename + a new `docs/CONVENTIONS.md`. PR C handles comment trims + a shared typed test-context helper.

**Tech Stack:** Hono on Node.js, Prisma, Next.js 16 App Router, Better Auth, Vitest (unit), Playwright (e2e), Turborepo, pnpm 10, oxlint, oxfmt.

**Spec:** `docs/superpowers/specs/2026-05-26-deslop-standardization-design.md`

---

## File Map

### Preflight PR
- Modify: `apps/api/src/middleware/auth.test.ts` (already unstaged)
- Modify: `apps/api/src/middleware/error-handler.test.ts` (already unstaged)

### PR A — Structural
- Delete: `apps/api/src/services/user.service.ts`
- Delete: `apps/api/src/services/user.service.test.ts`
- Delete: `apps/api/src/services/` (empty after the two deletions)
- Create: `apps/api/src/lib/users.ts`
- Create: `apps/api/src/lib/users.test.ts`
- Modify: `apps/api/src/routes/v1/users.ts`
- Delete: `packages/transactional/src/client.ts`
- Modify: `packages/transactional/src/utils/send-email.ts` (still under `utils/` at this point; PR B renames the dir)
- Modify: `packages/transactional/src/index.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/auth/package.json`

### PR B — Patterns + CONVENTIONS.md
- Modify: `apps/api/src/routes/v1/users.ts` (deleteMe response → 204)
- Modify: `apps/web/src/lib/auth-helpers.ts` (drop try/catch)
- Move: `packages/transactional/src/utils/send-email.ts` → `packages/transactional/src/lib/send-email.ts`
- Move: `packages/transactional/src/utils/senders.ts` → `packages/transactional/src/lib/senders.ts`
- Modify: `packages/transactional/src/index.ts` (update paths)
- Create: `docs/CONVENTIONS.md`
- Modify: `CLAUDE.md` (add link to CONVENTIONS.md)

### PR C — Hygiene
- Create: `apps/api/src/middleware/test-helpers.ts`
- Modify: `apps/api/src/middleware/auth.test.ts`
- Modify: `apps/api/src/middleware/error-handler.test.ts`
- Modify: `apps/api/src/middleware/security.test.ts`
- Modify: `packages/auth/src/server.ts:55-72` (cookie comment block)
- Modify: `apps/api/src/lib/env.ts:18-23` (env throw comment)
- Modify: `apps/api/src/middleware/auth.ts:80-87` (logger comment)

---

## Preflight PR — green main before branching

The current working tree has two unstaged fixes (`auth.test.ts`, `error-handler.test.ts`) that unbreak the middleware tests on main (the `@hono/structured-logger` migration left the tests asserting on a `c.var.logger` that the mocks didn't expose). Land them first so PR A/B/C all start from green CI.

### Task P1: Land the middleware test fixes

**Files:**
- Modify: `apps/api/src/middleware/auth.test.ts` (already in working tree)
- Modify: `apps/api/src/middleware/error-handler.test.ts` (already in working tree)

- [ ] **Step 1: Confirm the unstaged diff is exactly the two fixes**

Run: `git diff --stat apps/api/src/middleware/`
Expected:
```
 apps/api/src/middleware/auth.test.ts          |  4 ++++
 apps/api/src/middleware/error-handler.test.ts | 11 ++++-------
```
If anything else is touched, stop and investigate.

- [ ] **Step 2: Run api tests to confirm they pass with the unstaged fix in place**

Run: `pnpm --filter api test`
Expected: `Test Files  5 passed (5)` and `Tests  56 passed (56)`.

- [ ] **Step 3: Branch off main**

```bash
git fetch origin main
git checkout -b fix/api-middleware-test-logger origin/main
git checkout t3code/5f31b521 -- apps/api/src/middleware/auth.test.ts apps/api/src/middleware/error-handler.test.ts
```

- [ ] **Step 4: Verify the test fixes still pass on the fresh branch**

Run: `pnpm install && pnpm --filter api test`
Expected: 56/56 passing.

- [ ] **Step 5: Commit, push, open PR**

```bash
git add apps/api/src/middleware/auth.test.ts apps/api/src/middleware/error-handler.test.ts
git commit -m "fix(api): expose c.var.logger in middleware test mocks

The structured-logger migration left auth and error-handler tests
asserting on a c.var.logger that the createMockContext helpers did
not provide, so every error-path test threw before reaching its
assertion. Add var.logger to the mocks and drop the now-dead
vi.mock(\"@/lib/logger\") blocks."
git push -u origin fix/api-middleware-test-logger
gh pr create --title "fix(api): expose c.var.logger in middleware test mocks" --body "$(cat <<'EOF'
## Summary
- Unbreaks the 10 api middleware tests that started failing after the structured-logger migration (commit dbb2511).
- Adds \`var: { logger }\` to the test mock contexts and removes the now-dead \`vi.mock(\"@/lib/logger\")\` calls (neither file imports the module anymore).

## Test plan
- [x] \`pnpm --filter api test\` → 56/56 passing
- [ ] CI green on merge

Preflight for the deslop & standardization series (spec: \`docs/superpowers/specs/2026-05-26-deslop-standardization-design.md\`).
EOF
)"
```

- [ ] **Step 6: Wait for review + merge before starting PR A/B/C**

The three feature PRs each branch off `main` and will fail CI without this fix in place.

---

## PR A — Structural cleanup + dead deps + api file rename

### Task A1: Branch off main

- [ ] **Step 1: Create branch**

```bash
git fetch origin main
git checkout -b refactor/api-collapse-user-service origin/main
pnpm install
```

- [ ] **Step 2: Confirm green baseline**

Run: `pnpm typecheck && pnpm test`
Expected: All checks pass.

### Task A2: Write the failing test for `findUserById` in the new location

**Files:**
- Create: `apps/api/src/lib/users.test.ts`

- [ ] **Step 1: Create the new test file with the same coverage as the old service test, against the new function-based API**

Write `apps/api/src/lib/users.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/db", () => ({
  prisma: {
    user: {
      delete: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { prisma } from "@repo/db";

import { AppError } from "@/middleware/error-handler";

import { deleteUser, findUserByEmail, findUserById, updateUser } from "./users";

const mockUser = {
  createdAt: new Date("2024-01-01"),
  displayName: "Test User",
  email: "test@example.com",
  emailVerified: true,
  id: "user-1",
  name: "Test",
  updatedAt: new Date("2024-01-01"),
  username: "testuser",
};

describe("findUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    const result = await findUserById("user-1");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" } }),
    );
  });

  it("throws AppError 404 when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    await expect(findUserById("missing")).rejects.toThrow(AppError);
    await expect(findUserById("missing")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("throws AppError 500 on database error", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB connection lost"));

    await expect(findUserById("user-1")).rejects.toThrow(AppError);
    await expect(findUserById("user-1")).rejects.toMatchObject({
      code: "USER_FETCH_ERROR",
      statusCode: 500,
    });
  });
});

describe("findUserByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    const result = await findUserByEmail("test@example.com");

    expect(result).toEqual(mockUser);
  });

  it("returns null when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    const result = await findUserByEmail("missing@example.com");

    expect(result).toBeNull();
  });

  it("throws AppError 500 on database error", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB error"));

    await expect(findUserByEmail("test@example.com")).rejects.toMatchObject({
      code: "USER_FETCH_ERROR",
      statusCode: 500,
    });
  });
});

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates and returns user", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    const result = await updateUser("user-1", { name: "New Name" });

    expect(result).toEqual(mockUser);
  });

  it("throws AppError 400 when username is taken", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never);

    await expect(updateUser("user-2", { username: "testuser" })).rejects.toMatchObject({
      code: "USERNAME_TAKEN",
      statusCode: 400,
    });
  });

  it("skips username check when username is not provided", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    await updateUser("user-1", { name: "Updated" });

    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("throws AppError 404 on P2025 error", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.user.update).mockRejectedValue(
      Object.assign(new Error("Record not found"), { clientVersion: "7.0.0", code: "P2025" }),
    );

    await expect(updateUser("missing", { name: "X" })).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("throws AppError 500 on generic database error", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.user.update).mockRejectedValue(new Error("Connection refused"));

    await expect(updateUser("user-1", { name: "X" })).rejects.toMatchObject({
      code: "USER_UPDATE_ERROR",
      statusCode: 500,
    });
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes user and returns success", async () => {
    vi.mocked(prisma.user.delete).mockResolvedValue(mockUser as never);

    const result = await deleteUser("user-1");

    expect(result).toEqual({ success: true });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("throws AppError 404 on P2025 error", async () => {
    vi.mocked(prisma.user.delete).mockRejectedValue(
      Object.assign(new Error("Record not found"), { clientVersion: "7.0.0", code: "P2025" }),
    );

    await expect(deleteUser("missing")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("throws AppError 500 on generic database error", async () => {
    vi.mocked(prisma.user.delete).mockRejectedValue(new Error("DB error"));

    await expect(deleteUser("user-1")).rejects.toMatchObject({
      code: "USER_DELETE_ERROR",
      statusCode: 500,
    });
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails because `./users` does not exist yet**

Run: `pnpm --filter api test -- src/lib/users.test.ts`
Expected: FAIL with "Failed to resolve import './users'".

### Task A3: Implement `apps/api/src/lib/users.ts`

**Files:**
- Create: `apps/api/src/lib/users.ts`

- [ ] **Step 1: Write the new module with `userSelect` constant + four async functions**

Write `apps/api/src/lib/users.ts`:

```ts
import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";

import { logger } from "@/lib/logger";
import { AppError, isPrismaKnownError } from "@/middleware/error-handler";

const userSelect = {
  createdAt: true,
  displayName: true,
  email: true,
  emailVerified: true,
  id: true,
  name: true,
  updatedAt: true,
  username: true,
} satisfies Prisma.UserSelect;

export const findUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      select: userSelect,
      where: { id },
    });

    if (!user) {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error({ error, userId: id }, "Failed to find user by ID");
    throw new AppError("Failed to fetch user", 500, false, "USER_FETCH_ERROR");
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      select: userSelect,
      where: { email },
    });
  } catch (error) {
    logger.error({ email, error }, "Failed to find user by email");
    throw new AppError("Failed to fetch user", 500, false, "USER_FETCH_ERROR");
  }
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  try {
    if (typeof data.username === "string") {
      const existing = await prisma.user.findFirst({
        where: {
          NOT: { id },
          username: data.username,
        },
      });

      if (existing) {
        throw new AppError("Username already taken", 400, true, "USERNAME_TAKEN");
      }
    }

    const updatedUser = await prisma.user.update({
      data,
      select: userSelect,
      where: { id },
    });

    logger.info({ fields: Object.keys(data), userId: id }, "User updated successfully");

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isPrismaKnownError(error) && error.code === "P2025") {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }

    logger.error({ error, userId: id }, "Failed to update user");
    throw new AppError("Failed to update user", 500, false, "USER_UPDATE_ERROR");
  }
};

export const deleteUser = async (id: string) => {
  try {
    await prisma.user.delete({
      where: { id },
    });

    logger.info({ userId: id }, "User deleted successfully");

    return { success: true };
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === "P2025") {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }

    logger.error({ error, userId: id }, "Failed to delete user");
    throw new AppError("Failed to delete user", 500, false, "USER_DELETE_ERROR");
  }
};
```

- [ ] **Step 2: Run the new test and verify it passes**

Run: `pnpm --filter api test -- src/lib/users.test.ts`
Expected: PASS (`Tests  12 passed (12)`).

### Task A4: Update the route call sites in `apps/api/src/routes/v1/users.ts`

**Files:**
- Modify: `apps/api/src/routes/v1/users.ts`

- [ ] **Step 1: Replace the import line**

In `apps/api/src/routes/v1/users.ts`, replace:
```ts
import { userService } from "@/services/user.service";
```
with:
```ts
import { deleteUser, findUserById, updateUser } from "@/lib/users";
```

- [ ] **Step 2: Update the `ServiceUser` type alias**

Replace:
```ts
type ServiceUser = Awaited<ReturnType<typeof userService.findById>>;
```
with:
```ts
type ServiceUser = Awaited<ReturnType<typeof findUserById>>;
```

- [ ] **Step 3: Update the four call sites**

| Line (current) | Old | New |
|---|---|---|
| 73 | `await userService.findById(user.id)` | `await findUserById(user.id)` |
| 109 | `await userService.update(user.id, data)` | `await updateUser(user.id, data)` |
| 134 | `await userService.delete(user.id)` | `await deleteUser(user.id)` |
| 173 | `await userService.findById(user.id)` | `await findUserById(user.id)` |

- [ ] **Step 4: Run typecheck + tests**

Run: `pnpm --filter api typecheck && pnpm --filter api test`
Expected: typecheck clean; all api tests pass (both `services/user.service.test.ts` and the new `lib/users.test.ts` exist temporarily — the old file is removed in A5).

### Task A5: Delete the old service files

**Files:**
- Delete: `apps/api/src/services/user.service.ts`
- Delete: `apps/api/src/services/user.service.test.ts`
- Delete: `apps/api/src/services/` (directory, if empty)

- [ ] **Step 1: Delete the two files**

```bash
rm apps/api/src/services/user.service.ts
rm apps/api/src/services/user.service.test.ts
```

- [ ] **Step 2: Remove the now-empty `services/` directory**

```bash
rmdir apps/api/src/services
```

- [ ] **Step 3: Verify api tests and typecheck still pass**

Run: `pnpm --filter api typecheck && pnpm --filter api test`
Expected: typecheck clean; all api tests pass (lower total than before — `user.service.test.ts` had 17 tests, the new `lib/users.test.ts` has 14, so the api total drops by 3 because `list()` and its 3 tests are gone).

### Task A6: Inline the `createResendClient` wrapper

**Files:**
- Delete: `packages/transactional/src/client.ts`
- Modify: `packages/transactional/src/utils/send-email.ts`
- Modify: `packages/transactional/src/index.ts`

- [ ] **Step 1: Remove the re-export from the package barrel**

In `packages/transactional/src/index.ts`, delete lines 1-2:
```ts
// Client
export { createResendClient } from "./client";
```
The file becomes:
```ts
// Components
export { AcmeLogo } from "./components/acme-logo";
export { Button } from "./components/button";
export { Card } from "./components/card";
export { Divider } from "./components/divider";

// Utilities
export { sendEmail, sendBatchEmails, previewEmail } from "./utils/send-email";
export {
  sendChangeEmailConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignUpAttemptEmail,
} from "./utils/senders";

// Theme
export { emailTheme, tailwindConfig } from "./styles/theme";
```

- [ ] **Step 2: Replace `createResendClient` call sites with `new Resend(apiKey)`**

In `packages/transactional/src/utils/send-email.ts`:

1. Replace the import block at the top:
```ts
import { createResendClient } from "../client";
```
with:
```ts
import { Resend } from "resend";
```

2. Replace line 51 (inside `sendEmail`):
```ts
const resend = createResendClient(apiKey);
```
with:
```ts
const resend = new Resend(apiKey);
```

3. Replace line 104 (inside `sendBatchEmails`):
```ts
const resend = createResendClient(apiKey);
```
with:
```ts
const resend = new Resend(apiKey);
```

The existing `if (!apiKey) throw new Error("API key is required for sending emails")` guard at the top of each function already covers the empty-key case that `createResendClient` was guarding.

- [ ] **Step 3: Delete the wrapper file**

```bash
rm packages/transactional/src/client.ts
```

- [ ] **Step 4: Verify transactional builds + typechecks**

Run: `pnpm --filter @repo/transactional typecheck && pnpm --filter @repo/transactional build`
Expected: both clean.

- [ ] **Step 5: Verify nothing else imported `createResendClient`**

Run: `git grep -n "createResendClient"`
Expected: zero matches.

### Task A7: Fix the `lucide-react` phantom dep

**Files:**
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Confirm `lucide-react` is unused inside `packages/ui/src`**

Run: `git grep -n "lucide-react" packages/ui/src`
Expected: zero matches.

- [ ] **Step 2: Remove from `packages/ui/package.json` dependencies**

In `packages/ui/package.json`, remove the `"lucide-react": "^1.14.0",` line from the `dependencies` block. (Do not add it anywhere — `apps/web` and `apps/landing` both already list it.)

- [ ] **Step 3: Reinstall and verify**

```bash
pnpm install
pnpm typecheck
pnpm build --filter @repo/ui
pnpm build --filter web
pnpm build --filter landing
```
Expected: all clean.

### Task A8: Remove unused `@tanstack/react-form` devDep from `packages/auth`

**Files:**
- Modify: `packages/auth/package.json`

- [ ] **Step 1: Confirm it is not imported anywhere in `packages/auth/src`**

Run: `git grep -n "@tanstack/react-form" packages/auth`
Expected: only the `package.json` match.

- [ ] **Step 2: Remove the devDependency line**

In `packages/auth/package.json`, remove `"@tanstack/react-form"` from the `devDependencies` block.

- [ ] **Step 3: Reinstall and verify**

```bash
pnpm install
pnpm --filter @repo/auth typecheck
pnpm --filter @repo/auth test
```
Expected: both clean.

### Task A9: Final verification + commit + push + PR

- [ ] **Step 1: Run the full check suite**

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm fallow:dead
pnpm build
```
Expected: every command green. `pnpm fallow:dead` should now report zero unused deps.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "refactor(api,transactional,ui,auth): collapse UserService, drop createResendClient, fix phantom deps

- apps/api: collapse UserService class to module-level async functions
  in apps/api/src/lib/users.ts; extract a single userSelect constant;
  drop the unused list() method; move the test file to lib/users.test.ts.
  Routes/v1/users.ts updated to call the new named functions.
- packages/transactional: drop createResendClient wrapper; call sites
  use new Resend(apiKey) directly. The existing apiKey guard in
  sendEmail and sendBatchEmails already covers the missing-key case.
- packages/ui: remove unused lucide-react dependency (apps/web and
  apps/landing already list it where it is actually imported).
- packages/auth: remove unused @tanstack/react-form devDependency."
```

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin refactor/api-collapse-user-service
gh pr create --title "refactor: collapse UserService + drop createResendClient + fix phantom deps" --body "$(cat <<'EOF'
## Summary
- Collapses the single-use \`UserService\` class to module-level async functions in \`apps/api/src/lib/users.ts\`, extracts a shared \`userSelect\` constant, drops the unused \`list()\` method, and moves the test file alongside.
- Removes \`packages/transactional/src/client.ts\` — the \`createResendClient\` wrapper was a 5-line throw-if-empty check; call sites now use \`new Resend(apiKey)\` directly and the existing per-function \`apiKey\` guards cover the missing-key case.
- Drops the phantom \`lucide-react\` dependency from \`@repo/ui\` (it is only imported in \`apps/web\` and \`apps/landing\`, which already list it).
- Drops the unused \`@tanstack/react-form\` devDependency from \`@repo/auth\`.

Spec: \`docs/superpowers/specs/2026-05-26-deslop-standardization-design.md\` (PR A).

## Test plan
- [x] \`pnpm typecheck\` clean
- [x] \`pnpm test\` green (api tests now 62)
- [x] \`pnpm fallow:dead\` reports no unused deps
- [x] \`pnpm build\` clean across all packages
- [ ] CI green on merge
EOF
)"
```

---

## PR B — Patterns + transactional rename + CONVENTIONS.md

### Task B1: Branch off main

- [ ] **Step 1: Create branch**

```bash
git fetch origin main
git checkout -b refactor/patterns-and-conventions origin/main
pnpm install
```

- [ ] **Step 2: Confirm green baseline**

Run: `pnpm typecheck && pnpm test`
Expected: All checks pass.

### Task B2: Change `DELETE /me` to 204 No Content

**Files:**
- Modify: `apps/api/src/routes/v1/users.ts` (the `deleteMeRoute` schema + handler)

- [ ] **Step 1: Update the route schema**

In `apps/api/src/routes/v1/users.ts`, replace the `responses` block of `deleteMeRoute`:

Old (lines 118-127 in the current file):
```ts
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
      description: "Account deleted",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
  },
```

New:
```ts
  responses: {
    204: {
      description: "Account deleted",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
  },
```

- [ ] **Step 2: Update the handler**

Replace the handler body:

Old:
```ts
v1UserRoutes.openapi(deleteMeRoute, async (c) => {
  const user = c.get("user");
  await userService.delete(user.id);
  return c.json({ message: "Account deleted successfully" }, 200);
});
```

New — only the return statement changes; leave the existing delete call as-is. If PR A has already merged, the call reads `await deleteUser(user.id)`; if not, it reads `await userService.delete(user.id)`. PR B does not touch that line:
```ts
v1UserRoutes.openapi(deleteMeRoute, async (c) => {
  const user = c.get("user");
  await userService.delete(user.id); // or deleteUser(user.id) post-A — leave whichever you find
  return c.body(null, 204);
});
```

- [ ] **Step 3: Verify typecheck + tests**

```bash
pnpm --filter api typecheck
pnpm --filter api test
```
Expected: both clean.

### Task B3: Stop swallowing errors in `apps/web/src/lib/auth-helpers.ts`

**Files:**
- Modify: `apps/web/src/lib/auth-helpers.ts`

- [ ] **Step 1: Replace the file**

Replace the contents of `apps/web/src/lib/auth-helpers.ts` with:

```ts
import { headers } from "next/headers";
import { cache } from "react";

import { getAuth } from "./auth";

export const getSession = cache(async () => {
  const headersList = await headers();
  return getAuth().api.getSession({ headers: headersList });
});
```

The `try/catch` and `console.error` are gone. Better Auth returns `null` for "no session" naturally; real failures (DB down, misconfig) propagate to Next.js, which renders `error.tsx` and Vercel captures the stack.

- [ ] **Step 2: Verify**

```bash
pnpm --filter web typecheck
pnpm --filter web test
```
Expected: both clean.

- [ ] **Step 3: Manual smoke (optional)**

Start `pnpm dev --filter web`, navigate to a page that calls `getSession`, confirm it still loads. (No way to force the failure path without breaking the DB; the typecheck + test pass are enough for the PR.)

### Task B4: Rename `packages/transactional/src/utils/` → `lib/`

**Files:**
- Move: `packages/transactional/src/utils/send-email.ts` → `packages/transactional/src/lib/send-email.ts`
- Move: `packages/transactional/src/utils/senders.ts` → `packages/transactional/src/lib/senders.ts`
- Modify: `packages/transactional/src/index.ts`

- [ ] **Step 1: Move the files using git mv (preserves history)**

```bash
mkdir -p packages/transactional/src/lib
git mv packages/transactional/src/utils/send-email.ts packages/transactional/src/lib/send-email.ts
git mv packages/transactional/src/utils/senders.ts packages/transactional/src/lib/senders.ts
rmdir packages/transactional/src/utils
```

- [ ] **Step 2: Update the barrel exports in `packages/transactional/src/index.ts`**

Change:
```ts
export { sendEmail, sendBatchEmails, previewEmail } from "./utils/send-email";
export {
  sendChangeEmailConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignUpAttemptEmail,
} from "./utils/senders";
```
to:
```ts
export { sendEmail, sendBatchEmails, previewEmail } from "./lib/send-email";
export {
  sendChangeEmailConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignUpAttemptEmail,
} from "./lib/senders";
```

- [ ] **Step 3: Update any cross-file imports inside `packages/transactional/src/lib/`**

`senders.ts` may import from `./send-email`; since both files moved together, relative imports stay the same. Confirm:
```bash
git grep -n "from \"\\.\\./utils" packages/transactional
```
Expected: zero matches.

- [ ] **Step 4: Verify**

```bash
pnpm --filter @repo/transactional typecheck
pnpm --filter @repo/transactional build
pnpm --filter @repo/transactional test
```
Expected: all clean.

### Task B5: Write `docs/CONVENTIONS.md`

**Files:**
- Create: `docs/CONVENTIONS.md`

- [ ] **Step 1: Create the file**

Write `docs/CONVENTIONS.md`:

```markdown
# Conventions

This document records the defaults used across the acme monorepo. New code should follow them; existing code that diverges is a candidate for a slop-cleanup pass.

## API responses

- Success with a body: `{ data: ... }`. The envelope makes it easy to add `meta` later without breaking clients.
- Success with no body: `204 No Content`. Used by `DELETE /api/v1/me` and other operations that have no useful payload.
- Errors: `{ error: { code, message, details? } }`, produced exclusively by the central error handler in `apps/api/src/middleware/error-handler.ts`. Route handlers throw `AppError`, `HTTPException`, or let Zod / Prisma errors propagate — they never return error-shaped JSON directly.

## Errors

- Never swallow into `null`, `{}`, or empty arrays. A returned-null on the success path is fine when it means "no row"; a returned-null in a catch block is silent failure.
- In api middleware and route handlers: throw `HTTPException` (for HTTP-specific errors) or `AppError` (for domain errors). The central handler renders the response and logs via `c.var.logger`.
- In Next.js RSC helpers (e.g. `apps/web/src/lib/auth-helpers.ts`): do not wrap in try/catch unless you are handling a *specific* expected error. Let unknown failures propagate — Next.js renders `error.tsx` and Vercel captures the stack with full context.
- `console.error` is not a logger. The api uses `c.var.logger` (from `@hono/structured-logger`); the web app relies on Next.js + Vercel error capture for thrown exceptions.

## File organization

- One `lib/` folder per app and per package. No `services/`, no `utils/`, no `helpers/`.
- Filename equals subject: `users.ts`, not `user.service.ts` or `userHelpers.ts`.
- Tests sit next to the file they cover: `users.ts` + `users.test.ts`.

## Service shape

- Prefer module-level exported async functions.
- Reach for a class only when there is real per-instance state (rare in our codebase — Prisma's singleton and Better Auth's instance are the only current examples, both encapsulated in their own packages).

## Comments

- WHY-only. The code already says WHAT.
- No historical references: don't write "added for #93", "removed X", "previously did Y". Those belong in the PR description and git log.
- One short line is the norm. Multi-line comment blocks need real justification (a non-obvious invariant, a hidden constraint, a subtle workaround).

## Test mocks

- No `as unknown as X` casts to fake framework types in test files. Use shared typed helpers (e.g. `apps/api/src/middleware/test-helpers.ts`).
- Mocks should be the minimum needed for the test. If a test only needs `c.set` and `c.var.logger`, the helper should only expose those.

## Forms

- `@tanstack/react-form`, never `react-hook-form`.
- Validate `onBlur` + `onChange` with Zod schemas.
- Display errors with `field.state.meta.isTouched && !field.state.meta.isValid`.
- Never call `field.handleChange` inside `useEffect` or `useCallback` with `field` in deps — use `field.form.setFieldValue(field.name, value)` with stable refs.

## Tooling

- Linter: oxlint. Not ESLint.
- Formatter: oxfmt. Not Prettier.
- Bundler (api): tsdown.
- Bundler (web/landing): Next.js' Turbopack in dev, native in build.

## Routes

- API versioned under `/api/v1/*`. Better Auth at `/auth/*`. Health at `/healthz` and `/readyz`.
- Path alias: `@/*` maps to `src/*` in every app and package.
```

### Task B6: Link `CONVENTIONS.md` from `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add a one-line pointer near the top of CLAUDE.md, right after the `Commands` section heading or in the existing intro**

In `CLAUDE.md`, find the line `This file provides guidance to AI coding agents when working with code in this repository.` and add immediately after it:

```markdown

Project conventions and defaults are documented in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).
```

### Task B7: Final verification + commit + push + PR

- [ ] **Step 1: Run the full check suite**

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```
Expected: every command green.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "refactor(api,web,transactional,docs): normalize DELETE/me to 204, unswallow RSC auth errors, rename transactional utils/->lib/, add CONVENTIONS.md

- DELETE /api/v1/me now responds 204 No Content instead of returning
  { message: \"Account deleted...\" }. The route schema and handler
  updated; no e2e currently covers this endpoint.
- apps/web/src/lib/auth-helpers.ts drops its try/catch + console.error.
  Better Auth returns null for \"no session\" naturally; real failures
  propagate to Next.js error boundaries and Vercel error capture.
- packages/transactional: utils/ -> lib/ (git mv preserves history),
  barrel exports updated.
- docs/CONVENTIONS.md captures the defaults that future code reviews
  can point at."
```

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin refactor/patterns-and-conventions
gh pr create --title "refactor: normalize delete response, unswallow RSC auth, rename transactional lib/, add CONVENTIONS.md" --body "$(cat <<'EOF'
## Summary
- \`DELETE /api/v1/me\` → 204 No Content (was \`200 { message }\`, the only outlier in the route response envelope).
- \`apps/web/src/lib/auth-helpers.ts\` drops the \`try/catch\` + \`console.error\` that conflated "no session" with "DB down" — failures now propagate to \`error.tsx\` and Vercel captures the stack.
- \`packages/transactional/src/utils/\` → \`packages/transactional/src/lib/\` (git mv preserves history). Aligns with one-\`lib/\`-per-package convention.
- New \`docs/CONVENTIONS.md\` codifies the defaults future code review can point at; \`CLAUDE.md\` links to it.

Spec: \`docs/superpowers/specs/2026-05-26-deslop-standardization-design.md\` (PR B).

## Test plan
- [x] \`pnpm typecheck\` clean
- [x] \`pnpm test\` green
- [x] \`pnpm build\` clean
- [ ] Manual: \`DELETE /api/v1/me\` returns 204 with no body
- [ ] CI green on merge
EOF
)"
```

---

## PR C — Comment + cast hygiene

### Task C1: Branch off main

- [ ] **Step 1: Create branch**

```bash
git fetch origin main
git checkout -b refactor/hygiene-comments-and-test-helpers origin/main
pnpm install
```

- [ ] **Step 2: Confirm green baseline**

Run: `pnpm typecheck && pnpm test`
Expected: All checks pass.

### Task C2: Create the shared test-context helper

**Files:**
- Create: `apps/api/src/middleware/test-helpers.ts`

- [ ] **Step 1: Write the helper**

Write `apps/api/src/middleware/test-helpers.ts`:

```ts
import type { Context } from "hono";
import { vi } from "vitest";

type CreateMockContextOptions = {
  headers?: Record<string, string>;
  variables?: Record<string, unknown>;
};

export type MockContextMocks = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  body: ReturnType<typeof vi.fn>;
  header: ReturnType<typeof vi.fn>;
  reqHeader: ReturnType<typeof vi.fn>;
  loggerError: ReturnType<typeof vi.fn>;
  loggerInfo: ReturnType<typeof vi.fn>;
};

// One cast is unavoidable because Hono's Context surface is too large
// to fully mock; consolidating to one helper means test files stay cast-free.
export const createMockContext = (
  opts: CreateMockContextOptions = {},
): { ctx: Context; mocks: MockContextMocks } => {
  const variables = new Map<string, unknown>(Object.entries(opts.variables ?? {}));

  const mocks: MockContextMocks = {
    get: vi.fn((key: string) => variables.get(key)),
    set: vi.fn((key: string, value: unknown) => {
      variables.set(key, value);
    }),
    json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    body: vi.fn((body: unknown, status?: number) => ({ body, status })),
    header: vi.fn(),
    reqHeader: vi.fn((name: string) => opts.headers?.[name]),
    loggerError: vi.fn(),
    loggerInfo: vi.fn(),
  };

  const ctx = {
    get: mocks.get,
    set: mocks.set,
    var: { logger: { error: mocks.loggerError, info: mocks.loggerInfo } },
    req: {
      header: mocks.reqHeader,
      method: "GET",
      path: "/test",
      url: "http://localhost/test",
    },
    json: mocks.json,
    body: mocks.body,
    header: mocks.header,
  } as unknown as Context;

  return { ctx, mocks };
};
```

- [ ] **Step 2: Verify the helper compiles in isolation**

Run: `pnpm --filter api typecheck`
Expected: clean.

### Task C3: Refactor `auth.test.ts` to use the shared helper

**Files:**
- Modify: `apps/api/src/middleware/auth.test.ts`

- [ ] **Step 1: Replace the file contents**

Write `apps/api/src/middleware/auth.test.ts`:

```ts
import type { Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

import { auth } from "@/lib/auth";

import { authMiddleware, optionalAuthMiddleware } from "./auth";
import { createMockContext } from "./test-helpers";

const mockSession = {
  session: { id: "session-1" },
  user: {
    displayName: "Test User",
    email: "test@example.com",
    id: "user-1",
    username: "testuser",
  },
};

describe("authMiddleware", () => {
  const next: Next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets user on context when session is valid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx, mocks } = createMockContext({ headers: { Authorization: "Bearer token123" } });

    await authMiddleware(ctx, next);

    expect(mocks.set).toHaveBeenCalledWith("user", {
      displayName: "Test User",
      email: "test@example.com",
      id: "user-1",
      username: "testuser",
    });
    expect(next).toHaveBeenCalled();
  });

  it("forwards Authorization header to getSession", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx } = createMockContext({ headers: { Authorization: "Bearer abc" } });

    await authMiddleware(ctx, next);

    const calledHeaders = vi.mocked(auth.api.getSession).mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Authorization")).toBe("Bearer abc");
  });

  it("forwards Cookie header to getSession", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx } = createMockContext({ headers: { Cookie: "session=abc123" } });

    await authMiddleware(ctx, next);

    const calledHeaders = vi.mocked(auth.api.getSession).mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Cookie")).toBe("session=abc123");
  });

  it("throws 401 when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(ctx, next)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws 401 when session has no user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ session: {}, user: null } as never);
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
  });

  it("throws 503 when getSession throws", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error("DB down"));
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(ctx, next)).rejects.toMatchObject({
      status: 503,
    });
  });
});

describe("optionalAuthMiddleware", () => {
  const next: Next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets user when session is valid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx, mocks } = createMockContext({ headers: { Authorization: "Bearer token" } });

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).toHaveBeenCalledWith("user", {
      displayName: "Test User",
      email: "test@example.com",
      id: "user-1",
      username: "testuser",
    });
    expect(next).toHaveBeenCalled();
  });

  it("calls next without setting user when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    const { ctx, mocks } = createMockContext();

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("calls next without setting user when getSession throws", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error("DB down"));
    const { ctx, mocks } = createMockContext();

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("does not set user when session exists but user is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ session: {}, user: null } as never);
    const { ctx, mocks } = createMockContext();

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run auth tests**

Run: `pnpm --filter api test -- src/middleware/auth.test.ts`
Expected: 10 tests passing, no `as unknown as` in the file.

### Task C4: Refactor `error-handler.test.ts` to use the shared helper

**Files:**
- Modify: `apps/api/src/middleware/error-handler.test.ts`

- [ ] **Step 1: Replace the file contents**

Write `apps/api/src/middleware/error-handler.test.ts`:

```ts
import { HTTPException } from "hono/http-exception";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "development" },
}));

import { env } from "@/lib/env";

import { AppError, errorHandler, notFound } from "./error-handler";
import { createMockContext } from "./test-helpers";

describe("AppError", () => {
  it("uses default statusCode 500 and isOperational true", () => {
    const error = new AppError("Something broke");
    expect(error.message).toBe("Something broke");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.code).toBeUndefined();
  });

  it("accepts custom statusCode and isOperational", () => {
    const error = new AppError("Not found", 404, false);
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(false);
  });

  it("accepts optional error code", () => {
    const error = new AppError("Bad", 400, true, "VALIDATION_FAILED");
    expect(error.code).toBe("VALIDATION_FAILED");
  });

  it("has a stack trace", () => {
    const error = new AppError("Test");
    expect(error.stack).toBeDefined();
  });
});

describe("errorHandler", () => {
  it("handles HTTPException", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new HTTPException(403, { message: "Forbidden" });

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "HTTP_EXCEPTION", message: "Forbidden" } },
      403,
    );
  });

  it("handles ZodError with field details", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new ZodError([
      {
        code: "too_small",
        inclusive: true,
        message: "Required",
        minimum: 1,
        origin: "string",
        path: ["name"],
      },
    ]);

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      {
        error: {
          code: "VALIDATION_ERROR",
          details: [{ field: "name", message: "Required" }],
          message: "Validation failed",
        },
      },
      400,
    );
  });

  it("handles AppError with custom code", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new AppError("User not found", 404, true, "USER_NOT_FOUND");

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "USER_NOT_FOUND", message: "User not found" } },
      404,
    );
  });

  it("handles AppError without code defaulting to APP_ERROR", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new AppError("Something wrong", 422);

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "APP_ERROR", message: "Something wrong" } },
      422,
    );
  });

  it("handles P2002 as 409 DUPLICATE_ENTRY", async () => {
    const { ctx, mocks } = createMockContext();
    const err = Object.assign(new Error("Unique constraint failed"), {
      clientVersion: "7.0.0",
      code: "P2002",
    });

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "DUPLICATE_ENTRY", message: "A record with this value already exists" } },
      409,
    );
  });

  it("handles P2025 as 404 NOT_FOUND", async () => {
    const { ctx, mocks } = createMockContext();
    const err = Object.assign(new Error("Record not found"), {
      clientVersion: "7.0.0",
      code: "P2025",
    });

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Record not found" } },
      404,
    );
  });

  it("includes error message and stack in development", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new Error("dev error");

    await errorHandler(err, ctx);

    const call = mocks.json.mock.calls[0];
    expect(call?.[0]?.error?.message).toBe("dev error");
    expect(call?.[0]?.error?.stack).toBeDefined();
    expect(call?.[1]).toBe(500);
  });

  it("hides error message in production", async () => {
    const mutableEnv = env as { NODE_ENV: string };
    mutableEnv.NODE_ENV = "production";

    const { ctx, mocks } = createMockContext();
    const err = new Error("secret detail");

    await errorHandler(err, ctx);

    const call = mocks.json.mock.calls[0];
    expect(call?.[0]?.error?.message).toBe("An unexpected error occurred");
    expect(call?.[0]?.error?.stack).toBeUndefined();

    mutableEnv.NODE_ENV = "development";
  });
});

describe("notFound", () => {
  it("returns 404 with NOT_FOUND code", () => {
    const { ctx, mocks } = createMockContext();

    notFound(ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Resource not found" } },
      404,
    );
  });
});
```

- [ ] **Step 2: Run error-handler tests**

Run: `pnpm --filter api test -- src/middleware/error-handler.test.ts`
Expected: all passing, no `as unknown as` in the file.

### Task C5: Refactor `security.test.ts` to use the shared helper

**Files:**
- Modify: `apps/api/src/middleware/security.test.ts`

- [ ] **Step 1: Replace the file contents**

Write `apps/api/src/middleware/security.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { requestSizeLimit } from "./security";
import { createMockContext } from "./test-helpers";

describe("requestSizeLimit", () => {
  const next = vi.fn();

  it("rejects requests exceeding max size", async () => {
    const middleware = requestSizeLimit(1024);
    const { ctx, mocks } = createMockContext({ headers: { "content-length": "2048" } });

    await middleware(ctx, next);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" } },
      413,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("passes requests within size limit", async () => {
    const middleware = requestSizeLimit(1024);
    const { ctx } = createMockContext({ headers: { "content-length": "512" } });

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("passes requests with no content-length header", async () => {
    const middleware = requestSizeLimit(1024);
    const { ctx } = createMockContext();

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("uses default 10MB limit when no argument provided", async () => {
    const middleware = requestSizeLimit();
    const { ctx } = createMockContext({ headers: { "content-length": "5000000" } });

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("rejects when exceeding default 10MB limit", async () => {
    const middleware = requestSizeLimit();
    const { ctx, mocks } = createMockContext({ headers: { "content-length": "20000000" } });

    await middleware(ctx, next);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" } },
      413,
    );
  });
});
```

- [ ] **Step 2: Run security tests**

Run: `pnpm --filter api test -- src/middleware/security.test.ts`
Expected: all passing, no `as unknown as` in the file.

- [ ] **Step 3: Confirm zero `as unknown as` casts remain in any middleware test**

Run: `git grep -n "as unknown as" apps/api/src/middleware`
Expected: zero matches.

### Task C6: Trim cookie-Secure comment in `packages/auth/src/server.ts`

**Files:**
- Modify: `packages/auth/src/server.ts:55-72`

- [ ] **Step 1: Replace the 12-line comment block**

In `packages/auth/src/server.ts`, replace lines 59-71 (the multi-paragraph block above `useSecureCookies:`) with a single-line comment:

Old (lines 59-71):
```ts
      // Force the `Secure` cookie flag when WEB_APP_URL is HTTPS. The
      // dynamic-baseURL `protocol: "auto"` setting documents this as
      // automatic, but in practice under Next.js + a reverse proxy
      // (portless in dev, Vercel in prod), Better Auth doesn't reliably
      // see the HTTPS scheme via `x-forwarded-proto` or `request.url`,
      // so cookies end up without `Secure`.
      //
      // WEB_APP_URL is the explicit signal we already use everywhere:
      // set to `https://acme.web.localhost` in dev (.env.example) and
      // `https://app.acme.com` in prod; unset in CI (which runs on
      // plain http://127.0.0.1) — so the gate naturally avoids the
      // HTTPS-in-CI footgun that bare `true` or NODE_ENV gating would
      // re-introduce.
      useSecureCookies: process.env.WEB_APP_URL?.startsWith("https://") === true,
```

New:
```ts
      // Reverse proxy (portless / Vercel) hides the HTTPS scheme from Better Auth's auto-detection;
      // gate on WEB_APP_URL instead — unset in CI keeps tests on plain HTTP.
      useSecureCookies: process.env.WEB_APP_URL?.startsWith("https://") === true,
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter @repo/auth typecheck
pnpm --filter @repo/auth test
```
Expected: both clean.

### Task C7: Trim the env-throw comment in `apps/api/src/lib/env.ts`

**Files:**
- Modify: `apps/api/src/lib/env.ts:18-23`

- [ ] **Step 1: Drop the defensive justification**

Replace:
```ts
if (!parsedEnv.success) {
  // Throwing at module load aborts the process with a stack trace; preferable to
  // process.exit which loses context and conflicts with unicorn/no-process-exit.
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
  );
}
```
with:
```ts
if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter api typecheck
pnpm --filter api test
```
Expected: both clean.

### Task C8: Trim the optional-auth-middleware comment

**Files:**
- Modify: `apps/api/src/middleware/auth.ts:80-87`

- [ ] **Step 1: Compress the parenthetical**

In `apps/api/src/middleware/auth.ts`, replace lines 81-83:

Old:
```ts
  } catch (error) {
    // Unexpected failures (DB down, malformed token, rate limit exception) must
    // not be silently discarded — a missing user context is otherwise
    // indistinguishable from an infrastructure outage.
    c.var.logger.error(
```

New:
```ts
  } catch (error) {
    // Log unexpected failures; a missing user context is otherwise indistinguishable from an outage.
    c.var.logger.error(
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter api typecheck
pnpm --filter api test
```
Expected: both clean.

### Task C9: Quick sweep for other AI-slop comments

This step is bounded — look at the files below; if a comment is WHAT-shaped, redundant, or history-shaped, trim it. Do not rewrite WHY-comments that are pulling their weight. Maximum ~10 minutes; this is not a rabbit hole.

**Files to scan (one at a time):**
- `apps/api/src/index.ts`
- `apps/api/src/lib/auth.ts`
- `apps/api/src/lib/openapi.ts`
- `apps/api/src/middleware/security.ts`
- `apps/api/src/routes/v1/users.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/middleware.ts`
- `packages/auth/src/server.ts` (rest of the file after C6)

- [ ] **Step 1: For each file, open and look at every comment**

  Ask of each comment:
  - Does it explain a NON-obvious WHY?
  - Or does it restate WHAT the next line of code does?
  - Or does it reference a past task / commit / PR / TODO that is no longer live?

  Trim or delete the second and third kinds. Leave the first kind alone.

- [ ] **Step 2: Run lint + format**

```bash
pnpm lint
pnpm format:check
```
Expected: clean.

### Task C10: Final verification + commit + push + PR

- [ ] **Step 1: Run the full check suite**

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```
Expected: every command green; api test count unchanged at 56 (the structural test moves are PR A, not PR C).

- [ ] **Step 2: Confirm zero `as unknown as` casts in middleware tests**

Run: `git grep -n "as unknown as" apps/api/src/middleware`
Expected: zero matches.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(api,auth): consolidate test Context mock + trim AI-slop comments

- New apps/api/src/middleware/test-helpers.ts exports createMockContext;
  three middleware test files now use it and drop their inline mocks.
  The one remaining \`as unknown as Context\` cast sits inside the helper
  rather than scattered across test files.
- Comment trims: collapse the 12-line cookie-Secure block in
  packages/auth/src/server.ts; drop the env-throw justification in
  apps/api/src/lib/env.ts; compress the optional-auth-middleware
  parenthetical in apps/api/src/middleware/auth.ts. Light sweep across
  api/web/auth for WHAT- and history-shaped comments."
```

- [ ] **Step 4: Push and open PR**

```bash
git push -u origin refactor/hygiene-comments-and-test-helpers
gh pr create --title "refactor: shared Context test helper + comment hygiene pass" --body "$(cat <<'EOF'
## Summary
- New \`apps/api/src/middleware/test-helpers.ts\` exposes \`createMockContext\`. Three middleware test files drop their inline mocks and use it; the one remaining \`as unknown as Context\` cast sits inside the helper.
- Trims the 12-line cookie-Secure block in \`packages/auth/src/server.ts\` to one sentence on the reverse-proxy edge case.
- Drops the "throwing vs process.exit" defense in \`apps/api/src/lib/env.ts\`.
- Compresses the optional-auth-middleware parenthetical in \`apps/api/src/middleware/auth.ts\`.
- Light sweep across api/web/auth for WHAT- and history-shaped comments.

Spec: \`docs/superpowers/specs/2026-05-26-deslop-standardization-design.md\` (PR C).

## Test plan
- [x] \`pnpm typecheck\` clean
- [x] \`pnpm test\` green
- [x] \`pnpm lint\` clean
- [x] \`git grep "as unknown as" apps/api/src/middleware\` → zero matches
- [ ] CI green on merge
EOF
)"
```

---

## Done criteria

- Preflight PR merged → main has green CI.
- PRs A, B, C all open, reviewed, and merged.
- `pnpm fallow:dead` reports no unused deps.
- `docs/CONVENTIONS.md` exists and is linked from `CLAUDE.md`.
- `git grep "as unknown as" apps/api/src/middleware` → zero matches.
- `git grep "createResendClient"` → zero matches.
- `apps/api/src/services/` no longer exists.
- `packages/transactional/src/utils/` no longer exists.
