/**
 * Renders feed-supplied HTML (episode summaries, video descriptions, article
 * bodies) in a WebView so links, paragraphs, and inline formatting survive.
 * Theme color is injected into the inline stylesheet so dark mode works.
 *
 * SECURITY NOTE: the HTML comes from external RSS/Atom feeds and is rendered
 * with `javaScriptEnabled`. We treat trusted-creator output as the implicit
 * allowlist for now; XSS hardening (sanitize or sandbox) is tracked separately.
 */

import { useMemo } from 'react'
import { useTheme } from 'tamagui'

import { HtmlWebView } from './HtmlWebView'

function doc(body: string, color: string, link: string): string {
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{font-family:Georgia,serif;line-height:1.6;padding:24px;color:${color};background:transparent;margin:0;}
  img,figure{max-width:100%;height:auto;}
  a{color:${link};text-decoration:underline;}
  p{margin:0 0 1em;}
  ul,ol{padding-left:1.4em;margin:0 0 1em;}
</style></head><body>${body}</body></html>`
}

export function RichDescription({ html }: { html: string }) {
  const theme = useTheme()
  const color = theme.color.val
  const link = theme.accent.val
  const doc_ = useMemo(() => doc(html, color, link), [html, color, link])
  return <HtmlWebView html={doc_} />
}
