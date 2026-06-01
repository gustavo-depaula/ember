import { describe, expect, it } from 'vitest'
import type { RenderedSection } from '@/content/types'
import { findTrackIds } from '../findTrackIds'

// A select whose two branches each include a different reading track. Now that
// the engine materializes every branch, completion must advance the cursor for
// only the branch the user actually prayed.
function selectWithTwoTracks(): RenderedSection[] {
  return [
    {
      type: 'select',
      label: { primary: 'View' },
      overrideKey: 'view',
      selectedId: 'gospel',
      options: [
        {
          id: 'gospel',
          label: { primary: 'Gospel' },
          sections: [{ type: 'include', ref: 'reading/gospel', trackId: 'gospel-track' }],
        },
        {
          id: 'epistle',
          label: { primary: 'Epistle' },
          sections: [{ type: 'include', ref: 'reading/epistle', trackId: 'epistle-track' }],
        },
      ],
    } as RenderedSection,
  ]
}

describe('findTrackIds — follows the selected branch', () => {
  it('returns only the default branch when no override is set', () => {
    expect(findTrackIds(selectWithTwoTracks(), {})).toEqual(['gospel-track'])
  })

  it('returns only the overridden branch when the user switched tabs', () => {
    expect(findTrackIds(selectWithTwoTracks(), { view: 'epistle' })).toEqual(['epistle-track'])
  })

  it('never collects track ids from unselected branches', () => {
    const ids = findTrackIds(selectWithTwoTracks(), { view: 'gospel' })
    expect(ids).not.toContain('epistle-track')
  })
})
