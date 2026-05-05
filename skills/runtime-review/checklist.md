# Performance Review Checklist

Pattern checklist for each vertical reviewer. Check every item. Mark as FINDING (with severity) or OK.

---

## V1: Server Runtime Checklist

### Closure & Scope

- [ ] Factory functions returning multiple closures — check scope union size
- [ ] `Effect.gen` generators with large yielded values — do closures capture them?
- [ ] Arrow functions passed to `addEventListener`, `setTimeout`, `setInterval` — could `.bind()` or direct args work?

### Memory Growth

- [ ] Arrays/objects that grow per-request or per-iteration (message histories, log buffers)
- [ ] Base64 or large string retention in loop variables
- [ ] `JSON.stringify` of large objects creating temporary strings

### Fiber Lifecycle

- [ ] `Effect.forkDaemon` — does it have `Effect.catchAll`? Does it retain parent scope?
- [ ] `Effect.ensuring` for cleanup on daemon fibers
- [ ] `Effect.forkScoped` vs `forkDaemon` — is the choice intentional?
- [ ] Fiber handles — are they tracked for cancellation?

### Module-Level State

- [ ] `Map`, `Set`, `Array` at module scope — size cap? TTL eviction?
- [ ] `setInterval` timers — `.unref()` present? `clearInterval` on shutdown?
- [ ] Singleton services — bounded internal state?

### Disk & Network

- [ ] Debug file writes — gated behind env var? Cleaned up?
- [ ] Temp file accumulation in `/tmp`
- [ ] `Effect.all` concurrency — bounded or unbounded?

---

## V2: Client Runtime Checklist

### Jotai Atoms

- [ ] `atomFamily` instances — count them, check for `.remove()` calls
- [ ] Per-entry size estimation (especially cached API responses, HTML, screenshots)
- [ ] Key cardinality — bounded by config or unbounded by user activity?
- [ ] Module-level `Set`/`Map` supporting atom families — size cap?

### TanStack Query

- [ ] `atomWithInfiniteQuery` — `maxPages` set?
- [ ] `flatMap` materializing all pages — necessary or could virtualize?
- [ ] Query cache `gcTime` and `staleTime` — reasonable values?
- [ ] Manual `refetchQueries` — could invalidation be more targeted?

### React Hooks & Closures

- [ ] Count `useCallback`/`useMemo` per component — high count = large shared scope
- [ ] Large variables in component scope (message arrays, parsed data, DOM refs)
- [ ] Closures passed to long-lived subscribers (AbortSignal, EventEmitter)
- [ ] Could splitting components isolate closure scopes?

### Event Listeners & Subscriptions

- [ ] `addEventListener` — paired with `removeEventListener` in cleanup?
- [ ] Global overrides (`window.fetch`, `history.pushState`) — cleanup wired?
- [ ] WebSocket/SSE connections — disposal on unmount?
- [ ] `IntersectionObserver`/`ResizeObserver`/`MutationObserver` — `.disconnect()` called?

### Timers

- [ ] `setTimeout`/`setInterval` — cleared in useEffect cleanup?
- [ ] Could `setTimeout(fn, delay, ...args)` avoid closures?

---

## V3: Cross-Cutting JS Fundamentals Checklist

### Module-Level Singletons (all apps)

- [ ] Every `Map`, `Set`, `Array`, plain object at module scope
- [ ] Growth rate: bounded by config or by user activity?
- [ ] Eviction mechanism: TTL, LRU, cap, or none?

### String & Buffer Handling

- [ ] `JSON.parse(JSON.stringify())` for cloning — should not exist
- [ ] Large string concatenation in loops — use array + join instead
- [ ] Base64 encoding/decoding of images — retained longer than needed?
- [ ] Template literal strings with large interpolations

### Array Allocation Hotspots

- [ ] Spread + filter + map chains creating 3+ intermediate arrays
- [ ] In hot paths (per-message, per-frame, per-signal) — could use in-place mutation?
- [ ] `.flatMap()` materializing large datasets

### Promise & Async Patterns

- [ ] `Promise.all` with unbounded array — cap concurrency?
- [ ] Unhandled rejections in fire-and-forget promises
- [ ] `async` functions that could be synchronous (unnecessary microtask)

### Timer & Interval Patterns

- [ ] Server-side `setInterval` — `.unref()` present?
- [ ] `clearInterval`/`clearTimeout` on shutdown/cleanup?
- [ ] Could `setTimeout(fn, delay, ...args)` avoid closures?

### Platform-Specific

- [ ] iOS Safari memory limits (~1-1.5GB) — total estimated retained memory?
- [ ] Bun/JSC closure retention differences from V8
- [ ] `WeakRef`/`FinalizationRegistry` usage — appropriate or premature?
