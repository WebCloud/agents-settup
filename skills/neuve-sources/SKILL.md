---
name: neuve-sources
description: Use neuve sources for review investigation of a range or implementation file, including usage/blast-radius, history, correctness context, artifact refs, and advisory weak evidence.
---

# Neuve Sources

Use this skill when review correctness depends on understanding how to review a range or implementation file: affected usage, blast radius, relevant history, correctness context, risk, tests, and next review actions.

`sources` is review investigation support. The expected reviewer flow is:

```text
range/file -> usage and blast radius -> git history -> correctness context -> review actions
```

Docs, tickets, issues, PRs, handovers, and commits are correctness/context outputs from the investigation. Do not start by assuming one doc is authoritative unless the human or dispatch packet pins it with `--truth`.

Workflow manifests and review packs may require a focused `sources` run before dispatch, but they do not change the evidence hierarchy. `sources` output, provider sidecars, and source-review read models are local evidence/advisory context; generated skill text is only a guide over those artifacts.

## First Commands

Start with the current range:

```sh
neuve sources
neuve sources --details
neuve sources --blame
```

For a file that matters to the review, focus the implementation surface:

```sh
neuve sources --source path/to/checkout-calculator.rs
neuve sources --mode usage --source path/to/checkout-calculator.rs
neuve sources --source path/to/checkout-calculator.rs --details
neuve sources --source path/to/checkout-calculator.rs --blame
```

Pin explicit correctness context only when you have a real source-truth input:

```sh
neuve sources --truth docs/product/checkout-rules.md
neuve sources --source path/to/billing-webhook.ts --truth BILLING-421
```

For local-worktree-only usage-mode drill-downs, include the explicit local range and preserve the source focus:

```sh
neuve sources --base HEAD --head HEAD --mode usage --source path/to/checkout-calculator.rs --include-uncommitted
```

Choose the range explicitly:

- For a branch range review, use the intended `--base <ref>` and `--head <ref>` when the default range is not the target.
- For a branch range review with local worktree changes, preserve the intended `--base <ref>`, preserve the intended `--head <ref>`, and preserve `--include-uncommitted`; do not force `HEAD..HEAD` because that would hide committed branch work.
- For a local-worktree-only review of staged, unstaged, or untracked changes on top of current `HEAD`, use `--base HEAD --head HEAD --include-uncommitted` and preserve `--source <path>` when focusing:

```sh
neuve sources --base HEAD --head HEAD --source <path> --include-uncommitted
neuve sources --base HEAD --head HEAD --mode usage --source <path> --include-uncommitted
neuve sources --base HEAD --head HEAD --source <path> --details --include-uncommitted
neuve sources --base HEAD --head HEAD --source <path> --blame --include-uncommitted
```

Use `--approved-root <path>` only when the default source roots are too narrow and the root is intentionally approved.

For strict-review dogfood where the lane should not create a final command
artifact, combine the cache/store boundary with terminal-only output:

```sh
neuve sources --no-store --no-artifact
```

## Drill-Downs

When supported by the local CLI build, narrow by investigation mode:

```sh
neuve sources --mode usage --source path/to/file
neuve sources --mode history --source path/to/file
neuve sources --mode correctness --source path/to/file
neuve sources --mode risk --source path/to/file
```

Use `--all` only when the compact and detailed views cannot answer the review question. Use `--debug` for stage-manifest and diagnostics, not ordinary review evidence.

## Interpretation

Read source evidence by relation first, then authority and quality:

- Usage/blast-radius signal points to callers, references, tests, package neighbors, or absence reasons.
- Git-history signal points to prior edits, co-change clusters, reverts, bugfixes, corrections, or incident language.
- Correctness context points to specs, DoD, decisions, tickets, handovers, PRs, commits, deviations, or course corrections.
- Review actions translate the map into files to inspect, tests to verify, questions to ask, and risks to carry into findings.

Weak, token-only, lexical, or stale matches stay advisory. They can suggest a place to inspect, but they cannot clear a blocker or prove a source-truth relation.

History-derived blast-radius counts are co-change breadth, not direct dependency proof. Treat large buckets for central files as a reason to sample representative areas or run a narrower mode, not as a claim that every path directly uses the focus file. Prefer evidence-specific language over repeated generic rationales: name whether the signal is direct usage, definition/read-first, test reference, package neighbor, static fallback, provider absence, history co-change, correctness context, or artifact evidence.

## Artifacts And Evidence

Record:

- Command and focus: range, `--source`, `--truth`, mode, and worktree inclusion.
- Top-level artifact ref: `.neuve-artifact/sources-*.json`.
- Usage runtime sidecar refs when shown: `.neuve-artifact/source-usage-runtime/...`.
- Shared refs for investigation categories when shown in the footer.
- Which usage/history/correctness/risk signal changed the review path.
- Missing-tooling or absence reasons, especially for language-tooling and source-context gaps.

In review findings, cite direct code or source inspection as proof. Cite `sources` only as supporting signal or as evidence that the command missed, mislabeled, or over-ranked something.

`--no-store` skips reusable source cache lookup and local source cache/index
writes. `--no-artifact` skips the final `.neuve-artifact/sources-*.json`
command artifact and its artifact drill-down footer. Terminal-only sources
output is orientation only and does not clear source truth, verifier,
checkpoint, lane, delegation, merge, or correctness gates.

## AX Feedback

Record feedback when `sources` is too broad, misses obvious usage, conflates source authority with relation strength, hides artifact refs, labels weak evidence too strongly, or lacks a useful next command.

Use:

```sh
neuve feedback record \
  --kind source-truth \
  --rating confusing \
  --command sources \
  --target path/to/file \
  --artifact .neuve-artifact/sources-...json \
  --note "Correctness context was useful, but weak token match looked too authoritative."
```

## Must Not Use For

- Do not use `sources` as a source-truth selector that auto-chooses the winning doc.
- Do not treat docs, tickets, or issues as the starting point unless pinned with `--truth`.
- Do not treat weak or token-only evidence as proof.
- Do not replace manual usage, history, test, or correctness inspection.
- Do not persist or paste raw source bodies, raw diffs, secrets, or full artifacts into reviews.
- Do not let a workflow pack or generated skill turn advisory source suggestions into selected source truth.
