import type { APIRoute } from 'astro'
import { type Locale, locales } from '~/lib/locale'
import { buildSearchData } from '~/lib/searchData'

export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }))
}

export const GET: APIRoute = async ({ params }) =>
  new Response(JSON.stringify(await buildSearchData(params.locale as Locale)), {
    headers: { 'content-type': 'application/json' },
  })
