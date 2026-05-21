// Pool of prayer/scripture messages shown on the iOS shield. The user does
// not pick these; one is selected deterministically from (commitmentId,
// day-of-year) so the same commitment shows a stable message on a given day
// and rotates across days. Keeps the spiritual surface curated and the
// editor simple.

export type ShieldMessage = {
  title: string
  body: string
}

export const SHIELD_MESSAGES: ShieldMessage[] = [
  {
    title: 'Vigilate et orate',
    body: 'Watch and pray, that ye enter not into temptation. — Matthew 26:41',
  },
  {
    title: 'Custodi oculos',
    body: 'Turn away mine eyes from beholding vanity, and quicken thou me in thy way. — Psalm 119:37',
  },
  {
    title: 'Cor mundum',
    body: 'Create in me a clean heart, O God; and renew a right spirit within me. — Psalm 51:10',
  },
  {
    title: 'Sicut cervus',
    body: 'As the hart panteth after the water brooks, so panteth my soul after thee, O God. — Psalm 42:1',
  },
  {
    title: 'Domine, ut videam',
    body: 'Lord, that I may see. — Luke 18:41',
  },
  {
    title: 'Be still',
    body: 'Be still, and know that I am God. — Psalm 46:10',
  },
  {
    title: 'In peace I will sleep',
    body: 'In peace I will lie down and sleep, for thou, Lord, only makest me dwell in safety. — Psalm 4:8',
  },
  {
    title: 'Soul of Christ',
    body: 'Soul of Christ, sanctify me. Body of Christ, save me. Within thy wounds hide me. Suffer me not to be separated from thee. — Anima Christi',
  },
  {
    title: 'Hail, holy Queen',
    body: 'To thee do we cry, poor banished children of Eve. Show unto us the blessed fruit of thy womb, Jesus. — Salve Regina',
  },
  {
    title: 'Non mea voluntas',
    body: 'Father, if thou be willing, remove this cup from me: nevertheless not my will, but thine, be done. — Luke 22:42',
  },
  {
    title: 'Kyrie eleison',
    body: 'Lord, have mercy. Christ, have mercy. Lord, have mercy.',
  },
  {
    title: 'Bread alone',
    body: 'Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God. — Matthew 4:4',
  },
  {
    title: 'A guard upon my mouth',
    body: 'Set a watch, O Lord, before my mouth; keep the door of my lips. — Psalm 141:3',
  },
  {
    title: 'Memento, homo',
    body: 'Remember, man, that thou art dust, and unto dust thou shalt return. — Genesis 3:19',
  },
  {
    title: 'Sub tuum praesidium',
    body: 'Beneath thy protection we seek refuge, holy Mother of God; despise not our petitions in our necessities.',
  },
  {
    title: 'Da mihi animas',
    body: 'Give me souls; take away the rest. — St. John Bosco',
  },
  {
    title: 'Adveniat regnum tuum',
    body: 'Thy kingdom come. Thy will be done, on earth as it is in heaven. — Matthew 6:10',
  },
  {
    title: 'Now is the time',
    body: 'Behold, now is the acceptable time; behold, now is the day of salvation. — 2 Corinthians 6:2',
  },
  {
    title: 'Custos quid de nocte?',
    body: 'Watchman, what of the night? Watchman, what of the night? — Isaiah 21:11',
  },
  {
    title: 'Take up and read',
    body: 'Tolle, lege — take up and read. — St. Augustine, Confessions 8.12',
  },
]

// Stable string hash (FNV-1a 32-bit). Used so the same commitmentId always
// hashes to the same starting offset; combined with day-of-year, the chosen
// message rotates daily but is deterministic given (id, date).
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

export function pickShieldMessage(commitmentId: string, date: Date = new Date()): ShieldMessage {
  const idx = (hash(commitmentId) + dayOfYear(date)) % SHIELD_MESSAGES.length
  return SHIELD_MESSAGES[idx]
}
