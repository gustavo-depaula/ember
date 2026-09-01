import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { config } from '@/config/tamagui.config'
import { AnimatedCheckbox } from './AnimatedCheckbox'

// These cannot reproduce the bug this component kept having — that needs a real
// native screen detach/reattach, and jsdom renders once and looks right either
// way. What they pin down is the invariant the fix rests on: the checked look
// comes out of an ordinary render, present the moment React commits, waiting on
// nothing reanimated does. Put the fill back in an animated style and the first
// assertion goes empty.
//
// The glyph is deliberately not asserted: lucide-react-native draws through
// react-native-svg, which renders nothing under jsdom, so its absence here says
// nothing either way.
function wrap(node: ReactNode) {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      {node}
    </TamaguiProvider>,
  )
}

function circle() {
  // testID wrapper > pulse view > the circle itself
  const el = screen.getByTestId('cb').querySelector(':scope > div > div')
  if (!el) throw new Error('checkbox circle not found')
  return el as HTMLElement
}

afterEach(cleanup)

describe('AnimatedCheckbox', () => {
  it('paints a checked box filled on its very first render', () => {
    wrap(<AnimatedCheckbox checked onToggle={() => {}} accessibilityLabel="done" testID="cb" />)

    const { backgroundColor, borderTopColor } = circle().style
    expect(backgroundColor).not.toBe('')
    expect(backgroundColor).not.toBe('transparent')
    expect(borderTopColor).toBe(backgroundColor)
  })

  it('leaves an unchecked box empty', () => {
    wrap(
      <AnimatedCheckbox
        checked={false}
        onToggle={() => {}}
        accessibilityLabel="not done"
        testID="cb"
      />,
    )

    // jsdom normalises the keyword to its rgba form
    expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(circle().style.backgroundColor)
  })

  it('repaints when checked flips on an already-mounted box', () => {
    wrap(
      <AnimatedCheckbox checked={false} onToggle={() => {}} accessibilityLabel="p" testID="cb" />,
    )
    const empty = circle().style.backgroundColor

    cleanup()
    wrap(<AnimatedCheckbox checked onToggle={() => {}} accessibilityLabel="p" testID="cb" />)

    expect(circle().style.backgroundColor).not.toBe(empty)
  })

  it('exposes checked state to assistive tech', () => {
    wrap(<AnimatedCheckbox checked onToggle={() => {}} accessibilityLabel="done" testID="cb" />)
    expect(screen.getByTestId('cb').getAttribute('aria-checked')).toBe('true')
  })

  it('toggles on press', () => {
    const onToggle = vi.fn()
    wrap(
      <AnimatedCheckbox checked={false} onToggle={onToggle} accessibilityLabel="p" testID="cb" />,
    )

    fireEvent.click(screen.getByTestId('cb'))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
