import liguoriLiturgicalMapFixture from '../../../../content/practices/meditacoes-ligorio/data/liturgical-map.json'
import liguoriFlowFixture from '../../../../content/practices/meditacoes-ligorio/flow.json'
import type { EngineContext, FlowContext } from '../engine'
import type { FlowDefinition, FlowSection } from '../types'

export { liguoriFlowFixture, liguoriLiturgicalMapFixture }

export function makeEngineContext(prose: Record<string, { 'pt-BR'?: string }> = {}): EngineContext {
  return {
    language: 'pt-BR',
    contentLanguage: 'pt-BR',
    localize: (text) => {
      if (typeof text === 'string') return { primary: text }
      return { primary: text['pt-BR'] ?? '' }
    },
    localizeUI: (text) => text['pt-BR'] ?? '',
    t: (key) => key,
    parsePsalmRef: () => ({ book: 'psalms', chapter: 1, numbering: 'hebrew' }) as never,
    parseTrackEntry: () => [],
    prayers: {},
    canticles: {},
    prose,
    contentSources: {
      bibleChapter: 'producer/bible-chapter',
      cccChapter: 'producer/ccc-chapter',
      psalmody: 'producer/psalmody',
    },
  }
}

export function makeContext(overrides: Partial<FlowContext> = {}): FlowContext {
  return { date: new Date('2026-04-12'), ...overrides }
}

export function flow(...sections: FlowSection[]): FlowDefinition {
  return { sections }
}

export function flowDef(
  def: Partial<FlowDefinition> & { sections: FlowSection[] },
): FlowDefinition {
  return def
}
