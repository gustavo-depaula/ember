import type { Href } from 'expo-router'

// The module's screens are mounted by route files the host app owns (see
// `index.ts`). Typed routes only know mounted files, so the module builds its
// hrefs here, untyped, in one place — it compiles whether or not it's plugged in.

export const custodyHref = '/custody' as Href

export function newCommitmentHref(templateId?: string): Href {
  return (templateId ? `/custody/new?template=${templateId}` : '/custody/new') as Href
}

export function commitmentHref(commitmentId: string): Href {
  return `/custody/${commitmentId}` as Href
}
