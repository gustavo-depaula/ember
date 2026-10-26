import type { APIRoute } from 'astro'
import { llmsFull } from '~/lib/developers/llms'

export const GET: APIRoute = ({ site }) =>
  new Response(llmsFull(site ?? new URL('https://ember.dpgu.me')), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
