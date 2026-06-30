---
name: neuve-environment
description: Use neuve doctor and neuve warm to check local readiness, build provenance, route health, warmed read models, artifact refs, and setup friction before review.
---

# Neuve Environment

Use this skill before review when Neuve availability, setup state, route health, warmed read models, or local cache provenance is unknown. Use it again when commands are unexpectedly slow, missing artifacts, or rendering stale-looking briefs.

Environment commands help explain local readiness. They do not review code and do not prove command output is correct.

## First Commands

Start with:

```sh
neuve doctor
neuve warm
```

Inside the Neuve repo, choose the binary based on the evidence question. For installed-user AX, PATH `neuve doctor` and `neuve warm` are appropriate only when recorded as installed-binary output. For current-source validation, use `cargo run -q -p neuve-local-cli -- doctor` and `cargo run -q -p neuve-local-cli -- warm`, or a freshly rebuilt `./target/debug/neuve doctor` and `./target/debug/neuve warm`. A PATH `doctor` self-match does not prove current source-tree behavior; treat PATH output as installed-binary AX unless the same review evidence confirms source-built parity. Run or cite a source-built `doctor` when PATH output affects a Neuve product or regression conclusion.

If `neuve` is not on PATH inside the Neuve repo:

```sh
cargo run -q -p neuve-local-cli -- doctor
cargo run -q -p neuve-local-cli -- warm
./target/debug/neuve doctor
./target/debug/neuve warm
```

Narrow warmup when the source scope is known:

```sh
neuve warm --source docs/product/checkout-rules.md
neuve warm --source path/to/implementation.rs
neuve warm --approved-root docs/product
```

`warm --source <implementation-file>` should precompute the matching source-review read model and any supported usage-runtime sidecar for Rust or JavaScript/TypeScript focus paths. Use `warm --include-uncommitted` when the setup target includes staged, unstaged, or untracked local work, and repeat `--exclude-worktree-path <PATH>` only for inspected unrelated local worktree noise. Warm is still setup/read-model preparation only; it does not clear source truth, verifier gates, subject lanes, checkpoint state, delegation, MCP policy, branch readiness, merge readiness, or proof of correctness.

Use `--base <ref>` and `--head <ref>` when warming a non-default comparison range.

## Drill-Downs

Use `doctor` to inspect Git availability, repo config, local store, hook posture, local routes, policy defaults, daemon state, build provenance, classifier route health, embedding index compatibility, and PATH visibility.

Use `warm` to precompute read models for `scan`, `sources`, and `triage` in dependency order. If warm reports a broad-source guard, stale rows, or a missing usage-runtime sidecar, narrow with `--source` or `--approved-root` before rerunning.

Use daemon status commands only when explicitly investigating daemon state:

```sh
neuve daemon status
neuve daemon ping
neuve daemon events
```

Do not start a daemon unless the user or task explicitly asks for it.

## Artifacts And Evidence

Record:

- `.neuve-artifact/doctor-*.json` for setup, route, provenance, and local-policy status.
- `.neuve-artifact/warm-*.json` for warmed command rows, read-model ids, cache status, and invalidation reasons.
- `.neuve-artifact/source-usage-runtime/...` refs when `warm --source <implementation-file>` prepares language-tooling sidecars.
- Which binary was used for each command: PATH `neuve`, `cargo run -q -p neuve-local-cli -- ...`, freshly rebuilt `./target/debug/neuve`, or unavailable.
- Any guard, missing route, missing config, stale cache, raw-source policy mismatch, or broad-source warning that affected review commands.
- In Neuve repo reviews, whether PATH evidence was treated as installed-binary AX or was paired with source-built parity evidence. PATH self-match alone is not current-source proof.

Environment evidence belongs in the Neuve dogfood section or AX feedback, not in correctness findings unless it directly blocks verification.

## AX Feedback

Record feedback when setup status is ambiguous, the global binary report is misleading, warm recommends a loop, route health lacks next steps, or broad-source guard wording does not tell the reviewer how to narrow.

```sh
neuve feedback record \
  --kind performance-pain \
  --rating painful \
  --command warm \
  --target branch-review \
  --artifact .neuve-artifact/warm-...json \
  --note "Warm guard was correct but did not suggest the product source root."
```

## Must Not Use For

- Do not use `doctor` or `warm` as code-review evidence.
- Do not treat a healthy environment as proof that downstream review commands are correct.
- Do not treat a warm cache hit as proof that source truth or triage posture is valid without inspecting the rendered command output.
- Do not start background services or modify shell configuration unless explicitly requested.
- Do not include secrets, environment dumps, raw source, or full artifacts in review notes.
