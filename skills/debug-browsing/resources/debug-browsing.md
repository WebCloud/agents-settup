# Debug Browsing Session

Analyze a browsing agent session trace to diagnose issues.

For stricter adversarial investigation, use: `/debug-browsing-strict`

## Investigation Stance (Mandatory)

- Use an **antagonistic, adversarial** mindset.
- Assume the first explanation is wrong until disproven with data.
- Do not accept “likely” causes without at least one concrete artifact (trace step, event, log line, or code path).
- Always separate:
  - **HITL/user wait latency**
  - **Agent/model/tool latency**
  - **UI/transport latency**

## Instructions

1. Collect git context first (required for stricter root-cause analysis):

   ```
   git log --oneline -n 30
   git log --stat --oneline -n 20 -- apps/embeds/server/services/browsing-agent-loop.ts apps/embeds/server/services/browsing-agent-tools.ts scripts/browsing-trace.ts
   ```

   Use this to identify recent behavior changes that could explain regressions.

2. Launch the neuve-debugger viewer for visual inspection:

   ```
   bun scripts/neuve-debugger/index.ts $ARGUMENTS --port 4984
   ```

   If no session ID is provided, use `--latest`. This starts a local web viewer at http://localhost:4984 showing the full session timeline, iteration steps (tool chains, timing, tokens), and REQUEST/RESPONSE context. Tell the user to open it in their browser.

3. Run the trace script for CLI-level analysis:

   ```
   bun scripts/browsing-trace.ts $ARGUMENTS --json
   bun scripts/browsing-trace.ts $ARGUMENTS --timeline
   bun scripts/browsing-trace.ts $ARGUMENTS --diagnose
   bun scripts/browsing-trace.ts $ARGUMENTS --guardrails
   ```

   If no session ID is provided, use `--latest`.

4. Analyze trace output with adversarial checks:
   - **Stuck loops**: Repeated tool calls on the same ref/URL
   - **Plan handover quality**: Does the seed message contain enough context?
   - **Tool errors**: Which tools failed and why?
   - **Sliding window impact**: Did important context get pruned?
   - **Navigation efficiency**: Unnecessary page loads or missed shortcuts
   - **Terminal state**: Did it complete, fail, or timeout?
   - **False attribution risk**: Are large gaps actually HITL, reconnects, or legacy trace blind spots?
   - **Harness redundancy**: `mutating tool -> no-op -> verify bundle` churn, duplicated verify, duplicate snapshots, avoidable diff checks
   - **Prompt/harness mismatch**: Does the prompt still encourage behavior the harness tries to avoid?
   - **Cache friendliness**: Is context churn likely busting KV cache (large rotating instructions, unstable per-turn prefixes)?

5. Check Convex logs for mutation errors (dev deployment by default):

   ```
   cd packages/convex && bunx convex logs --history 50
   ```

   For production:

   ```
   cd packages/convex && bunx convex logs --prod --history 50
   ```

   Look for: failed mutations, "activation failed" errors, missing browsingEvents writes.

6. Verify Convex browsingEvents for the session:

   ```
   cd packages/convex && bunx convex run browsingEvents:listBySession '{"sessionId": "<SESSION_ID>"}'
   ```

   If 0 events: ConvexBridgeSubscriber is not forwarding. Check bus init + bridge startup.

7. Read key implementation files if needed:
   - `apps/embeds/server/services/browsing-agent-loop.ts` — agent loop, system prompt, stuck detection
   - `apps/embeds/server/services/browsing-agent-tools.ts` — tool definitions and context
   - `apps/embeds/server/services/browsing-session.service.ts` — session lifecycle
   - `apps/embeds/server/services/convex-bridge-subscriber.ts` — bus-to-Convex event forwarding
   - `apps/embeds/server/services/session-message-bus.ts` — PubSub init + subscribe

8. Falsification pass (required):
   - For each claimed root cause, list one competing hypothesis and why data rejects it.
   - If data cannot separate two hypotheses, mark as **inconclusive** and list the missing instrumentation.
   - Explicitly call out whether timing is legacy-attributed (`n/a`) vs fully attributed (`llm/tool/overhead`).

9. Provide diagnosis in this strict format:
   - **Timeline summary**: Exact step-by-step sequence with key timestamps
   - **Latency breakdown**: Top gaps with HITL vs non-HITL classification
   - **Root cause(s)**: Ranked by confidence with evidence references
   - **Redundancy points**: Concrete wasted cycles in loop/harness
   - **Recommendations**: Ordered by impact, each with expected latency win and risk
   - **Open instrumentation gaps**: What to add next to remove uncertainty
