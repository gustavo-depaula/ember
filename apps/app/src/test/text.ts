import { getDefaultNormalizer } from '@testing-library/react'

/**
 * Text queries that read reading-surface text the way a reader sees it.
 *
 * Wherever the platform breaks a paragraph, `ReadingParagraph` hands it soft
 * hyphens (U+00AD) so long words can wrap — invisible unless a line breaks
 * there, but present in the DOM text a query matches against. Pass this as a
 * query's options: `getByText('Tempora collect', unhyphenated)`.
 */
export const unhyphenated = {
  normalizer: (text: string) => getDefaultNormalizer()(text.replaceAll('­', '')),
}
