// The developer overview's content, read by its page and by its Markdown edition alike, so the
// two say the same thing. Prose carries Markdown's inline marks (`code`, **bold**, [label](url)).
import { getCatalog } from '@/content/contentIndex'
import type { Locale } from '~/lib/locale'
import { massTimesApi } from '~/lib/massTimes/data'
import { type DevDoc, href, publishedDevDocs } from '~/routes'
import { flowReference, sourceUrl } from './flowReference'
import { chooser } from './text'

export function overviewPage(locale: Locale, site: URL) {
  const l = chooser(locale)
  const number = (n: number) => n.toLocaleString(locale)
  const corpusUrl = new URL('/hearth/v2', site).href
  const items = Object.keys(getCatalog().items).length
  const flows = flowReference()
  // The corpus and flow DSL guides wait to be published (see `publishedDevDocs`); until then the
  // overview speaks of the Mass-times API alone.
  const corpus = publishedDevDocs.includes('corpus')
  const dsl = publishedDevDocs.includes('flows')

  const doors: {
    doc: DevDoc
    kicker: string
    title: string
    body: string
    base?: string
    cta: string
  }[] = [
    {
      doc: 'api',
      kicker: 'REST · JSON',
      title: l('Mass-times API', 'API de horários de Missa'),
      body: l(
        'Churches near a point, by name or on a map, each with its Mass, confession and adoration times written as recurrence rules.',
        'Igrejas perto de um ponto, pelo nome ou num mapa, cada uma com seus horários de Missa, confissão e adoração escritos como regras de recorrência.',
      ),
      base: massTimesApi,
      cta: l('API reference', 'Referência da API'),
    },
    {
      doc: 'corpus',
      kicker: l('Static · by hash', 'Estático · por hash'),
      title: l('The corpus', 'O acervo'),
      body: l(
        `${number(items)} items: prayers, books, Mass propers, the Liturgy of the Hours and chant, as JSON files any static host can serve.`,
        `${number(items)} itens: orações, livros, próprios da Missa, a Liturgia das Horas e o canto, em arquivos JSON que qualquer hospedagem estática serve.`,
      ),
      base: corpusUrl,
      cta: l('Corpus guide', 'Guia do acervo'),
    },
    {
      doc: 'flows',
      kicker: l('JSON · declarative', 'JSON · declarativo'),
      title: l('Flow DSL', 'DSL de fluxos'),
      body: l(
        `The language ${number(flows.itemCount)} prayers and chapters are written in: ${flows.sections.length} section types, each shown with an example from the corpus.`,
        `A linguagem em que estão escritos ${number(flows.itemCount)} orações e capítulos: ${flows.sections.length} tipos de seção, cada um com um exemplo do acervo.`,
      ),
      cta: l('Language reference', 'Referência da linguagem'),
    },
  ]

  const quickStart = `${l('# The five churches nearest the Sé of São Paulo', '# As cinco igrejas mais próximas da Sé de São Paulo')}
curl '${massTimesApi}/churches/near?lat=-23.5505&lng=-46.6333&limit=5'${
    corpus
      ? `

${l('# Every item in the corpus, by id', '# Todos os itens do acervo, pelo id')}
curl '${corpusUrl}/catalog.json'`
      : ''
  }`

  const fetchRosary = `const base = '${corpusUrl}'
const blob = (hash) => fetch(\`\${base}/blobs/\${hash.slice(0, 2)}/\${hash.slice(2, 4)}/\${hash}\`)

const { items } = await (await fetch(\`\${base}/catalog.json\`)).json()
const manifest = await (await blob(items['practice/rosary'].hash)).json()
const flow = await (await blob(manifest.flowHash.hash)).json()`

  // Any church, by id, on one static page of the site (scripts/mass-times.ts fills it from `?id=`).
  // What a credit links to: the page that presents Ember, in the reader's language.
  const appPage = new URL(href.landing(locale), site).href
  const churchPage = `${new URL(href.massTimesPlace(locale, locale === 'pt-BR' ? 'igreja' : 'church'), site).href}?id={id}`

  // Each line states what the Worker does (apps/backend: app.ts, writeGuard, wrangler.jsonc).
  const manners = [
    corpus
      ? l(
          '**Cache what you fetch.** A corpus blob is named by the hash of its bytes and never changes; keep it for good. Church data changes by the day: keeping it for up to a day is fine. Fetch a church again when someone opens it, so they see the latest corrections.',
          '**Guarde o que buscar.** Um blob do acervo tem como nome o hash dos seus bytes e nunca muda: pode guardá-lo para sempre. Os dados das igrejas mudam de um dia para o outro: pode guardá-los por até um dia. Busque de novo uma igreja quando alguém a abrir, para que veja as últimas correções.',
        )
      : l(
          '**Cache what you fetch.** Church data changes by the day: keeping it for up to a day is fine, and a mirror can refresh daily. Fetch a church again when someone opens it, so they see the latest corrections. Reads have no rate limit, so for heavy traffic serve your own copy rather than calling the API for every visitor.',
          '**Guarde o que buscar.** Os dados das igrejas mudam de um dia para o outro: pode guardá-los por até um dia, e um espelho pode se atualizar diariamente. Busque de novo uma igreja quando alguém a abrir, para que veja as últimas correções. As leituras não têm limite de frequência; com muito tráfego, sirva uma cópia sua em vez de chamar a API a cada visitante.',
        ),
    l(
      '**Show how fresh a time is.** Parishes change their times and a directory falls behind. Show `lastVerifiedAt` beside a schedule, and let people confirm it or send a correction from your app.',
      '**Mostre quando o horário foi conferido.** As paróquias mudam seus horários e um diretório fica para trás. Mostre `lastVerifiedAt` ao lado dos horários, e deixe as pessoas confirmá-los ou enviar uma correção pelo seu aplicativo.',
    ),
    l(
      `**Credit Ember, if you can.** We’d be grateful for a line such as “Mass times from Ember” linking to [${appPage.replace(/^https:\/\//, '')}](${appPage}). Where you show a single church, its page on Ember, \`${churchPage}\`, makes a good link too.`,
      `**Cite o Ember, se puder.** Ficaremos gratos por uma linha como “Horários do Ember” com link para [${appPage.replace(/^https:\/\//, '')}](${appPage}). Onde mostrar uma só igreja, a página dela no Ember, \`${churchPage}\`, também é um bom link.`,
    ),
    l(
      '**Writes are suggestions.** A correction goes to a queue a person reviews and never edits a church directly. A confirmation counts once per client and church every 30 days. Each client may write 20 times a minute; past that the API answers `429`.',
      '**Escritas são sugestões.** Uma correção vai para uma fila que uma pessoa revisa e nunca altera uma igreja diretamente. Uma confirmação conta uma vez por cliente e igreja a cada 30 dias. Cada cliente pode escrever 20 vezes por minuto; acima disso a API responde `429`.',
    ),
    l(
      '**Identify each device or person.** A client is its IP address together with the `X-Client-Id` header. Send a stable id per device or user, so people who share an address, such as everyone whose writes pass through your server, keep separate limits and separate confirmations.',
      '**Identifique cada aparelho ou pessoa.** Um cliente é o seu endereço IP junto com o cabeçalho `X-Client-Id`. Envie um id fixo por aparelho ou usuário, para que pessoas que compartilham um endereço, como todos cujas escritas passam pelo seu servidor, tenham limites e confirmações separados.',
    ),
  ]

  const sources = [
    {
      path: 'apps/backend',
      what: l(
        'The Mass-times Worker: Hono on Cloudflare Workers and D1',
        'O Worker dos horários: Hono no Cloudflare Workers e D1',
      ),
    },
    {
      path: 'packages/api',
      what: l(
        'The API’s schemas, its OpenAPI document and a schedule expander',
        'Os schemas da API, seu documento OpenAPI e um expansor de horários',
      ),
    },
    ...(corpus
      ? [
          {
            path: 'scripts/build-corpus.py',
            what: l(
              'How content/ becomes the published corpus',
              'Como content/ vira o acervo publicado',
            ),
          },
        ]
      : []),
    ...(dsl
      ? [
          {
            path: 'packages/content-engine',
            what: l(
              'The engine that turns a flow into text to pray',
              'O motor que transforma um fluxo em texto para rezar',
            ),
          },
        ]
      : []),
  ].map((s) => ({ ...s, url: sourceUrl(s.path) }))

  return {
    title: l('Build with Ember', 'Construa com o Ember'),
    lede: corpus
      ? l(
          'Ember’s data is open: a directory of Mass times to query, and a corpus of prayers, books and liturgy to fetch as static files. There are no keys and no sign-up, and every response allows any origin.',
          'Os dados do Ember são abertos: um diretório de horários de Missa para consultar, e um acervo de orações, livros e liturgia para baixar como arquivos estáticos. Não há chaves nem cadastro, e toda resposta aceita qualquer origem.',
        )
      : l(
          'Ember’s directory of Mass times is open: churches worldwide with the times of their Masses, confessions and adoration. There are no keys and no sign-up, and every response allows any origin.',
          'O diretório de horários de Missa do Ember é aberto: igrejas do mundo todo com os horários de suas Missas, confissões e adoração. Não há chaves nem cadastro, e toda resposta aceita qualquer origem.',
        ),
    doors: doors
      .filter((d) => publishedDevDocs.includes(d.doc))
      .map((d) => ({ ...d, to: href.developers(locale, d.doc) })),
    start: {
      title: l('Quick start', 'Primeiros passos'),
      intro: corpus
        ? l(
            'Both resources answer plain HTTP GETs. From a shell:',
            'Os dois recursos respondem a um simples GET. No terminal:',
          )
        : l(
            'The API answers plain HTTP GETs. From a shell:',
            'A API responde a um simples GET. No terminal:',
          ),
      shell: quickStart,
      prayer: corpus
        ? {
            intro: l(
              'And a prayer, from catalog to text, in a browser or any JavaScript runtime:',
              'E uma oração, do catálogo ao texto, num navegador ou em qualquer ambiente JavaScript:',
            ),
            code: fetchRosary,
          }
        : undefined,
    },
    manners: { title: l('Using it well', 'Bom uso'), items: manners },
    sources: { title: l('Source', 'Código-fonte'), items: sources },
    shellLabel: l('Shell', 'Terminal'),
  }
}
