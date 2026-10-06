import type { Locale } from './locale'

// Chrome the app has no string for: navigation and page furniture that exist
// only on the web. Everything else is the app's own catalog (see `translator`).
const strings = {
  'en-US': {
    siteName: 'Ember',
    tagline: 'A companion for the Catholic life of prayer',
    description:
      'Pray the Rosary, the Mass and the Hours. Read the saints and the Catholic classics. Find Mass near you. Free and open source.',
    navToday: 'Today',
    navPrayers: 'Prayers',
    navMass: 'Mass',
    navOffice: 'Office',
    navBible: 'Bible',
    navLibrary: 'Library',
    navSaints: 'Saints',
    navCalendar: 'Calendar',
    navMassTimes: 'Mass Times',
    tabPray: 'Pray',
    search: 'Search',
    latin: 'Latin',
    latinOn: 'Show the Latin beside the text',
    latinOff: 'Hide the Latin',
    textSize: 'Text size',
    theme: 'Switch between light and dark',
    otherLanguage: 'Português',
    otherLanguageLabel: 'Ler em português',
    skip: 'Skip to the text',
    appOnlyBody:
      'This part is read from its publisher each day and is not reproduced here. It opens in the Ember app.',
    theApp: 'The Ember app',
    seeTheApp: 'See the app',
    railAppBody: 'Keep a plan of life, save your place and read offline.',
    nudgeBody: 'A plan of life, holy cards and your reading, kept on your phone.',
    dismiss: 'Close',
    footPray: 'Pray',
    footRead: 'Read',
    footLiturgy: 'Liturgy',
    footEmber: 'Ember',
    about: 'About',
    privacy: 'Privacy',
    source: 'Source code',
    footFine:
      'Ember is free and open source. Scripture is the Douay-Rheims Bible, in the public domain. The traditional Breviary and Missal are from Divinum Officium.',
    amdg: 'Ad maiorem Dei gloriam',
    minutes: '{{count}} min',
    day: 'Day {{n}}',
    days: 'The days',
    forms: 'Forms',
    aboutThisPrayer: 'About this prayer',
    history: 'History',
    howToPray: 'How to pray it',
    foundIn: 'Found in',
    previous: 'Previous',
    next: 'Next',
    contents: 'Contents',
    chapters_one: '{{count}} chapter',
    chapters_other: '{{count}} chapters',
    today: 'Today',
  },
  'pt-BR': {
    siteName: 'Ember',
    tagline: 'Um companheiro para a vida católica de oração',
    description:
      'Reze o Terço, a Missa e as Horas. Leia os santos e os clássicos católicos. Encontre a Missa perto de você. Gratuito e de código aberto.',
    navToday: 'Hoje',
    navPrayers: 'Orações',
    navMass: 'Missa',
    navOffice: 'Ofício',
    navBible: 'Bíblia',
    navLibrary: 'Biblioteca',
    navSaints: 'Santos',
    navCalendar: 'Calendário',
    navMassTimes: 'Horários de Missa',
    tabPray: 'Rezar',
    search: 'Buscar',
    latin: 'Latim',
    latinOn: 'Mostrar o latim ao lado do texto',
    latinOff: 'Ocultar o latim',
    textSize: 'Tamanho do texto',
    theme: 'Alternar entre claro e escuro',
    otherLanguage: 'English',
    otherLanguageLabel: 'Read in English',
    skip: 'Ir para o texto',
    appOnlyBody:
      'Esta parte é lida a cada dia de quem a publica e não é reproduzida aqui. Ela abre no aplicativo Ember.',
    theApp: 'O aplicativo Ember',
    seeTheApp: 'Conheça o aplicativo',
    railAppBody: 'Guarde um plano de vida, marque onde parou e leia sem conexão.',
    nudgeBody: 'Um plano de vida, santinhos e as suas leituras, guardados no seu celular.',
    dismiss: 'Fechar',
    footPray: 'Rezar',
    footRead: 'Ler',
    footLiturgy: 'Liturgia',
    footEmber: 'Ember',
    about: 'Sobre',
    privacy: 'Privacidade',
    source: 'Código-fonte',
    footFine:
      'O Ember é gratuito e de código aberto. A Escritura em inglês é a Bíblia Douay-Rheims, em domínio público. O Breviário e o Missal tradicionais vêm do Divinum Officium.',
    amdg: 'Ad maiorem Dei gloriam',
    minutes: '{{count}} min',
    day: 'Dia {{n}}',
    days: 'Os dias',
    forms: 'Formas',
    aboutThisPrayer: 'Sobre esta oração',
    history: 'História',
    howToPray: 'Como rezar',
    foundIn: 'Faz parte de',
    previous: 'Anterior',
    next: 'Próximo',
    contents: 'Sumário',
    chapters_one: '{{count}} capítulo',
    chapters_other: '{{count}} capítulos',
    today: 'Hoje',
  },
} as const

export type StringKey = keyof (typeof strings)['en-US']

export function siteStrings(locale: Locale) {
  const dict: Record<string, string> = strings[locale]
  return (key: StringKey | (string & {}), vars?: Record<string, string | number>): string => {
    const plural =
      typeof vars?.count === 'number'
        ? dict[`${key}_${vars.count === 1 ? 'one' : 'other'}`]
        : undefined
    const template = plural ?? dict[key] ?? key
    return template.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars?.[name] ?? ''))
  }
}
