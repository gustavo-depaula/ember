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
import { usePracticeStore } from '@/stores/practiceStore'
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
export const usePracticeStore = create(
  immer((set) => ({
    logs: [] as PracticeLog[],
    togglePractice: (id: string, date: string) =>
      set((state) => {
        const log = state.logs.find(l => l.practiceId === id && l.date === date)
        if (log) log.completed = !log.completed
      }),
  }))
)
```

- **TanStack Query** for all async / DB reads:

```typescript
const { data: logs, isLoading } = useQuery({
  queryKey: ['practiceLogs', today],
  queryFn: () => getDb().getAllAsync<PracticeLog>('SELECT * FROM practice_logs WHERE date = ?', [today]),
})
```

- **expo-sqlite** async API directly — no ORM, raw SQL queries with TypeScript row types from `@/db/schema`

## Error Handling

- Early returns with `undefined` (not null)
- Expo Router's built-in `ErrorBoundary` export per route file
- Let TanStack Query handle async errors (no manual try/catch for queries)

## Comments

- **Strategic** — section headers in longer files, brief 'why' on non-obvious logic
- No obvious comments (`// increment counter`)
- No JSDoc unless it's a truly public API
- Code should speak for itself

## Testing

- None for MVP
- When added later: Vitest for pure logic (lectio continua engine, psalter engine, streak calculation)
