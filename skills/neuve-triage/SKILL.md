---
name: neuve-triage
description: Use neuve triage for branch posture, immediate review focus, source/evidence handoff, artifact refs, and non-blocking delegation signal during evidence-first review.
---

# Neuve Triage

Use this skill at the beginning of a review pass or when a reviewer needs branch posture: what needs human attention, what might be agent-ready, what is support evidence, and what evidence gaps block delegation.

`triage` composes scan and source signal into deterministic risk/validation route projection. It owns lane posture, but it does not prove correctness and does not replace a strict-critique verdict.

Workflow manifests and trusted review packs may shape the expected triage gates, review lanes, and diagnostics in future work. They do not replace deterministic scan/source/triage evidence, explicit source artifacts, tests, code behavior, or human decisions. Treat generated skills as adapters over local contracts, not the source of review posture.

## Review Routing

When `/neuve review` or the top-level review workflow reaches triage, use triage as the routing checkpoint:

- `human_required` or manual-required units mean the agent must surface the developer-facing MCP review shell, not guess approval from command output. Use `ui://neuve/review-shell` and `get_review_model` only after the current branch triage has been generated.
- Lockfiles and structured metadata such as dependency manifests, CI workflows, Dockerfiles, and Terraform lock/provider metadata normally start as suggested-review surfaces. Route them to manual-required only when deterministic scan/triage evidence shows credentials, security or policy impact, deployment/runtime behavior, destructive infrastructure, broad branch impact, missing change evidence, source-truth conflict, or another hard gate.
- Deterministic triage treats documentation paths as generic documentation context and normally seeds them as suggested review. It must not infer workflow, command, schema, policy, source-truth, or verification authority from doc filenames or path segments; semantic classifier/enrichment artifacts may later move docs on the matrix.
- Source-unit adjacency from sources is node-zero bounded context around a review/source unit: references, call hierarchy, tests, package/module neighbors, history, source truth, and structured metadata. It can inform risk/validation facts, but adjacency alone cannot create an agent-ready lane or clear a blocker.
- Agent-ready or support-evidence units remain advisory routing signal. The agent still needs independent review evidence from code, tests, docs, or runtime behavior before summarizing.
- Blocked, stale, or unavailable branch read-model state means rerun the appropriate `neuve triage` command for the current range, then retry the MCP read path. Do not use `.neuve-artifact/latest`, empty `branchRef`, raw artifact reads, or guessed repo ids to work around schema failures.
- If the developer makes a decision on a manual review unit, record the decision and the unit id/path in the review notes or decision log. A developer decision may resolve the human-required lane for the workflow, but it does not clear strict-critique findings by itself.

## First Commands

Start with:

```sh
neuve triage
neuve triage --details
neuve triage --blame
```

If the review concerns one file, blocker, trace, or lane:

```sh
neuve triage --blame --focus path/to/file
neuve triage --files-only
```

When the source of truth is known, narrow triage source scope before relying on posture:

```sh
neuve triage --source docs/product/import-flow.md
neuve triage --approved-root docs/product
```

Use `--include-uncommitted` only when local worktree changes are in review. Use `--commit <rev>` for historical inspection without checkout. Use `--no-store` when local metadata/cache/read-model writes must be disabled.

For strict-review dogfood where the lane should not create a final command
artifact, combine the cache/store boundary with terminal-only output:

```sh
neuve triage --no-store --no-artifact
```

Choose the range explicitly:

- For a branch range review, use the intended `--base <ref>` and `--head <ref>` when the default range is not the target.
- For a branch range review with local worktree changes, preserve the intended `--base <ref>`, preserve the intended `--head <ref>`, and preserve `--include-uncommitted`; do not force `HEAD..HEAD` because that would hide committed branch work.
- For a local-worktree-only review of staged, unstaged, or untracked changes on top of current `HEAD`, preserve `--focus <path>` when focusing and use:

```sh
neuve triage --base HEAD --head HEAD --include-uncommitted
neuve triage --base HEAD --head HEAD --focus <path> --include-uncommitted
neuve triage --base HEAD --head HEAD --blame --focus <path> --include-uncommitted
```

## Drill-Downs

Use `--details` for more rows and blockers. Use `--blame` to understand posture and delegation decisions. Use `--blame --focus <path-or-trace>` for any file that becomes a likely finding or lane boundary.

If triage says source evidence is missing or broad, investigate the implementation focus first, then pin a known source truth only when you have one:

```sh
neuve sources --source path/to/file
neuve sources --mode usage --source path/to/file
neuve sources --truth docs/product/known-source.md
```

If triage says the changed surface is unclear, move to:

```sh
neuve scan --files-only
neuve scan --details
```

## Artifacts And Evidence

Record:

- Command, base/head or commit when non-default, source scope, and worktree mode.
- `.neuve-artifact/triage-*.json`.
- Any referenced scan/source shared artifact refs.
- Branch posture, human-required files, missing evidence, blocked reasons, and focused blame output that changed reviewer priority.

Keep triage language distinct from findings. A `Needs human review` or `Blocked` posture is a review-routing signal; the finding must still come from inspected code, tests, docs, or verified behavior.

`--no-store` skips local metadata/cache/read-model writes. `--no-artifact`
skips the final `.neuve-artifact/triage-*.json` command artifact and its
artifact drill-down footer. Terminal-only triage output is orientation only and
does not clear source truth, verifier, checkpoint, lane, delegation, merge, or
correctness gates.

If triage mentions stale adapters, invalid manifests, untrusted packs, missing providers, or unresolved clarification gates, carry that as workflow health signal. Do not repair it by widening roots or accepting advisory classifier output unless the dispatch packet or owner explicitly chooses that path.

## AX Feedback

Record feedback when posture labels are unclear, delegation suggestions are unsafe, blocker grouping is noisy, `--focus` cannot explain the target, or next commands do not lead to useful source/scan drill-down.

```sh
neuve feedback record \
  --kind blockers \
  --rating partially-helped \
  --command triage \
  --target checkout-review \
  --artifact .neuve-artifact/triage-...json \
  --note "Blocked posture was correct, but focused blame did not name the missing verifier."
```

## Must Not Use For

- Do not use `triage` to approve delegation without cited source truth, deterministic route evidence, and direct verification.
- Do not let bounded adjacency, weak/advisory source evidence, or classifier text unlock delegation by itself.
- Do not downgrade a strict-critique finding because triage ranked the file lower.
- Do not treat advisory semantic classification as deterministic proof.
- Do not widen source roots blindly to force an agent-ready result.
- Do not paste full triage artifacts into review notes.
- Do not let generated skills, MCP UI output, or review-pack defaults clear blockers without validated local evidence.
