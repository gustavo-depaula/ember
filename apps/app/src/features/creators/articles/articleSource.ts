import type { CreatorChannel } from '@/content/manifestTypes'

export type ArticleMode = 'summary' | 'fullText'

/**
 * Summary-by-default keeps us out of paywall + truncated-RSS breakage; the
 * per-channel `fullText` flag is a per-creator editorial allowlist.
 */
export function resolveArticleMode(
  channel: CreatorChannel,
  body: string,
): { mode: ArticleMode; body: string } {
  if (channel.fullText && body.trim().length > 0) {
    return { mode: 'fullText', body }
  }
  return { mode: 'summary', body }
}
