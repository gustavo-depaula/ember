// `/llms.txt` (llmstxt.org): a Markdown index an AI assistant reads first, pointing at the
// portal's Markdown editions; `/llms-full.txt` is those editions in one file.
import { type DevDoc, publishedDevDocs } from '~/routes'
import { devMarkdown, markdownPath } from './markdown'

const summaries: Record<DevDoc, { title: string; en: string; pt: string; ptTitle: string }> = {
  overview: {
    title: 'Overview',
    ptTitle: 'Visão geral',
    en: 'what is open, a quick start, and how to use it well',
    pt: 'o que está aberto, primeiros passos e bom uso',
  },
  api: {
    title: 'Mass-times API',
    ptTitle: 'API de horários de Missa',
    en: 'endpoints, parameters, response schemas and examples',
    pt: 'rotas, parâmetros, schemas das respostas e exemplos',
  },
  corpus: {
    title: 'The corpus',
    ptTitle: 'O acervo',
    en: 'the catalog, hash-named blobs and refs of the published corpus',
    pt: 'o catálogo, os blobs nomeados pelo hash e as refs do acervo publicado',
  },
  flows: {
    title: 'Flow DSL',
    ptTitle: 'DSL de fluxos',
    en: 'the JSON language Ember’s prayers are written in',
    pt: 'a linguagem JSON em que as orações do Ember são escritas',
  },
}

export function llmsIndex(site: URL): string {
  const url = (path: string) => new URL(path, site).href
  return `# Ember

> Ember is a Catholic prayer app in English and Brazilian Portuguese, with a companion website. Its developer portal documents the open Mass-times API: churches worldwide with the times of their Masses, confessions and adoration. There are no keys and no sign-up, and every response allows any origin.

The whole portal in one file: ${url('/llms-full.txt')}

## Developer docs

${publishedDevDocs.map((doc) => `- [${summaries[doc].title}](${url(markdownPath('en-US', doc))}): ${summaries[doc].en}`).join('\n')}
- [OpenAPI document](${url('/developers/openapi.json')}): the Mass-times API as OpenAPI 3.1

## Optional

${publishedDevDocs.map((doc) => `- [${summaries[doc].ptTitle}](${url(markdownPath('pt-BR', doc))}): ${summaries[doc].pt} (em português)`).join('\n')}
`
}

export function llmsFull(site: URL): string {
  return publishedDevDocs.map((doc) => devMarkdown(doc, 'en-US', site)).join('\n---\n\n')
}
