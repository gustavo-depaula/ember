import type { APIRoute } from 'astro'
import { sitemapFiles } from '~/lib/sitemap'

export const GET: APIRoute = async ({ site }) => {
  const files = await sitemapFiles()
  const body = files
    .map(
      (file) => `<sitemap><loc>${new URL(`/sitemaps/${file.name}.xml`, site).href}</loc></sitemap>`,
    )
    .join('')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  )
}
