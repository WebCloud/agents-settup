# Prior Findings — 2026-02-01 Review

Calibration examples from the first runtime review session. Use these to gauge severity and distinguish real issues from false positives.

---

## Real Issues (Fixed)

### C1: Unbounded AI message history with screenshots — CRITICAL

**File**: `browsing-agent-loop.ts`
**Pattern**: `messages: ModelMessage[]` growing for 25 iterations, each screenshot 50-200KB base64
**Impact**: 15-50MB per agent session
**Fix**: Sliding window — keep initial prompt + last 39 messages (`MAX_CONTEXT_MESSAGES = 40`)

### C2: 16 atomFamily instances with no cleanup — CRITICAL

**File**: `embedMetadataAtoms.ts`
**Pattern**: `atomFamily` keyed by URL, no `.remove()` anywhere. Module-level `Set` also unbounded.
**Impact**: 40-60MB on iOS after 100 URLs
**Fix**: `disposeWorkflowAtom` calling `.remove()` on all 16 families. `MAX_CACHING_CLAIMS = 500` cap on Set.

### C3: Infinite scroll with no maxPages — CRITICAL

**File**: `memoryQueryAtoms.ts`
**Pattern**: `atomWithInfiniteQuery` without `maxPages`, `flatMap` materializing all pages
**Fix**: Added `maxPages: 10`

### C4: Unbounded module-level Map + missing .unref() — CRITICAL

**File**: `retry-backoff.ts`
**Pattern**: `Map<string, RetryState>` with no size cap, `setInterval` without `.unref()`
**Fix**: `MAX_MEMORY_STORE_SIZE = 10_000` with LRU eviction, `.unref()` on timer

### H3: Debug file writes on every generation — HIGH

**File**: `embed-pipeline.ts`
**Pattern**: Writing 20-100KB prompt files to `/tmp/` unconditionally
**Fix**: Removed entirely (could also gate behind env var)

### N1: Unnecessary closure in setTimeout — LOW (but tweet-relevant)

**File**: `useBrowsingSessionStatus.ts`
**Pattern**: `setTimeout(() => setExit(), delay)` — closure captures scope
**Fix**: `setTimeout(setExit, delay)` — direct function reference

---

## False Positives (No Change Needed)

### H1: Tool factory 10 closures sharing scope — FALSE POSITIVE

**File**: `browsing-agent-tools.ts`
**Why**: Scope union is `{ctx, state}` — both are lightweight shared references (service handles, mutable refs). No large data in scope. The Rob Palmer pattern only matters when large data is captured.

### H2: Global fetch wrapper never cleaned — NOT ACTIVE

**Files**: `breadcrumb-collectors.ts`, `traces/index.ts`
**Why**: `initClientTelemetry()` is never called anywhere in the codebase. Dead code path.

### H4: setInterval in signal service — ALREADY HANDLED

**File**: `browsing-signal.service.ts`
**Why**: Already has `.unref()`. Singleton Effect.Service — timer should live for process lifetime.

### H5: 14 callbacks in $sessionId route — STANDARD PATTERN

**File**: `$sessionId.tsx`
**Why**: Standard React `useCallback`/`useMemo` usage. Closures recreated on dependency changes, GC'd on unmount. Route has well-defined lifecycle. Not retaining large data across navigations.

### M1: Fire-and-forget daemons — INTENTIONAL

**Files**: Multiple `Effect.forkDaemon` locations
**Why**: All documented as intentional fire-and-forget. Every daemon has `Effect.catchAll`. Long-lived fibers use `Effect.ensuring` for cleanup. Downgraded to INFORMATIONAL.

---

## Lessons Learned

1. **Always trace the lifecycle** before marking something as a leak. Many patterns that look wrong are intentionally bounded.
2. **Check if cleanup exists elsewhere** — `.remove()` might be called from a different file, or the whole module might be short-lived.
3. **Scope union matters only with large data** — if the shared scope only contains service handles and small refs, the union pattern is benign.
4. **Search for callers** — a "leaky" function that's never called is not a leak.
5. **Module-level singletons on the server are fine** if bounded. The question is always: does it grow proportional to user activity?
6. **iOS Safari has ~1-1.5GB limit** — total retained memory matters more than individual leaks.
