import { describe, expect, it } from 'vitest'
import { getCssFontFamily } from '@/config/readingFonts'

describe('getCssFontFamily', () => {
  it('maps expo-font key to WebKit PostScript name (hyphenated, no weight)', () => {
    expect(getCssFontFamily('eb-garamond')).toBe('EBGaramond-Regular')
    expect(getCssFontFamily('crimson-pro')).toBe('CrimsonPro-Regular')
    expect(getCssFontFamily('lora')).toBe('Lora-Regular')
  })
})
