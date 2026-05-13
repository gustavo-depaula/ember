# Engineering Conventions

## Code Style

- **Functional** — pure functions, composition, no classes
- Prefer `undefined` over `null`
- Early returns + type narrowing for guard clauses
- Prefer `map`/`filter`/`reduce` over `for` loops
- Template literals always, even for simple concatenation

## Functions

`function` keyword for top-level / module exports. Arrow functions for inline callbacks only.

```typescript
// Top-level: function keyword
export function getStreak(logs: PracticeLog[]): number {
  if (logs.length === 0) return 0
  // ...
}

// Inline: arrow
const sorted = logs.sort((a, b) => a.date.localeCompare(b.date))
```

## Naming

- **Descriptive & explicit** by default; concise when scope is small and context is obvious
- PascalCase for component files: `GreenWall.tsx`, `SectionDivider.tsx`
- camelCase for everything else: `engine.ts`, `usePracticeStore.ts`, `psalter.ts`
- Never SCREAMING_SNAKE_CASE — use camelCase for constants: `const maxPractices = 8`

## Types

- Inline destructured props — no separate Props type unless complex:

```typescript
export function GreenWall({ data, onDayPress }: {
  data: DayData[]
  onDayPress?: (date: string) => void
}) {
  // ...
}
```

- Types colocated with the code that uses them
- Shared types in the nearest common scope (feature `index.ts` or `@/lib/types.ts`)
- Prefer `type` over `interface`

## Components

- **Colocated** — small helper components live in the same file, unexported:

```typescript
// GreenWall.tsx
function Cell({ value, date }: { value: number; date: string }) {
  return <View>...</View>
}

export function GreenWall({ data }: { data: DayData[] }) {
  return (
    <View>
      {data.map(d => <Cell key={d.date} value={d.value} date={d.date} />)}
    </View>
  )
}
```

- **Early returns** for loading/error/empty states (no nested ternaries in JSX):

```typescript
export function PracticeList({ date }: { date: string }) {
  const { data, isLoading, error } = useQuery(...)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!data?.length) return <EmptyState />

  return (
    <View>
      {data.map(p => <PracticeRow key={p.id} {...p} />)}
    </View>
  )
}
```

## Ternaries

- Single-level only in non-JSX code
- IIFE for multi-branch logic:

```typescript
// Single-level: OK
const label = isComplete ? 'Done' : 'Pending'

// Multi-branch: IIFE
const label = (() => {
  if (isComplete) return 'Done'
  if (isPending) return 'Pending'
  return 'Not started'
})()
```

## Constants

- Inline when used once — no need to extract
- Config objects to group related values:

```typescript
const psalter = {
  cycleDays: 30,
  complinePsalms: [4, 91, 134],
}
```

- Only extract to a shared scope when reused in 2+ places

## Exports & Imports

- **Named exports only** — no default exports
- **Barrel `index.ts`** files for folder public APIs
- **Path aliases** via tsconfig:

```typescript
import { GreenWall } from '@/components'
import { getStreak } from '@/features/plan-of-life'
import { usePreferencesStore } from '@/stores/preferencesStore'
```

## Formatting (Biome)

- Semicolons as needed (Biome `asNeeded` setting)
- Single quotes
- Indent style: spaces (2-space)
- Line width: 100
- TypeScript strict mode
- Biome handles both formatting and linting (replaces Prettier + ESLint)

## State & Data

- **Zustand** with immer middleware for client state (mutate drafts):

```typescript
export const usePreferencesStore = create(
  immer((set) => ({
    language: 'en',
    setLanguage: (language: string) => {
      set((state) => { state.language = language })
      setPreference('language', language)
    },
  }))
)
```

- **TanStack Query** for all async / DB reads:

```typescript
const { data: completions, isLoading } = useQuery({
  queryKey: ['completions', today],
  queryFn: () => getCompletionsForDate(today),
})
```

- **expo-sqlite** async API directly — no ORM, raw SQL queries with TypeScript row types from `@/db/schema`

## Error Handling

- Early returns with `undefined` (not null)
- Expo Router's built-in `ErrorBoundary` export per route file
- Let TanStack Query handle async errors (no manual try/catch for queries)

### Never swallow errors

Do not write silent rescues. `try { ... } catch { return }` (or any catch that throws away the error without telling the user or the maintainer) hides bugs that should be reported.

Preference order:

1. **Surface to the user** — toast, alert, inline message, or error boundary. The user can screenshot and report it. This is the goal.
2. **Let it crash** — acceptable; loud failures are debuggable.
3. **Silently swallow** — never.

`console.error` alone does not count — the user cannot see the console in a production build.

```typescript
// ✗ Bad — user-initiated action, error vanishes
try {
  await raiseIntention.mutateAsync({ text, cadence })
} catch {
  return
}

// ✓ Good — surface to the user
try {
  await raiseIntention.mutateAsync({ text, cadence })
} catch (err) {
  showErrorToast(err)
  return
}

// ✓ Also good — let it propagate / crash
await raiseIntention.mutateAsync({ text, cadence })
```

Returning a fallback value (e.g. cache miss → `undefined`) is fine **only when the fallback is a valid semantic result** — "not found" is not an error. The test: would the user notice if this silently failed? If yes, surface it.

Do not add defensive try/catch around code with no expected failure mode. Let unexpected exceptions propagate to the error boundary.

## Comments

- **Strategic** — section headers in longer files, brief 'why' on non-obvious logic
- No obvious comments (`// increment counter`)
- No JSDoc unless it's a truly public API
- Code should speak for itself

## Accessibility

- All `Pressable` / `AnimatedPressable` elements must have `accessibilityRole` and `accessibilityLabel`
- Stateful controls (checkboxes, toggles, collapsibles) must include `accessibilityState`
- Use i18n keys from the `a11y` namespace for labels (both `en.ts` and `pt-BR.ts`)
- Decorative elements (ornaments, flourishes, dividers) must be hidden from screen readers
- Compact UI elements that could break at large font sizes need `maxFontSizeMultiplier`
- See `docs/design/accessibility.md` for the full guide

## Testing

Three layers, fastest to slowest:

- **Unit (`*.test.ts`):** Vitest, colocated next to source. Deterministic business logic only — liturgical calculations, content engine, streak logic. No UI.
- **Integration (`*.test.tsx`):** Vitest + React Native Testing Library on `react-native-web` in jsdom. Real SQLite (better-sqlite3, `:memory:`), real Hearth corpus (read from `_site/hearth/v2/` on disk), real Zustand stores, real flow engine, real Tamagui. Drives multi-screen flows headlessly — no simulator, no dev server. Use for: render correctness, interaction flows, query/state plumbing. See `apps/app/src/test/renderApp.tsx` and `apps/app/src/features/practices/components/PracticeFlow.test.tsx` for the worked example.
- **E2E (Maestro):** `apps/app/.maestro/` against a running iOS sim. Covers animations, gestures, native bridges — anything the jsdom layer can't. Run with `pnpm --filter @ember/app test:e2e`.

Common conventions:

- Explicit imports: `import { describe, expect, it } from 'vitest'` (no globals)
- Run once: `pnpm test` — watch mode: `pnpm test:watch`. Integration tests share the same command; no separate runner.
- Before the first integration run: `pnpm build:corpus` (writes `_site/hearth/v2/`). The fetch interceptor reads from there.
- Integration tests share a global mock layer (`apps/app/src/test/setup.ts`). When you import a new native module, check whether it needs a stub there before writing a test against it.
- Reuse `resetForTests()` from `apps/app/src/db/test-fixtures.ts` — same contract Maestro uses via `/dev/reset`.

### Default to integration tests for feature work

When you add or change UI-visible behavior, write a `*.test.tsx` next to the feature. Integration tests run headlessly, against real SQLite and real Hearth content, in ~3s — fast enough for inner-loop feedback, no simulator needed.

Reach for unit (`*.test.ts`) only when the logic is genuinely UI-free. Reach for Maestro only when you need animations, gestures, or native bridges that the jsdom layer can't exercise.

### Writing an integration test

There's a working reference at `apps/app/src/features/practices/components/PracticeFlow.test.tsx` — skim it for the harness shape, then write what your feature needs.

Rules:

- **Register only the routes you exercise** via `routes: [...]`. Pulling in `/` drags in the whole home screen tree — slow, and you usually don't need it.
- **Selectors:** `accessibilityLabel` first via `findByLabelText`. Add `testID` only per the rules below.
- **Fixtures:** `resetForTests({ now, enableSlotKeys })` is the only seeding API. Don't write your own DB inserts in tests.
- **Assert on what the user sees,** not on internal state. Use `findBy*` for async appearance; don't write polling loops.
- **When you add a new screen** that integration tests will navigate to, the test registers it via `routes: [...]`. No global registry to maintain.
- **When you add a new native dependency,** check `apps/app/src/test/setup.ts` first. If the package isn't mocked, the test will hang at import. Add a stub there in the same PR.

### What integration tests can't catch

These belong to Maestro (or are simply untestable headlessly):

- Real animations, swipes, scrub gestures, drag-dismiss
- Haptic timing, real notification scheduling, native splash
- True responsive breakpoints — jsdom is fixed at 1024×768
- Font-dependent layout / line-wrap (custom fonts don't load in jsdom)
- WebView contents (book reader)
- Real router back-stack semantics (`useFocusEffect` re-runs, swipe-to-pop)

Don't assert on measured pixels. Assert on accessibility labels and DOM presence.

### Before reporting a task complete

1. `pnpm --filter @ember/app test` is green.
2. If the change is UI-visible, your `.test.tsx` covers the golden path and at least one edge case.
3. If you touched something Maestro covers (`apps/app/.maestro/flows/*.yaml`), flag it — Maestro needs a simulator, the user runs it.

### `testID` guidance

Default to `accessibilityLabel` for selectors — Maestro reads them, and we already require labels everywhere. Add `testID` only when:

- The label is interpolated with content that may shift (e.g. `t('a11y.viewPractice', { name })` — name varies by language and content updates)
- The label is dynamic by state and the test needs to target the element regardless (toggle vs untoggle)
- The hit target has no label and adding one would clutter screen-reader output

Format: `testID="<surface>-<id>"`, kebab-case (e.g. `slot-row-grace-meals`, `select-option-before`). Do not gate on i18n keys.
