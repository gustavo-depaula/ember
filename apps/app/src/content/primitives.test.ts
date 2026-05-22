import { describe, expect, it } from 'vitest'
import type { FlowNode, Include, Primitive } from './primitives'

describe('Primitive vocabulary', () => {
  // The renderer will switch on `type`; this test pins the surface so a
  // forgotten case in the migration shows up immediately.
  it('covers every primitive variant exhaustively', () => {
    const examples: Primitive[] = [
      { type: 'text', text: { primary: 'a' } },
      { type: 'heading', text: { primary: 'a' } },
      { type: 'rubric', text: { primary: 'a' } },
      { type: 'divider' },
      { type: 'verses', items: [{ text: { primary: 'a' } }] },
      { type: 'image', src: 'a.jpg' },
      { type: 'prose', text: { primary: 'a' } },
      { type: 'callout', variant: 'section-marker', title: { primary: 'a' } },
      {
        type: 'container',
        behavior: { kind: 'group' },
        children: [{ type: 'divider' }],
      },
      {
        type: 'interaction',
        kind: 'offering',
        mode: 'both',
        default: 'pinned',
        show: 'list',
      },
    ]

    const seen = new Set(examples.map((p) => p.type))
    expect(seen).toEqual(
      new Set([
        'text',
        'heading',
        'rubric',
        'divider',
        'verses',
        'image',
        'prose',
        'callout',
        'container',
        'interaction',
      ]),
    )
  })

  it('include is a separate flow-author node, not a primitive', () => {
    const inc: Include = { type: 'include', source: 'bible-chapter', params: { book: 'gen' } }
    const node: FlowNode = inc
    expect(node.type).toBe('include')
  })

  it('verses primitive supports numbered and v/r styles', () => {
    const numbered: Primitive = {
      type: 'verses',
      header: { primary: 'Gen 1:1' },
      items: [{ num: 1, text: { primary: 'In the beginning…' } }],
      style: 'numbered',
    }
    const vr: Primitive = {
      type: 'verses',
      items: [
        { num: 'V', text: { primary: 'The Lord be with you' } },
        { num: 'R', text: { primary: 'And with your spirit' } },
      ],
      style: 'vr',
    }
    expect(numbered.type).toBe('verses')
    expect(vr.type).toBe('verses')
  })

  it('container behavior tagged union narrows correctly', () => {
    const collapsible: Primitive = {
      type: 'container',
      behavior: { kind: 'collapsible', title: { primary: 'Details' }, defaultOpen: false },
      children: [{ type: 'divider' }],
    }
    if (collapsible.behavior.kind === 'collapsible') {
      expect(collapsible.behavior.defaultOpen).toBe(false)
    } else {
      throw new Error('expected collapsible')
    }
  })
})
