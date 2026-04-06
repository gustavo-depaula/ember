import type { ProperDay, ProperSection } from '../types'
import type { LiturgiaDiariaResponse } from './types'

const baseUrl = 'https://liturgia.up.railway.app/v2'

export async function fetchLiturgiaDiaria(date: Date): Promise<string> {
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const ano = String(date.getFullYear())

  const res = await fetch(`${baseUrl}/?dia=${dia}&mes=${mes}&ano=${ano}`)
  if (!res.ok) throw new Error(`Liturgia Diária API error: ${res.status}`)

  return res.text()
}

export function normalizeLiturgiaDiaria(raw: string): ProperDay {
  const data: LiturgiaDiariaResponse = JSON.parse(raw)
  const propers: ProperDay = {}

  if (data.oracoes?.coleta) {
    propers.collect = { text: data.oracoes.coleta }
  }
  if (data.oracoes?.oferendas) {
    propers['prayer-over-offerings'] = { text: data.oracoes.oferendas }
  }
  if (data.oracoes?.comunhao) {
    propers['prayer-after-communion'] = { text: data.oracoes.comunhao }
  }

  if (data.antifonas?.entrada) {
    propers['entrance-antiphon'] = { text: data.antifonas.entrada }
  }
  if (data.antifonas?.comunhao) {
    propers.communion = { text: data.antifonas.comunhao }
  }

  const first = data.leituras?.primeiraLeitura?.[0]
  if (first?.texto) {
    propers['first-reading'] = reading(first)
  }

  const psalm = data.leituras?.salmo?.[0]
  if (psalm?.texto) {
    const text = psalm.refrao ? `℟. ${psalm.refrao}\n\n${psalm.texto}` : psalm.texto
    propers['responsorial-psalm'] = { text, citation: psalm.referencia || undefined }
  }

  const second = data.leituras?.segundaLeitura?.[0]
  if (second?.texto) {
    propers['second-reading'] = reading(second)
  }

  const gospel = data.leituras?.evangelho?.[0]
  if (gospel?.texto) {
    propers.gospel = reading(gospel)
  }

  return propers
}

function reading(entry: { referencia: string; texto: string }): ProperSection {
  return { text: entry.texto, citation: entry.referencia || undefined }
}
