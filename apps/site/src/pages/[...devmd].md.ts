import type { APIRoute, GetStaticPaths } from 'astro'
import { devMarkdown, markdownPath } from '~/lib/developers/markdown'
import { locales } from '~/lib/locale'
import { type DevDoc, publishedDevDocs } from '~/routes'

// Each published portal page's Markdown edition, at its path with `.md` (`/developers/api.md`).
export const getStaticPaths = (() =>
  locales.flatMap((locale) =>
    publishedDevDocs.map((doc) => ({
      params: { devmd: markdownPath(locale, doc).replace(/^\/|\.md$/g, '') },
      props: { locale, doc },
    })),
  )) satisfies GetStaticPaths

export const GET: APIRoute<{ locale: (typeof locales)[number]; doc: DevDoc }> = ({ props, site }) =>
  new Response(devMarkdown(props.doc, props.locale, site ?? new URL('https://ember.dpgu.me')), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
