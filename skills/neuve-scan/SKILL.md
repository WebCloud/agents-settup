---
name: neuve-scan
description: Use neuve scan for changed-surface ranking, file grouping, delegation boundaries, artifact refs, and blast-radius orientation during review.
---

# Neuve Scan

Use this skill when a reviewer needs to understand the changed surface before deep inspection: files, areas, broad-change reasons, generated/docs/test/config splits, lane boundaries, and ranked review priority.

`scan` is read-only Git analysis. It does not check out commits, mutate Git state, prove correctness, or replace source/correctness investigation.

## First Commands

Start with:

```sh
neuve scan
neuve scan --files-only
neuve scan --details
```

Use blame when ranking or grouping needs explanation:

```sh
neuve scan --blame
```

For historical inspection without checkout:

```sh
neuve scan --commit HEAD~1 --no-store
```

For strict-review dogfood where the lane should not create a final command
artifact, combine the cache/store boundary with terminal-only output:

```sh
neuve scan --no-store --no-artifact
```

Use `--base <ref>` and `--head <ref>` when reviewing a non-default range. Use `--include-uncommitted` only when local worktree changes are in scope.

Choose the range explicitly:

- For a branch range review, use the intended `--base <ref>` and `--head <ref>` when the default range is not the target.
- For a branch range review with local worktree changes, preserve the intended `--base <ref>`, preserve the intended `--head <ref>`, and preserve `--include-uncommitted`; do not force `HEAD..HEAD` because that would hide committed branch work.
- For a local-worktree-only review of staged, unstaged, or untracked changes on top of current `HEAD`, use:

```sh
neuve scan --base HEAD --head HEAD --include-uncommitted
neuve scan --base HEAD --head HEAD --include-uncommitted --files-only
```

## Drill-Downs

Use:

- `--files-only` to get complete changed files grouped by review priority.
- `--details` to show more ranked areas and files.
- `--blame` to inspect ranking trace metadata.
- `--all` only when the visible ranked tree is insufficient.
- `--debug` only for command diagnostics and classifier-stage manifests.

If scan reveals source-truth or correctness gaps, move to `neuve sources`. If scan reveals routing or delegation questions, move to `neuve triage`.

## Artifacts And Evidence

Record:

- Command, range, commit, worktree mode, and whether store writes were disabled.
- `.neuve-artifact/scan-*.json`.
- Object chunk refs when full changed-surface detail is needed.
- Ranked areas/files that determined lane assignment or review order.
- Any broad-change, generated-file, test-only, config, or support/evidence grouping that changed reviewer focus.

Use scan evidence to plan inspection and delegation boundaries. Findings still require independent evidence from code, tests, docs, or runtime behavior.

`--no-store` skips local metadata/cache/read-model writes. `--no-artifact`
skips the final `.neuve-artifact/scan-*.json` command artifact and its
artifact drill-down footer. Terminal-only scan output is orientation only and
does not clear source truth, verifier, checkpoint, lane, delegation, merge, or
correctness gates.

## AX Feedback

Record feedback when file grouping is misleading, a broad change is over- or under-ranked, generated files are not labeled clearly, `--files-only` is not enough for delegation, or next commands are not useful.

```sh
neuve feedback record \
  --kind focus-usefulness \
  --rating helped \
  --command scan \
  --target review-lane-routing \
  --artifact .neuve-artifact/scan-...json \
  --note "Files-only view quickly separated schema changes from fixture updates."
```

## Must Not Use For

- Do not use `scan` as correctness proof.
- Do not infer source truth from changed-file names alone.
- Do not let scan ranking hide low-ranked files from required lane review.
- Do not use debug or all-output modes as the default review transcript.
- Do not paste raw diffs, source bodies, or full artifacts into review notes.
