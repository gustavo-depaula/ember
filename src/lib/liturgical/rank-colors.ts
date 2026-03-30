import type { RankEF, RankOF } from './calendar-types'

export const rankColors: Record<RankOF | RankEF, string> = {
  solemnity: '#C9A84C',
  feast: '#FFFFFF',
  memorial: '#B088C8',
  optional_memorial: '#7AAF94',
  I_class: '#C9A84C',
  II_class: '#FFFFFF',
  III_class: '#B088C8',
  IV_class: '#7AAF94',
  commemoration: '#999',
  vigil: '#999',
}
