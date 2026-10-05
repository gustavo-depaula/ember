// A Latin aspiration for each day, turning through the list.
export const aspirations = [
  'Jesu, Jesu, Jesu.',
  'Cor Jesu, confidio in te.',
  'Deus meus et omnia.',
  'Omnia pro Iesu.',
  'Ad majorem Dei gloriam.',
  'Laus Deo semper.',
  'Jesu, mitis et humilis corde.',
  'Maria, refugium peccatorum.',
  'Jesu, Maria, Ioseph.',
  'Fiat voluntas tua.',
  'Sancte Michael, defende nos.',
  'Cor Mariae Immaculatum, ora pro nobis.',
  'Veni, Sancte Spiritus.',
  'Misericordias Domini in aeternum cantabo.',
  'Pax Christi.',
  'Domine Iesu, miserere mei.',
  'Dominus meus et Deus meus.',
  'In manus tuas, Domine.',
  'Sanctus, Sanctus, Sanctus.',
  'Sancta Maria, Mater Dei.',
  'Agnus Dei, miserere nobis.',
  'Dominus illuminatio mea.',
  'Maranatha.',
  'Jesu, spes mea.',
  'Magnificat anima mea Dominum.',
  'Ave crux, spes unica.',
  'Sitio.',
  'Cor Iesu, miserere nobis.',
  'Tota pulchra es, Maria.',
  'Benedictus Deus in saecula.',
] as const

export function aspirationFor(date: Date, offset = 0): string {
  const base = Math.floor(date.getTime() / 86400000) % aspirations.length
  return aspirations[(base + offset) % aspirations.length]
}
