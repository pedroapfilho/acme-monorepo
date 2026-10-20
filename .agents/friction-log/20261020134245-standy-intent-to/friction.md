---
title: 'Standy intent-to-add guidance conflicts with partial commits'
severity: 'minor'
---

### Expected Behavior

The documented Standy changed-file check and the pre-commit hook should compose when preparing separate commits.

### Current Behavior

AGENTS.md asks for git add -N on new files before standy check. lint-staged then refuses a commit while any such intent-to-add file remains in the index, even when that file is unrelated to the staged commit.

### Possible Solution

Document resetting intent-to-add entries after the Standy check, or fully stage every new file before invoking the pre-commit hook.

### Minimal Reproducible Example

Create two new files, use git add -N on one and fully stage the other, then commit. Husky fails with lint-staged refused to run with files staged with --intent-to-add. Reset the intent-to-add file and the hook succeeds.

### Context

Encountered while splitting the E2E seed guard and account lifecycle fixes into coherent commits. No hook was bypassed.
