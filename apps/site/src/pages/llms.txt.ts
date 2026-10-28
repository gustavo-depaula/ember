import type { APIRoute } from 'astro'
import { llmsIndex } from '~/lib/developers/llms'

export const GET: APIRoute = ({ site }) =>
  new Response(llmsIndex(site ?? new URL('https://ember.dpgu.me')), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
