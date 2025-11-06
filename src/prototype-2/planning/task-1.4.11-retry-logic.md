# Task Plan: 1.4.11 - Implementar Retry Logic

## Context and Objective

This task enhances the existing JQEL query retry logic with exponential backoff strategy as specified in SPEC-data-access.md (SPEC-DA-ERR-004:005). Currently, `useJQELQuery` implements a basic retry function that prevents retries on 4xx errors and retries 5xx errors up to 3 times, but lacks exponential backoff delays.

**Current State:**
- Basic retry logic exists in `frontend/src/services/jqel/hooks/useJQELQuery.ts`
- Retry function checks error codes (no retry for 4xx, retry 5xx up to 3 times)
- No retry delay calculation - relies on TanStack Query defaults
- JQELError class provides helper methods for error classification

**What Needs Enhancement:**
- Add exponential backoff delay calculation (`retryDelay` function)
- Make retry configuration customizable per query
- Document retry behavior for developers
- Align with SPEC requirements and existing patterns (e.g., AuthProvider's retry logic)

**Business Value:**
- Prevents overwhelming backend/backbone with rapid retries during outages
- Improves user experience with progressive backoff (better than immediate retries)
- Reduces unnecessary network traffic during transient failures
- Provides predictable retry behavior across the platform

**User Impact:**
- Queries automatically recover from transient network failures
- Loading states remain active during retries (users see progress)
- Better resilience for mobile users with unstable connections

## Dependencies

### Prerequisite Tasks
- ✅ Task 1.4.7 - Criar hooks useJQELQuery (completed - provides retry foundation)
- ✅ Task 1.4.5 - Criar classe JQELError (completed - provides error classification)

### Files/Modules Affected
- **Modified:**
  - `frontend/src/services/jqel/hooks/useJQELQuery.ts` - Add exponential backoff
  - `frontend/src/services/jqel/hooks/types.ts` - Add retry configuration interface

- **Referenced (no changes):**
  - `frontend/src/services/jqel/errors.ts` - JQELError helper methods
  - `frontend/src/types/jqel.ts` - JResult type definitions

### Enables Tasks
- Task 1.4.12 - Implementar error boundaries (will benefit from predictable retry behavior)
- Future tasks using JQEL queries (consistent retry pattern)

### External Dependencies
- **TanStack Query v5** - Provides `retry` and `retryDelay` configuration options
- No additional npm packages required

## Patterns Identified in Codebase

### Similar Components/Modules

1. **AuthProvider Token Renewal Retry** - `frontend/src/providers/AuthProvider.tsx:99-128`
   - **Pattern:** Exponential backoff with max attempts
   - **Implementation:** `retryDelay = BASE_DELAY * Math.pow(2, attemptIndex - 1)`
   - **Configuration:** `MAX_RENEWAL_ATTEMPTS = 3`, `RETRY_BASE_DELAY_MS = 1000`
   - **Relevance:** Direct inspiration for JQEL retry delays - same mathematical approach

2. **Existing shouldRetry Function** - `frontend/src/services/jqel/hooks/useJQELQuery.ts:12-25`
   - **Pattern:** Smart retry based on error codes
   - **Logic:**
     - No retry for 4xx (client errors won't succeed)
     - Retry 5xx up to 3 times (server errors may recover)
     - Default retry up to 3 times
   - **Relevance:** Foundation to build upon - add delay calculation

### Conventions to Follow

**Naming Conventions:**
- Functions: camelCase (`calculateRetryDelay`, `shouldRetry`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `RETRY_BASE_DELAY_MS`)
- Types: PascalCase (`RetryConfig`, `UseJQELQueryOptions`)

**File Structure:**
- Keep retry logic in `useJQELQuery.ts` (collocated with usage)
- Configuration types in `types.ts` (centralized interface definitions)
- No separate retry utility file needed (simple enough to inline)

**Import/Export Patterns:**
```typescript
// Named exports for types
export interface RetryConfig { ... }

// Named exports for functions
export function calculateRetryDelay(attemptIndex: number): number { ... }
```

**Error Handling:**
- Always use JQELError helper methods (`.isServerError()`, etc.)
- Never swallow errors - let TanStack Query handle error states
- Log retry attempts in development mode

### Reusable Code Examples

**Exponential Backoff from AuthProvider:**
```typescript
// File: frontend/src/providers/AuthProvider.tsx:120-122
const retryDelay = RETRY_BASE_DELAY_MS * Math.pow(2, renewalAttemptsRef.current - 1);
console.log(`Retrying renewal in ${retryDelay}ms`);
```

**Smart Retry Logic (Current):**
```typescript
// File: frontend/src/services/jqel/hooks/useJQELQuery.ts:12-25
function shouldRetry(failureCount: number, error: JQELError): boolean {
  // Don't retry client errors (4xx)
  if (error.code >= 400 && error.code < 500) {
    return false;
  }

  // Retry server errors (5xx) up to 3 times
  if (error.code >= 500) {
    return failureCount < 3;
  }

  return failureCount < 3;
}
```

**JQELError Helper Methods:**
```typescript
// File: frontend/src/services/jqel/errors.ts:55-58
isServerError(): boolean {
  return this.code >= 500 && this.code < 600;
}
```

## Critical Context

### Documentation

**SPEC-DA-ERR-004:005** - Retry with Exponential Backoff
- URL: `spec/SPEC-data-access.md:698-715`
- **Requirements:**
  - Queries CAN have automatic retry (`retry` option)
  - Retry MUST be configurable
  - No retry for 4xx errors (client errors won't succeed)
  - Retry 5xx errors up to 3 times (server errors may recover)
  - Use exponential backoff: `retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)`
  - Cap maximum delay at 30 seconds

**TanStack Query Retry Documentation**
- URL: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
- **Key Points:**
  - `retry`: boolean | number | function - Controls retry behavior
  - `retryDelay`: number | function - Controls delay between retries
  - Function signature: `retryDelay: (attemptIndex: number) => number`
  - `attemptIndex` is 0-based (first retry = 0)
  - Default behavior: 3 retries with increasing delays

### Gotchas and Pitfalls

- ⚠️ **TanStack Query v5 API Change:** `cacheTime` renamed to `gcTime`
  - Already handled in codebase (see `useJQELQuery.ts:33`)
  - Don't use `cacheTime` in new code

- ⚠️ **attemptIndex is 0-based:**
  - First retry has attemptIndex = 0
  - Formula must account for this: use `2 ** attemptIndex` not `2 ** (attemptIndex - 1)`
  - SPEC shows: `1000 * 2 ** attemptIndex`
  - AuthProvider shows: `BASE * Math.pow(2, attempts - 1)` (because attempts is 1-based counter)

- ⚠️ **Max delay cap is crucial:**
  - Without cap, delays grow unbounded (2^10 = 1024 seconds = 17 minutes!)
  - SPEC specifies 30 second cap: `Math.min(delay, 30000)`
  - Prevents excessive wait times for users

- ⚠️ **Network errors vs HTTP errors:**
  - Network failures (no response) should always retry
  - HTTP 4xx errors should never retry (won't change)
  - HTTP 5xx errors should retry (may recover)
  - Current `shouldRetry` handles this correctly

- ⚠️ **Development vs Production logging:**
  - Use `console.log` for retry debugging in development
  - Consider conditional logging: `if (import.meta.env.DEV) { console.log(...) }`
  - Don't spam production logs with retry attempts

### Existing Patterns to Follow

**Exponential Backoff Formula:**
```typescript
// Pattern: base * 2^attempts with cap
const delay = Math.min(BASE_DELAY * Math.pow(2, attemptIndex), MAX_DELAY);
```

**Retry Configuration Pattern:**
```typescript
// Pattern: Provide function that receives error context
retry: (failureCount: number, error: JQELError) => boolean
retryDelay: (attemptIndex: number, error: JQELError) => number
```

**Error Classification Pattern:**
```typescript
// Pattern: Use JQELError helper methods
if (error.isServerError()) { /* retry */ }
if (error.isAuthError()) { /* don't retry */ }
```

## Technical Specification

### Architecture

**No new files needed** - enhance existing structure:

```
frontend/src/services/jqel/
├── hooks/
│   ├── useJQELQuery.ts          ← MODIFY (add calculateRetryDelay)
│   ├── types.ts                 ← MODIFY (add RetryConfig interface)
│   ├── useJQELMutation.ts       ← NO CHANGE (mutations use different retry)
│   └── ...
├── errors.ts                    ← NO CHANGE (already has helpers)
└── client.ts                    ← NO CHANGE (HTTP client)
```

### Data Flow

```
Component calls useJQELQuery
        ↓
useJQELQuery creates query with retry config
        ↓
TanStack Query executes queryFn (jqelQuery)
        ↓
If query fails → shouldRetry checks error code
        ↓ (if true)
Wait for delay from calculateRetryDelay
        ↓
Retry query (repeat up to max attempts)
        ↓
Return error state if all retries exhausted
```

**Retry Delay Progression (SPEC formula):**
```
Attempt 0 (1st retry):  1000 * 2^0 = 1000ms   (1 second)
Attempt 1 (2nd retry):  1000 * 2^1 = 2000ms   (2 seconds)
Attempt 2 (3rd retry):  1000 * 2^2 = 4000ms   (4 seconds)
Attempt 3 (4th retry):  1000 * 2^3 = 8000ms   (8 seconds)
...
Attempt 10+:            min(1000 * 2^10, 30000) = 30000ms (30 seconds - capped)
```

### Modules and Responsibilities

**Module: useJQELQuery.ts**
- **Responsibility:** Execute JQEL SELECT queries with TanStack Query
- **Enhancements:**
  - Add `calculateRetryDelay` function
  - Update `DEFAULT_OPTIONS` to include `retryDelay`
  - Keep `shouldRetry` function unchanged (already correct)

**Module: types.ts**
- **Responsibility:** TypeScript interfaces for hooks
- **Enhancements:**
  - Add `RetryConfig` interface (optional configuration)
  - Update `UseJQELQueryOptions` to include retry config properties
  - Document defaults in JSDoc comments

### State Management

**No new state required** - TanStack Query manages retry state internally:
- `failureCount` - Tracked by TanStack Query
- `attemptIndex` - Passed to `retryDelay` function
- `error` - Available in retry functions

**Query options passed to useQuery:**
```typescript
{
  retry: shouldRetry,              // Function: (failureCount, error) => boolean
  retryDelay: calculateRetryDelay, // Function: (attemptIndex, error) => number
}
```

### Libraries and Tools

- **TanStack Query v5.90.7** - React Query library
  - Feature: `retry` option for smart retry logic
  - Feature: `retryDelay` option for delay calculation
  - API: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery

**No new dependencies required.**

## Implementation Blueprint

### Ordered Steps

#### Step 1: Add Retry Configuration Interface
**File:** `frontend/src/services/jqel/hooks/types.ts`

**Details:** Define TypeScript interface for retry configuration options.

**Pattern:** Follow existing `UseJQELQueryOptions` structure - extend with retry properties.

**Code to add:**
```typescript
/**
 * Retry configuration for JQEL queries
 * Based on SPEC-DA-ERR-004:005
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Base delay in milliseconds for exponential backoff
   * @default 1000 (1 second)
   */
  baseDelayMs?: number;

  /**
   * Maximum delay cap in milliseconds
   * @default 30000 (30 seconds)
   */
  maxDelayMs?: number;
}
```

**Update existing interface:**
```typescript
export interface UseJQELQueryOptions<T>
  extends Omit<UseQueryOptions<T[], JQELError>, 'queryKey' | 'queryFn'> {
  // ... existing properties ...

  /**
   * Retry configuration (overrides defaults)
   * Set to false to disable retries
   */
  retryConfig?: RetryConfig | false;
}
```

#### Step 2: Implement Exponential Backoff Calculation
**File:** `frontend/src/services/jqel/hooks/useJQELQuery.ts`

**Details:** Create function to calculate retry delay using exponential backoff.

**Pattern:** Follow SPEC formula: `Math.min(1000 * 2 ** attemptIndex, 30000)`

**Code to add (after `shouldRetry` function, before `DEFAULT_OPTIONS`):**
```typescript
/**
 * Calculate exponential backoff delay for retry attempts
 * Based on SPEC-DA-ERR-005 and AuthProvider pattern
 *
 * Formula: min(baseDelay * 2^attemptIndex, maxDelay)
 *
 * @param attemptIndex - 0-based retry attempt (0 = first retry, 1 = second retry, etc.)
 * @param error - JQELError from failed query (currently unused, but available for future logic)
 * @returns Delay in milliseconds before next retry
 *
 * @example
 * calculateRetryDelay(0) // 1000ms (1 second)
 * calculateRetryDelay(1) // 2000ms (2 seconds)
 * calculateRetryDelay(2) // 4000ms (4 seconds)
 * calculateRetryDelay(10) // 30000ms (30 seconds - capped)
 */
function calculateRetryDelay(attemptIndex: number, error: JQELError): number {
  const BASE_DELAY_MS = 1000; // 1 second base
  const MAX_DELAY_MS = 30000; // 30 second cap

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s (capped at 30s)
  const delay = BASE_DELAY_MS * Math.pow(2, attemptIndex);
  const cappedDelay = Math.min(delay, MAX_DELAY_MS);

  // Log retry delay in development
  if (import.meta.env.DEV) {
    console.log(`[JQEL Retry] Attempt ${attemptIndex + 1} will retry in ${cappedDelay}ms`);
  }

  return cappedDelay;
}
```

**Rationale:**
- Uses `Math.pow(2, attemptIndex)` for exponential growth
- Caps at 30 seconds per SPEC requirement
- Logs in development for debugging (won't spam production)
- Accepts `error` parameter for future enhancements (e.g., different delays for different errors)

#### Step 3: Update Default Options
**File:** `frontend/src/services/jqel/hooks/useJQELQuery.ts`

**Details:** Add `retryDelay` to `DEFAULT_OPTIONS` constant.

**Current code (lines 31-36):**
```typescript
const DEFAULT_OPTIONS: Partial<UseJQELQueryOptions<any>> = {
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 10 * 60 * 1000,          // 10 minutes
  refetchOnWindowFocus: false,
  retry: shouldRetry,
};
```

**Change to:**
```typescript
const DEFAULT_OPTIONS: Partial<UseJQELQueryOptions<any>> = {
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 10 * 60 * 1000,          // 10 minutes
  refetchOnWindowFocus: false,
  retry: shouldRetry,
  retryDelay: calculateRetryDelay, // Add exponential backoff
};
```

#### Step 4: Add Override Support (Optional Enhancement)
**File:** `frontend/src/services/jqel/hooks/useJQELQuery.ts`

**Details:** Allow per-query retry configuration overrides (future-proofing).

**Add helper function (optional - for advanced use cases):**
```typescript
/**
 * Create custom retry delay function with configuration
 * Allows overriding default backoff parameters per query
 */
function createRetryDelayFunction(config: RetryConfig) {
  return (attemptIndex: number, error: JQELError): number => {
    const baseDelay = config.baseDelayMs ?? 1000;
    const maxDelay = config.maxDelayMs ?? 30000;

    const delay = baseDelay * Math.pow(2, attemptIndex);
    return Math.min(delay, maxDelay);
  };
}
```

**Usage example (in hook):**
```typescript
// If user passes custom retryConfig, use it
const retryDelay = options?.retryConfig && options.retryConfig !== false
  ? createRetryDelayFunction(options.retryConfig)
  : calculateRetryDelay;
```

**Note:** This step is optional for MVP. Start simple, add if needed later.

#### Step 5: Update JSDoc Documentation
**File:** `frontend/src/services/jqel/hooks/useJQELQuery.ts`

**Details:** Document retry behavior in hook's JSDoc comment.

**Update existing JSDoc (lines 63-87) to include retry section:**
```typescript
/**
 * Execute JQEL SELECT query with TanStack Query
 *
 * Based on SPEC-DA-TQ-001:015
 *
 * Automatic retry with exponential backoff (SPEC-DA-ERR-004:005):
 * - Client errors (4xx): No retry (won't succeed)
 * - Server errors (5xx): Retry up to 3 times with backoff (1s, 2s, 4s)
 * - Network errors: Retry up to 3 times with backoff
 * - Max delay capped at 30 seconds
 *
 * @example
 * // Basic usage (automatic retry on server errors)
 * const { data: portal, isLoading } = useJQELQuery<Portal>({
 *   schema: 'backend',
 *   select: 'portal',
 *   where: { portalId: { $eq: 'main' } },
 * });
 *
 * @example
 * // Disable retries for specific query
 * const { data, error } = useJQELQuery<User>({
 *   schema: 'platform',
 *   select: 'user',
 * }, {
 *   retry: false, // No retries
 * });
 *
 * @param query - JQEL query object
 * @param options - TanStack Query options (optional)
 */
```

### Error Handling Strategy

**Error Types:**

1. **Network Errors (no response)**
   - **Cause:** Connection timeout, DNS failure, offline
   - **Handling:** Retry up to 3 times with exponential backoff
   - **Rationale:** Transient network issues often resolve quickly

2. **Client Errors (4xx)**
   - **Cause:** Bad request, unauthorized, not found, validation failure
   - **Handling:** No retry (return error immediately)
   - **Rationale:** Client errors require code/data changes, won't succeed on retry

3. **Server Errors (5xx)**
   - **Cause:** Backend crash, database timeout, n8n unavailable
   - **Handling:** Retry up to 3 times with exponential backoff
   - **Rationale:** Server may recover (restart, timeout resolution, etc.)

4. **Authentication Errors (401/403)**
   - **Cause:** Expired JWT, insufficient permissions
   - **Handling:** No retry (let AuthProvider handle token renewal)
   - **Rationale:** Auth errors need token refresh, not query retry

**Error Display Pattern:**
```typescript
// Component usage
const { data, error, isLoading } = useJQELQuery<Portal>({ ... });

if (error) {
  // JQELError has helper methods
  if (error.isAuthError()) {
    return <LoginPrompt />;
  }
  if (error.isServerError()) {
    return <ErrorMessage>Server error. We'll keep retrying...</ErrorMessage>;
  }
  return <ErrorMessage>{error.message}</ErrorMessage>;
}
```

**Retry State Visibility:**
- Component sees `isLoading = true` during retries
- Component sees `isFetching = true` during retries
- Error only set after all retries exhausted
- Users see loading state, not error flashes

### Files to Create

**None** - all changes are modifications to existing files.

### Files to Modify

1. **`frontend/src/services/jqel/hooks/types.ts`**
   - **What:** Add `RetryConfig` interface
   - **Why:** Type-safe retry configuration
   - **Lines:** Add ~20 lines (new interface + update existing interface)

2. **`frontend/src/services/jqel/hooks/useJQELQuery.ts`**
   - **What:** Add `calculateRetryDelay` function and update `DEFAULT_OPTIONS`
   - **Why:** Implement exponential backoff per SPEC
   - **Lines:** Add ~25 lines (function + comments), modify 1 line (DEFAULT_OPTIONS)

## Validation Gates

### Linting and Type Checking
```bash
# Run from frontend directory
cd src/prototype-2/frontend

# Type checking (must pass with no errors)
npm run type-check

# Linting (must pass with no errors)
npm run lint
```

**Expected Results:**
- No TypeScript errors (especially in types.ts and useJQELQuery.ts)
- No ESLint warnings
- All imports resolve correctly

### Build Verification
```bash
# Run from frontend directory
cd src/prototype-2/frontend

# Production build (must succeed)
npm run build
```

**Expected Results:**
- Build completes without errors
- No missing dependencies
- Bundle size increase < 1KB (minimal code added)

### Manual Testing

**Test Scenario 1: Server Error Retry**
1. Start backend and frontend
2. Open browser DevTools → Network tab
3. Use JQEL query to fetch data: `useJQELQuery({ schema: 'backend', select: 'portal' })`
4. Stop backend server (simulate 5xx error)
5. Trigger query (refresh page or invalidate cache)
6. **Expected:** See 3 retry attempts in Network tab with delays: 1s, 2s, 4s
7. **Expected:** Console logs show retry attempts (development mode)
8. **Expected:** Component shows loading state during retries
9. Restart backend
10. **Expected:** Next retry succeeds

**Test Scenario 2: Client Error No Retry**
1. Create query with invalid WHERE clause (causes 400 error)
2. Execute query
3. **Expected:** Error returned immediately (no retries)
4. **Expected:** Network tab shows only 1 request (no retries)
5. **Expected:** Component shows error state immediately

**Test Scenario 3: Network Error Retry**
1. Disconnect network (or use DevTools → Offline mode)
2. Execute query
3. **Expected:** See retry attempts with exponential backoff
4. Reconnect network during retry cycle
5. **Expected:** Query succeeds on next retry

**Test Scenario 4: Custom Retry Config (if implemented)**
```typescript
// Use query with custom retry settings
const { data } = useJQELQuery({
  schema: 'backend',
  select: 'portal'
}, {
  retryConfig: {
    maxAttempts: 5,      // More retries
    baseDelayMs: 500,    // Faster backoff
    maxDelayMs: 10000    // Lower cap
  }
});
```
- **Expected:** Retry 5 times with delays: 500ms, 1s, 2s, 4s, 8s

### Console Output Validation

**Development Mode (expected logs):**
```
[JQEL Retry] Attempt 1 will retry in 1000ms
[JQEL Retry] Attempt 2 will retry in 2000ms
[JQEL Retry] Attempt 3 will retry in 4000ms
```

**Production Mode:**
- No retry logs in console
- Cleaner user experience

### TanStack Query DevTools Check

1. Open React Query DevTools (bottom-right icon)
2. Find JQEL query in list
3. Click to inspect
4. **Expected:** See `Fetch Status: fetching` during retries
5. **Expected:** See `Error` state only after all retries exhausted
6. **Expected:** See retry count in query details

## References

### Specifications
- **SPEC-data-access.md (SPEC-DA-ERR-004:005)** - `spec/SPEC-data-access.md:698-715`
  - Retry configuration requirements
  - Exponential backoff formula
  - Error type handling rules

- **SPEC-jqel-syntax.md (SPEC-JQEL-RES-*)** - `spec/SPEC-jqel-syntax.md`
  - JResult envelope structure
  - Error code meanings

### Codebase Examples
- **AuthProvider retry logic:** `frontend/src/providers/AuthProvider.tsx:99-128`
- **Current shouldRetry function:** `frontend/src/services/jqel/hooks/useJQELQuery.ts:12-25`
- **JQELError helpers:** `frontend/src/services/jqel/errors.ts:27-58`

### External Documentation
- **TanStack Query Retries:** https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
- **TanStack Query useQuery API:** https://tanstack.com/query/latest/docs/framework/react/reference/useQuery

## Pre-Implementation Checklist

- [x] Researched SPEC requirements (SPEC-DA-ERR-004:005)
- [x] Analyzed existing retry logic in useJQELQuery
- [x] Identified exponential backoff pattern in AuthProvider
- [x] Reviewed TanStack Query retry API
- [x] Documented all files to modify
- [x] Created validation test scenarios
- [x] Identified error types and handling strategies

## Success Criteria

✅ **Implementation Complete When:**
1. `calculateRetryDelay` function implemented with exponential backoff
2. `DEFAULT_OPTIONS` updated to include `retryDelay`
3. `RetryConfig` interface added to types.ts
4. JSDoc documentation updated with retry behavior
5. All TypeScript compilation passes without errors
6. Build succeeds without errors
7. Manual testing confirms:
   - 5xx errors retry with delays: 1s, 2s, 4s
   - 4xx errors don't retry (immediate error)
   - Network errors retry with backoff
   - Console logs show retry attempts (dev mode only)
8. TanStack Query DevTools shows correct retry states

✅ **Quality Markers:**
- Code follows existing patterns (AuthProvider exponential backoff)
- No breaking changes to existing useJQELQuery API
- Minimal bundle size impact (< 1KB)
- Clear documentation for future developers
- Type-safe configuration options

✅ **Alignment with SPEC:**
- Retry disabled for 4xx errors ✓
- Retry up to 3 times for 5xx ✓
- Exponential backoff formula: `1000 * 2^attemptIndex` ✓
- Max delay capped at 30 seconds ✓
- Retry configuration is customizable ✓
