import type { APIRoute } from 'astro'
import { appLinkFiles } from '~/lib/appLinks'

// The files iOS and Android fetch to learn that the app may open this site's
// prayer pages.
export function getStaticPaths() {
  return Object.entries(appLinkFiles()).map(([file, body]) => ({
    params: { file },
    props: { body },
  }))
}

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(props.body), { headers: { 'content-type': 'application/json' } })
