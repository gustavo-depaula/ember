import type { APIRoute } from 'astro'
import { htmlLang } from '~/lib/locale'
import { type SitemapFile, sitemapFiles } from '~/lib/sitemap'

export async function getStaticPaths() {
  return (await sitemapFiles()).map((file) => ({ params: { name: file.name }, props: { file } }))
}

export const GET: APIRoute = ({ props, site }) => {
  const { entries } = (props as { file: SitemapFile }).file
  const abs = (path: string) => new URL(path, site).href
  const urls = entries
    .map((entry) => {
      const alternates = Object.entries(entry.alternates)
      const links =
        alternates.length > 1
          ? alternates
              .map(
                ([locale, path]) =>
                  `<xhtml:link rel="alternate" hreflang="${htmlLang[locale as keyof typeof htmlLang]}" href="${abs(path)}"/>`,
              )
              .join('')
          : ''
      return `<url><loc>${abs(entry.path)}</loc>${links}</url>`
    })
    .join('')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  )
}
