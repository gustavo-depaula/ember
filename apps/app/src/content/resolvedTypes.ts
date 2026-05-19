// After Phase 2-6 migration, `ResolvedSection` is just an alias for
// `Primitive`. The preprocessor splices includes inline, so the resolved
// tree contains only primitives.

import type { Primitive } from './primitives'

export type ResolvedSection = Primitive
