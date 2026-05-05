# JavaScript Runtime Fundamentals for Performance Reviews

Reference material on JS engine behavior relevant to code reviews. This is not a tutorial — it's a lookup document for reviewing agents.

---

## 1. Closure Scope Retention (The Union Problem)

**Source**: Rob Palmer (TC39 co-chair), Feb 2026

All browser engines implement GC imprecisely. The JS spec permits this. When two inner functions A and B become long-lived closures in the same scope:

- A captures variable C
- B captures variable D
- **Both closures retain the union {C, D}**, not just what each individually uses

This means a single surviving closure (e.g., an event listener cleanup function) can retain variables it never references, simply because another closure in the same scope did reference them.

### Implications for Code Review

- **Factory functions** returning multiple closures: all closures retain the union of all captured variables
- **React components**: all `useCallback`/`useMemo` closures in the same component scope share one closure context
- **Effect services**: `Effect.gen(function* () { ... })` creates a scope — all yielded closures share it

### Mitigation Patterns

```javascript
// BAD: Two closures share scope, both retain {largeData, config}
function setup(largeData, config) {
  const handler = () => process(largeData); // retains config too
  const cleanup = () => teardown(config); // retains largeData too
  return { handler, cleanup };
}

// GOOD: Separate scopes via IIFE or .bind()
function setup(largeData, config) {
  const handler = (
    (d) => () =>
      process(d)
  )(largeData);
  const cleanup = (
    (c) => () =>
      teardown(c)
  )(config);
  return { handler, cleanup };
}

// GOOD: .bind() only retains the bound target
const abort = controller.abort.bind(controller);
signal.addEventListener("abort", abort, { once: true });
```

---

## 2. The Jarred Sumner Pattern (1GB Fix)

**Source**: Jarred Sumner (Bun creator), Feb 2026 — reduced Claude Code memory by 1GB

```javascript
// BAD: Arrow captures entire scope (request body, init, options)
signal.addEventListener("abort", () => controller.abort());
const timeout = setTimeout(() => controller.abort(), ms);

// GOOD: .bind() only retains controller reference
const abort = controller.abort.bind(controller);
signal.addEventListener("abort", abort, { once: true });
const timeout = setTimeout(abort, ms);
```

**When this matters**: Any closure attached to a long-lived object (AbortSignal, EventEmitter, timer) where the enclosing scope contains large data (request bodies, base64 strings, DOM references).

---

## 3. The WebReflection Pattern (setTimeout Args)

**Source**: Andrea Giammarchi (@WebReflection), Feb 2026

`setTimeout` and `setInterval` accept extra arguments passed directly to the callback. This is a 20-year-old API that avoids closures entirely:

```javascript
// BAD: Creates closure capturing entire scope
setTimeout(() => fn(arg1, arg2), delay);

// GOOD: No closure, args passed directly
setTimeout(fn, delay, arg1, arg2);
```

**Caveat**: Only works when `fn` doesn't need `this` binding and the args are the exact parameters.

---

## 4. Platform-Specific GC Behavior

### V8 (Chrome, Node.js)

- Generational GC: young gen (Scavenge) + old gen (Mark-Sweep-Compact)
- Closures promoted to old gen after surviving 2 Scavenges (~2-4 seconds)
- Old gen compaction is expensive — avoid creating many mid-sized objects that get promoted
- `WeakRef` and `FinalizationRegistry` available but non-deterministic

### JavaScriptCore (Safari, Bun)

- Non-compacting collector for most objects
- Separate "Riptide" concurrent GC
- Known issue: Bun's JSC can retain larger closure scopes than V8 in some cases
- `setInterval` timers without `.unref()` keep the Bun process alive

### SpiderMonkey (Firefox)

- Compacting GC, generally better at reclaiming closure scopes
- Less relevant for server-side but matters for web apps targeting Firefox

---

## 5. Jotai atomFamily Internals

```javascript
// Internal structure (from jotai-family source):
// atoms: Map<param, [atom, createdAt]>
const family = atomFamily((id) => atom(null));
family("key1"); // creates and caches
family("key1"); // returns cached

// LEAK: No automatic cleanup. Must call:
family.remove("key1");
```

Each `atomFamily` maintains an internal `Map`. Entries are never evicted unless `.remove(param)` is explicitly called. In a SPA, this means every unique parameter value creates a permanent entry.

**Review checklist**:

- Count atomFamily instances and their key cardinality
- Search for `.remove()` calls — if absent, it's a leak
- Estimate per-entry size (especially if caching fetched data)

---

## 6. TanStack Query Infinite Scroll

`atomWithInfiniteQuery` (or `useInfiniteQuery`) accumulates all fetched pages in memory via `data.pages[]`. Without `maxPages`, scrolling through 100 pages retains all 100 in the query cache.

```typescript
// BAD: Unbounded page accumulation
atomWithInfiniteQuery((get) => ({
  queryKey: ["items"],
  queryFn: fetchPage,
  getNextPageParam: (last) => last.nextCursor,
}));

// GOOD: Cap at N pages, evicts oldest
atomWithInfiniteQuery((get) => ({
  queryKey: ["items"],
  queryFn: fetchPage,
  getNextPageParam: (last) => last.nextCursor,
  maxPages: 10, // TanStack Query v5 feature
}));
```

---

## 7. Module-Level Singletons

Any `Map`, `Set`, `Array`, or object declared at module scope persists for the entire process (server) or page (client) lifetime. These are **not leaks** if bounded, but become leaks if they grow proportional to user activity.

**Review checklist**:

- Is there a size cap?
- Is there TTL-based eviction?
- Does `setInterval` for cleanup have `.unref()` (server-side)?
- Is the growth rate proportional to user activity or bounded by configuration?

---

## 8. Effect.forkDaemon Lifecycle

`Effect.forkDaemon` creates a fiber detached from its parent scope. The fiber runs independently — if the parent exits, the daemon continues. This is intentional for fire-and-forget work but means:

- The daemon's closure scope is retained until the fiber completes
- No parent `Scope` to attach cleanup to (use `Effect.ensuring` instead)
- Must have its own `Effect.catchAll` for error handling

**When it's fine**: Short-lived fire-and-forget work (DB writes, event publishing) with explicit error handling.

**When it's a concern**: Long-running daemons that retain references to large parent scope variables.

---

## 9. React Closure Lifecycle

In React function components:

- Every render creates new closure scopes
- `useCallback`/`useMemo` closures are recreated when dependencies change
- All closures in a component share one scope (Rob Palmer's union problem)
- Closures are GC'd when the component unmounts AND no refs survive

**Review checklist**:

- How many `useCallback`/`useMemo` instances in one component?
- What large variables are in scope? (message arrays, DOM refs, parsed data)
- Are any closures passed to long-lived subscribers (event emitters, intervals)?
- Would splitting into smaller components isolate closure scopes?
