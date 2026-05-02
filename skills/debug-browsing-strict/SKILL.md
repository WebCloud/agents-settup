---
name: debug-browsing-strict
description: Use for adversarial, evidence-first browsing-session latency investigations with explicit HITL vs non-HITL attribution and falsification checks.
---

# Debug Browsing Strict

Single source of truth for the strict browsing-debug workflow now lives in `.agents`.

## Primary Resource

- Original command file: `/Users/vinicius/.agents/commands/debug-browsing.md`
- Resource mirror: `references/original-command.md`

## How To Use

1. Read the primary resource first.
2. Follow its strict protocol end-to-end:
   - git-history context
   - full trace modes (`--json`, `--timeline`, `--diagnose`, `--guardrails`)
   - Convex logs and event verification
   - adversarial/falsification analysis
3. Report with explicit evidence and HITL vs non-HITL classification.

## Guardrails

- Do not present unverified hypotheses as facts.
- Mark inconclusive claims explicitly and list missing instrumentation.
- Keep recommendations prioritized by impact and risk.
