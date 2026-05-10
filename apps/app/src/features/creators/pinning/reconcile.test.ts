/**
 * Pure reconciliation tests. Auto-pin policy is *derived* state: given a
 * follow record's `autoPinCount` and the recent items, the auto-pinned set is
 * deterministic. The reconciler is idempotent — running it twice yields the
 * same operations as running it once.
 */

import { describe, expect, it } from 'vitest'
import { computeReconcile } from './reconcile'

const items = (n: number) => Array.from({ length: n }, (_, i) => ({ itemId: `item-${i}` }))

describe('computeReconcile', () => {
  it('pins the top N when nothing is auto-pinned yet', () => {
    const result = computeReconcile(items(5), new Set(), 3)
    expect(result.toPin).toEqual(['item-0', 'item-1', 'item-2'])
    expect(result.toUnpin).toEqual([])
  })

  it('does nothing when autoPinCount is 0', () => {
    const result = computeReconcile(items(5), new Set(['item-0']), 0)
    expect(result.toPin).toEqual([])
    // Honour the contract: if autoPinCount drops to zero, every previously
    // auto-pinned item should drain.
    expect(result.toUnpin).toEqual(['item-0'])
  })

  it('rotates the auto-pinned set when newer items arrive', () => {
    // Existing auto-pins were items 2,3,4 — now 0,1,2 should be auto-pinned.
    const result = computeReconcile(items(5), new Set(['item-2', 'item-3', 'item-4']), 3)
    expect(new Set(result.toPin)).toEqual(new Set(['item-0', 'item-1']))
    expect(new Set(result.toUnpin)).toEqual(new Set(['item-3', 'item-4']))
  })

  it('is idempotent when already in the target state', () => {
    const result = computeReconcile(items(5), new Set(['item-0', 'item-1', 'item-2']), 3)
    expect(result.toPin).toEqual([])
    expect(result.toUnpin).toEqual([])
  })

  it('handles autoPinCount larger than available items', () => {
    const result = computeReconcile(items(2), new Set(), 5)
    expect(result.toPin).toEqual(['item-0', 'item-1'])
    expect(result.toUnpin).toEqual([])
  })

  it('only operates on auto-pinned ids — manual pins are not its concern', () => {
    // Caller passes in only the auto-pinned set; manual pins (item-9) are
    // outside the world-view and untouched.
    const result = computeReconcile(items(3), new Set(['item-2']), 2)
    expect(new Set(result.toPin)).toEqual(new Set(['item-0', 'item-1']))
    expect(result.toUnpin).toEqual(['item-2'])
  })
})
