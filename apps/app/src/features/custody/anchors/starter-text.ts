import type { Anchor } from '../types'

// Phase B starter pool — six text anchors. Phase E expands to ~30 (see spec).
// Latin lines deliberately kept short so they fit the iOS shield subtitle
// character limit when rendered by Phase C.
export type TextAnchorSeed = {
  id: string
  text: { 'en-US': string; 'pt-BR': string; la?: string }
  attribution?: string
}

export const starterTextAnchors: TextAnchorSeed[] = [
  {
    id: 'custodi-linguam',
    text: {
      'en-US': 'Keep your tongue from evil, and your lips from speaking guile.',
      'pt-BR': 'Guarda a tua língua do mal e os teus lábios das palavras enganosas.',
      la: 'Custodi linguam tuam a malo, et labia tua ne loquantur dolum.',
    },
    attribution: 'Ps 33:14',
  },
  {
    id: 'quis-ascendet',
    text: {
      'en-US':
        'Who shall ascend the mountain of the Lord? He that hath clean hands and a pure heart.',
      'pt-BR': 'Quem subirá ao monte do Senhor? O que tem mãos inocentes e coração puro.',
      la: 'Quis ascendet in montem Domini?',
    },
    attribution: 'Ps 23:3',
  },
  {
    id: 'vigilate-et-orate',
    text: {
      'en-US': 'Watch and pray, that you enter not into temptation.',
      'pt-BR': 'Vigiai e orai, para que não entreis em tentação.',
      la: 'Vigilate et orate, ut non intretis in tentationem.',
    },
    attribution: 'Mt 26:41',
  },
  {
    id: 'increase-decrease',
    text: {
      'en-US': 'He must increase, but I must decrease.',
      'pt-BR': 'É necessário que Ele cresça, e eu diminua.',
      la: 'Illum oportet crescere, me autem minui.',
    },
    attribution: 'Jn 3:30',
  },
  {
    id: 'de-sales-eyes',
    text: {
      'en-US': 'Guard the eyes, for they are the windows through which sin first enters.',
      'pt-BR': 'Guardai os olhos, pois são as janelas pelas quais o pecado primeiro entra.',
    },
    attribution: 'St. Francis de Sales',
  },
  {
    id: 'bosco-body',
    text: {
      'en-US': 'The body is a temple of the Holy Spirit. Honor God with it.',
      'pt-BR': 'O corpo é templo do Espírito Santo. Honrai a Deus com ele.',
    },
    attribution: 'St. John Bosco',
  },
]
