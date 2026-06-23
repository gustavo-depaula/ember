// OPDS 1.2 (Atom) feed builders. CrossPoint's OPDS client is Calibre-compatible,
// so two feed kinds suffice: a root *navigation* feed listing sections, and one
// *acquisition* feed per section listing downloadable EPUB entries.

import { xmlEscape } from '../serialize/inline'
import type { SyncDocument } from '../types'

const NAV_TYPE = 'application/atom+xml;profile=opds-catalog;kind=navigation'
const ACQ_TYPE = 'application/atom+xml;profile=opds-catalog;kind=acquisition'

export type FeedSection = {
  id: string
  title: string
  // Root-absolute OPDS path, e.g. `/opds/daily`.
  path: string
}

export function buildNavFeed(sections: FeedSection[], updated: string): string {
  const entries = sections
    .map(
      (s) => `  <entry>
    <id>urn:ember:opds:section:${s.id}</id>
    <title>${xmlEscape(s.title)}</title>
    <updated>${updated}</updated>
    <link rel="subsection" type="${ACQ_TYPE}" href="${s.path}"/>
  </entry>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">
  <id>urn:ember:opds:root</id>
  <title>Ember</title>
  <updated>${updated}</updated>
  <link rel="self" type="${NAV_TYPE}" href="/opds"/>
  <link rel="start" type="${NAV_TYPE}" href="/opds"/>
${entries}
</feed>`
}

export function buildAcquisitionFeed(
  section: FeedSection,
  documents: SyncDocument[],
  updated: string,
): string {
  const entries = documents
    .map(
      (doc) => `  <entry>
    <id>urn:ember:doc:${doc.id}</id>
    <title>${xmlEscape(doc.title)}</title>
    <updated>${doc.updated}</updated>
    <author><name>Ember</name></author>${
      doc.summary ? `\n    <summary>${xmlEscape(doc.summary)}</summary>` : ''
    }
    <link rel="http://opds-spec.org/acquisition" type="application/epub+zip" href="/epub/${doc.id}.epub"/>
  </entry>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">
  <id>urn:ember:opds:section:${section.id}</id>
  <title>${xmlEscape(section.title)}</title>
  <updated>${updated}</updated>
  <link rel="self" type="${ACQ_TYPE}" href="${section.path}"/>
  <link rel="start" type="${NAV_TYPE}" href="/opds"/>
${entries}
</feed>`
}
