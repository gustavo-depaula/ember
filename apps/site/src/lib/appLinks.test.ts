import { expect, test } from 'vitest'
import { practiceIdFromWebPath, practiceWebUrl, siteOrigin } from '@/lib/webLinks'
import app from '../../../app/app.json'
import { href } from '../routes'
import { locales } from './locale'

test('the link the app shares is the prayer’s page, and leads back to the prayer', () => {
  for (const locale of locales) {
    const page = href.prayer(locale, 'practice/rosary')
    expect(practiceWebUrl('rosary', locale)).toBe(`${siteOrigin}${page}`)
    expect(practiceWebUrl('practice/rosary', locale)).toBe(`${siteOrigin}${page}`)
    expect(practiceIdFromWebPath(page)).toBe('rosary')
    expect(practiceIdFromWebPath(`${siteOrigin}${page}?utm=x`)).toBe('rosary')
    expect(practiceIdFromWebPath(href.prayerDay(locale, 'practice/novena-x', 3))).toBe('novena-x')
    // Not a prayer: the section's index, another section.
    expect(practiceIdFromWebPath(href.section(locale, 'prayers'))).toBeUndefined()
    expect(practiceIdFromWebPath(href.book(locale, 'book/rosary'))).toBeUndefined()
  }
})

test('Android claims the prayer pages of every language', () => {
  const claimed = app.expo.android.intentFilters.flatMap((f) => f.data.map((d) => d.pathPattern))
  const pages = locales.map((l) => `${href.section(l, 'prayers')}..*`)
  expect(claimed.sort()).toEqual(pages.sort())
})
