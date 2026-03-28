export type MassSection =
  | { type: 'heading'; id: string; text: string }
  | { type: 'subheading'; id: string; text: string }
  | { type: 'rubric'; text: string }
  | {
      type: 'prayer'
      id: string
      speaker: 'priest' | 'people' | 'all'
      latin: string
      english: string
    }
  | { type: 'proper'; id: string; slot: string; description: string }
  | { type: 'options'; id: string; label: string; options: MassOption[] }
  | { type: 'divider' }

export type MassOption = {
  id: string
  label: string
  sections: MassSection[]
}

export type MassForm = 'ordinary' | 'extraordinary'

type MassData = {
  id: string
  title: string
  subtitle: string
  sections: MassSection[]
}

const efData: MassData = require('@/assets/mass/extraordinary-form.json')
const ofData: MassData = require('@/assets/mass/ordinary-form.json')

export function getMassData(form: MassForm): MassData {
  return form === 'extraordinary' ? efData : ofData
}
