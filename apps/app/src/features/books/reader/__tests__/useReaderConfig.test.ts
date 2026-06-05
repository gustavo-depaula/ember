import { describe, expect, it } from 'vitest'
import { toCssFontFamily } from '../useReaderConfig'

describe('toCssFontFamily', () => {
  it('maps expo-font key to WebKit PostScript name (hyphenated, no weight)', () => {
    expect(toCssFontFamily('eb-garamond')).toBe('EBGaramond-Regular')
    expect(toCssFontFamily('crimson-pro')).toBe('CrimsonPro-Regular')
    expect(toCssFontFamily('lora')).toBe('Lora-Regular')
  })

  it('falls back to Georgia for unknown ids', () => {
    expect(toCssFontFamily('not-a-font')).toBe('Georgia')
  })
})
