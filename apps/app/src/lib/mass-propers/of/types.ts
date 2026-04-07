export type LiturgiaDiariaResponse = {
  data: string
  liturgia: string
  cor: string
  oracoes: {
    coleta: string
    oferendas: string
    comunhao: string
    extras: { titulo: string; texto: string }[]
  }
  leituras: {
    primeiraLeitura: { referencia: string; titulo: string; texto: string }[]
    salmo: { referencia: string; refrao: string; texto: string }[]
    segundaLeitura: { referencia: string; titulo: string; texto: string }[]
    evangelho: { referencia: string; titulo: string; texto: string }[]
    extras: { tipo: string; referencia: string; titulo: string; texto: string }[]
  }
  antifonas: {
    entrada: string
    comunhao: string
  }
}
