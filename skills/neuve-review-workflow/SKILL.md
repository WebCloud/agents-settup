---
name: neuve-review-workflow
description: Use Neuve commands during evidence-first review to gather non-blocking signal, inspect artifact refs, and record AX feedback without weakening strict-critique review posture.
---

# Neuve Review Workflow

Use this skill when reviewing a change in a repo where `neuve` is available, when dogfooding Neuve itself, or when a strict-critique lane needs local command signal before deciding review focus.

This skill complements `strict-critique` and `team-orchestration`. Keep their lane ownership, verdict, evidence, and merge-gate rules as the source of review process truth. Neuve helps choose where to look and what questions to ask; it does not approve changes, clear blockers, or replace independent inspection.

## Skill-First Review Entry

When a user or workflow says `/neuve review`, treat it as an instruction to run the Neuve review workflow, not as a separate CLI subcommand. The agent-facing flow is:

1. Establish local readiness only when it is unknown: `neuve doctor`, then `neuve warm` for large or repeated passes. `warm` accepts `--include-uncommitted` and repeatable `--exclude-worktree-path <PATH>` to precompute read models for the same explicit local-worktree range used by foreground review commands.
2. Orient the changed surface with the intended review range. Use the local-worktree-only range when only staged, unstaged, or untracked changes on top of current `HEAD` are in scope; preserve branch range refs when committed branch work is also in scope. Local-worktree validation may be warmed first, but actual review posture still comes from foreground `scan`, `sources`, and `triage` with the same range flags.
3. Use `neuve sources` only when scan/triage or the dispatch packet exposes a source-truth, source-unit adjacency, history, risk, validation, or bounded absence question. Adjacency is node-zero context such as references, call hierarchy, tests, package/module neighbors, history, source truth, and structured metadata; pin `--truth` only when the human or dispatch packet names a real source.
4. Run triage with the same intended review range used for scan and focused source drill-downs.
5. Route the result:
   - If triage/read-model state is stale or unavailable, regenerate the branch model with the appropriate `neuve triage` command and retry the read path. Do not guess artifact aliases.
   - Treat scan and sources as context builders. `sources` owns source context, provider evidence, history, usage, and bounded absence reporting. `triage --focus` owns deterministic risk/validation route projection, subject lanes, and lane posture; bounded adjacency alone cannot unlock delegation.
   - If broad triage reports many manual units, `source context too broad`, `source relation unresolved`, source conflict/HITL, missing scoped checks, or mixed accumulated range quality, treat the broad pass as orientation only. Pick one to three priority review units and run focused `triage --blame --focus <path>` plus focused `sources --source <path>` drill-downs before asking for a developer decision.
   - Prefer source/workstream cluster drill-downs over repeating broad passes. Focus first on implementation files, source-truth conflicts, verifier/check gaps, and representative units that share the same blocker label; then summarize whether the focused signal changed review focus, confirmed a real blocker, or exposed noise.
   - If the lane is agent-reviewable, summarize the Neuve signal as advisory context and continue strict review from code, tests, docs, and runtime evidence.
   - Treat routine lockfile and structured metadata churn as suggested review unless deterministic gates identify credentials, security or policy impact, deployment/runtime behavior, destructive infrastructure, broad branch impact, missing evidence, or source-truth conflict.
   - Treat documentation paths as generic documentation context in deterministic triage. Do not infer workflow, command, schema, policy, source-truth, or verification authority from doc filenames or path segments; semantic classifier/enrichment artifacts may later move docs on the matrix.
   - If triage returns human-required/manual review units, surface the MCP review shell to the developer and ask for a bounded decision on those units.
   - If no human-required lane remains, provide a concise evidence summary. Do not claim auto-approval unless the owning review workflow and required checks allow it.

The developer-facing flow is:

1. The developer can ask for `/neuve review`.
2. The agent runs the CLI ladder and reports only bounded command summaries and artifact refs.
3. When human-required units exist, the agent opens or reads the MCP UI resource and presents the manual units for developer approval, requested changes, or more-context decisions.
4. The agent records the developer decision in the review notes or decision log and continues the strict-critique workflow.

## Workflow Contract Boundary

Treat this skill as an advisory adapter. Neuve workflow state belongs in inspectable local contracts, artifacts, read models, review policy, review packs, command schemas, setup state, and decision logs. Future generated Neuve skills must cite their source manifest, review-pack ids, schema versions, command contract versions, and generation provenance.

Do not infer workflow authority from skill text alone. If a manifest, review pack, generated skill adapter, provider, or command artifact is missing, stale, malformed, or untrusted, record that as a diagnostic or review question instead of silently continuing as if the workflow were healthy.

## First Commands

Start with the smallest command ladder that can answer the current review question:

```sh
neuve doctor
neuve warm
neuve scan
neuve sources
neuve triage
```

Neuve-in-Neuve binary selection: when reviewing the Neuve repo, use `cargo run -q -p neuve-local-cli -- ...` or a freshly rebuilt `./target/debug/neuve ...` before treating command output as current-source product or regression evidence. PATH `neuve ...` remains useful installed-binary AX only; record it as installed-binary evidence unless the same review evidence confirms source-built parity. If PATH output informs a product or regression conclusion in this repo, run or cite source-built `doctor` and the source-built command whose output supports that conclusion.

If `neuve` is not on PATH inside the Neuve repo, try `cargo run -q -p neuve-local-cli -- doctor` or `./target/debug/neuve doctor`. If no local source-built binary or cargo-run route is available, record the unavailability as AX feedback in the review notes and continue review without Neuve.

Run `doctor` when local setup, route health, or binary provenance is unknown. Run `warm` before repeated review passes on the intended branch or local-worktree range; use `neuve warm --include-uncommitted` when staged, unstaged, or untracked local work is part of that setup target, and preserve inspected `--exclude-worktree-path <PATH>` filters when applicable. Warm remains setup/read-model preparation only. Run `scan` for changed-surface orientation before deeper interpretation. Run `sources` when focused review investigation needs source-unit adjacency, history, correctness, risk, validation, or source-truth context. Run `triage` after scan/source orientation for deterministic risk/validation posture, routing, blockers, delegation gates, and MCP handoff readiness. Treat `--truth` as an explicit diagnostic pin, not the default way to discover context.

## Range Selection

Choose the range before running warm, scan, sources, or triage. `warm` may use `--base`, `--head`, `--source`, `--approved-root`, `--include-uncommitted`, and repeatable `--exclude-worktree-path <PATH>` to prepare read models for that same range, but it is not a review/verifier/checkpoint clearance command.

- For a branch range review, use the intended `--base <ref>` and `--head <ref>` when the default range is not the target.
- For a branch range review with local worktree changes, preserve the intended `--base <ref>`, preserve the intended `--head <ref>`, and preserve `--include-uncommitted`; do not force `HEAD..HEAD` because that would hide committed branch work.
- For a local-worktree-only review of staged, unstaged, or untracked changes on top of current `HEAD`, use `--base HEAD --head HEAD --include-uncommitted`.

Local-worktree-only command shapes:

```sh
neuve warm --base HEAD --head HEAD --include-uncommitted
neuve warm --base HEAD --head HEAD --source <path> --include-uncommitted
neuve scan --base HEAD --head HEAD --include-uncommitted
neuve triage --base HEAD --head HEAD --include-uncommitted
neuve triage --base HEAD --head HEAD --focus <path> --include-uncommitted
neuve sources --base HEAD --head HEAD --source <path> --include-uncommitted
```

## Inspected Local Exclusion Reruns

When a focused review or closeout includes unrelated dirty worktree paths,
inspect each path before excluding it. Only after inspection confirms the path
is unrelated local worktree noise may you rerun focused closeout commands with
`--exclude-worktree-path <PATH>`.

Preserve the intended `--base`, `--head`, `--focus` or `--source`, `--truth`
when present, `--include-uncommitted`, and any existing
`--exclude-worktree-path` flags. Record both the pre-exclusion artifact refs and
the post-exclusion artifact refs in review or closeout evidence so the audit
trail shows what changed.

Do not exclude uninspected paths, in-scope implementation or evidence paths,
unresolved paths, or blocker paths. `--exclude-worktree-path` is command-owned
local filtering only; it does not clear source truth, verifier gates, subject
lanes, checkpoint state, delegation, MCP policy, branch readiness, merge
readiness, or proof of correctness.

The same inspected exclusions may be passed to `warm --include-uncommitted` to
prepare read models for a filtered local-worktree range. Warmed rows and
focused remediation commands remain advisory setup context only; they do not
clear source truth, verifier gates, subject lanes, checkpoint state,
delegation, MCP policy, branch readiness, merge readiness, or proof of
correctness.

## Drill-Downs

Use progressive disclosure instead of pasting large output:

```sh
neuve triage --details
neuve triage --blame
neuve triage --blame --focus path/to/file
neuve sources --source path/to/implementation.rs
neuve sources --mode usage --source path/to/implementation.rs
neuve sources --details
neuve sources --blame
neuve scan --files-only
neuve scan --details
neuve scan --blame
```

Use this broad-to-focused sequence for large or noisy reviews:

1. Run broad `scan` and `triage` once to establish posture, range quality, and priority files.
2. If the broad range is lazy, broad, or noisy, inspect bounded seed metadata before repeating broad commands:
   - `neuve artifacts show --artifact <scan-or-triage-ref> --path lazyRange --summary`
   - Pick one to three `lazyRange.reviewDrilldownSeeds` focus paths when present. Seeds guide drilldown only; they are not source truth, lane assignment, verifier clearance, delegation approval, or proof of correctness.
3. For each selected seed or priority focus path, run `neuve sources --source <path> --details` to narrow source context, then run `neuve triage --focus <path>` or `neuve triage --blame --focus <path>` for lane/subject posture.
4. When broad output is blocked or noisy and no lazy seed fits, select one to three focus paths from manual-required units, blocker groups, implementation files, source-truth conflicts, verifier/check gaps, or representative units that share the same blocker label.
5. If the source question remains unclear, drill into the relevant source mode: `usage`, `history`, `correctness`, `risk`, or `artifacts`.
6. Inspect bounded graph summaries when source/workstream state matters:
   - `neuve artifacts show --artifact <triage-or-sources-ref> --path sourceAttributionGraph --summary`
   - `neuve artifacts show --artifact <triage-or-sources-ref> --path reviewContextGraph --summary`
7. Resume the campaign from checkpoint state:
   - `neuve checkpoints recent`
   - Use the seed inventory to distinguish observed focused triage seeds from remaining seeds. If the inventory is unavailable, stale, malformed, or wrong-range, rerun broad `scan`/`triage` for the intended range instead of claiming remaining-seed progress.
8. Report the focused result as one of: changed review focus, confirmed blocker, narrowed to a source/HITL decision, or product/AX noise.

Use `--include-uncommitted` only when the review target includes staged, unstaged, or untracked local work. For local-worktree-only review, pair it with `--base HEAD --head HEAD`; for branch range review plus local worktree changes, keep the intended base and head. Use `--debug` only for command diagnostics and stage-manifest inspection.

## MCP UI Handoff

Use MCP only after the CLI workflow has produced or diagnosed the branch review model. MCP is the developer-facing review surface and read-model renderer only; it is not the command that decides source truth, assignment tier, verifier clearance, branch verdict, delegation, or merge-blocking.

Minimal MCP surface:

- Read `ui://neuve/review-shell` when the developer needs to inspect human-required/manual review units.
- Call `get_review_model` with `{ "repoId": "<server-advertised repo id>" }` after triage has been run for the current branch.
- Read `neuve://repo/<repoId>/review/branch/latest` only as the advertised branch-resource fallback.
- Use server-advertised resource URIs and tool schemas from `tools/list` and `resources/list`.

For lockfiles and structured metadata, prefer the CLI's bounded summaries and review-unit routing first. Surface the MCP UI when manual judgment is actually needed, such as a human-required unit, a stale or unavailable branch model, or a developer decision on a deterministic hard gate. Do not render raw lockfile hunks by default.

Do not:

- Do not pass `.neuve-artifact/latest`, `.neuve-artifact/index`, or guessed artifact aliases as `artifactRef`.
- Do not pass an empty `branchRef`; omit `branchRef` unless a non-empty branch disambiguator is needed.
- Do not search raw `.neuve-artifact` files to work around a blocked MCP result.
- Do not add broad direct MCP tool calls when a CLI command is the workflow step.
- Do not treat MCP UI output as independent approval or as proof that strict-critique blockers are cleared.
- Do not treat MCP-rendered adjacency or advisory classifier text as a lane decision; triage route projection owns lanes.

If `get_review_model` returns `REVIEW_MODEL_UNAVAILABLE`, follow the safe action in the response. For stale or missing branch read models, run `neuve triage` for the current review range and retry with `{ "repoId": "<server-advertised repo id>" }`. If the response is `INPUT_VALIDATION_FAILED`, fix the call shape instead of widening the schema or reading raw artifacts.

When surfacing human-required units, show the developer the MCP UI/resource output plus a short prompt with the unit id/path, bounded diff availability, source/check context, and the requested decision: approve, request changes, or ask for more context. Record the decision and keep Neuve signal separate from independent review findings.

## Artifacts And Evidence

Record artifact refs rather than full JSON:

- `.neuve-artifact/doctor-*.json` for environment readiness.
- `.neuve-artifact/warm-*.json` for warmed read-model status.
- `.neuve-artifact/triage-*.json` for posture, blockers, and delegation evidence.
- `.neuve-artifact/sources-*.json`, `.neuve-artifact/source-usage-runtime/...`, and shared source refs for review investigation context.
- `.neuve-artifact/scan-*.json` and object chunks for changed-surface ranking.
- `.neuve-artifact/feedback-record-*.json` for local dogfood events.

In review output, separate Neuve signal from independent findings. Cite the command, binary choice, focused path or lane, artifact ref, and whether the signal changed review focus. For Neuve repo dogfood, record binary choice per command: PATH `neuve` as installed-binary AX, `cargo run -q -p neuve-local-cli -- ...`, freshly rebuilt `./target/debug/neuve`, or unavailable.

For broad reviews, include the broad artifact ref and at least one focused drill-down artifact ref when broad triage was blocked or noisy. Do not present a broad manual-required count as the final review focus when focused source or blocker drill-downs are available.

For workflow-architecture work, also record whether the signal came from deterministic command evidence, an advisory classifier artifact, a generated skill adapter, a warm/read-model cache, a review-pack default, or a human decision. Skills and classifier envelopes are advisory unless a local contract and validation artifact say otherwise.

Treat any successful command that selected no intended tests as zero-test
evidence. A zero-test run may be useful diagnostic context, but it is
non-coverage and not validation proof unless a separate command in the evidence
selects and runs the intended tests. Do not present `0 tests` output, an
empty-list test filter, or a command recorded as having selected no intended
tests as proof of correctness, verifier clearance, delegation readiness, branch
readiness, or substantive scoped-check coverage. Neuve does not infer selected
test counts from arbitrary command output; reviewers must rely on explicit
validation records such as a test-list command, a concrete non-zero test command,
or a human-recorded diagnostic note.

Before the final closeout focused triage pass, check whether path-specific
non-zero validation evidence covers any concrete changed review-unit file,
including docs and repo-local skill files. If it does, create or verify the
bundle's `evidence/scoped-checks.json` before running final focused
`neuve triage --blame --focus <path>`. If the sidecar is still uncommitted, run
the final closeout scoped-check correlation check with `--include-uncommitted`;
after commit, rerun the committed-range focused triage or cite the pre-commit
artifact in closeout. If validation is broad, manual-only, absent, or
zero-test diagnostic-only, record why no sidecar applies in the validation or
closeout artifact instead of creating an empty or misleading sidecar.

When a handover bundle contains
`docs/handover/review-triage/<bundle>/evidence/scoped-checks.json`, inspect it
as path-correlated review guidance. Valid sidecars use schema
`neuve.scoped-check-correlation.v1` and list `checks` with repo-relative
`path`, bounded `command`, `result`, `coverage`, `kind`, and optional
`artifactRef` / `provenance` fields. A matching sidecar may appear in triage as
`correlated_scoped_check_candidate`; treat that as a sharper pointer to the
normal validation artifact, not as independent proof. Sidecars are candidate
metadata only: they do not clear verifier gates, source truth, delegation,
subject lanes, checkpoint state, MCP policy, branch readiness, merge readiness,
or proof of correctness. Strict critique findings and normal verification stay
independent, and those gates remain fail-closed.

For scoped-check sidecars, a zero-test command must not appear as substantive
`passed` test coverage. If the bundle records a command that exited 0 but
selected no intended tests, the sidecar entry must be diagnostic-only by using
`result: "skipped"` or `result: "unknown"`, or by using a non-test `kind` that
clearly points to separate substantive coverage. Only a separate command that
selected the intended tests may be recorded as a `result: "passed"` test entry.

## AX Feedback

Every review lane that uses Neuve should leave bounded AX feedback. Include commands run, artifact refs, signal value, sticking points, confusing labels, missing drill-downs, slow paths, and desired next-command behavior.

When allowed and initialized, record the most important event locally:

```sh
neuve feedback record \
  --kind focus-usefulness \
  --rating partially-helped \
  --command triage \
  --target product-review \
  --artifact .neuve-artifact/triage-...json \
  --note "Brief narrowed review focus, but blocker label did not explain the missing source."
```

Keep notes local-only and bounded. Do not include raw source, raw diffs, secrets, private transcripts, or copied artifact bodies.

## Must Not Use For

- Do not use Neuve output as proof of correctness.
- Do not approve, reject, or de-scope findings solely because Neuve ranked them.
- Do not treat missing or weak source evidence as an automatic bug; treat it as a review question or product signal.
- Do not paste full artifacts into review notes when an artifact ref is enough.
- Do not keep repeating broad or debug commands when a focused path, source, blocker group, or lane can answer the question.
- Do not make generated skills, MCP UI resources, or review packs a second source of truth over local evidence and explicit human decisions.
- Do not ask the developer to run Goose as the only validation route when the local MCP shell harness can reproduce the model/read path.
