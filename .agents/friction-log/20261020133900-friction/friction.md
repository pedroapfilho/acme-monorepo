---
title: 'Playwright cleanup throws when auth setup never wrote storage state'
severity: 'minor'
---

### Expected Behavior

A failed auth setup reports its original failure and teardown can finish when no seeded storage state was produced.

### Current Behavior

Global teardown always opens tests/e2e/.auth/user.json. When setup fails before writing the file, teardown adds an ENOENT error outside the tests, obscuring the setup failure.

### Possible Solution

Only sign out a seeded session when setup produced storage state, or express seeded-session cleanup as a setup-project teardown dependency.

### Minimal Reproducible Example

Run Playwright in a fresh worktree with an unreachable web app or an untrusted local HTTPS certificate. Setup fails before request.storageState, then tests/e2e/teardown/cleanup.ts:7 fails while opening user.json.

### Context

Encountered during disposable local validation of the E2E account lifecycle fixes. The certificate prerequisite was corrected and the browser suite rerun. This entry concerns the repository teardown behavior, not machine certificate configuration.
