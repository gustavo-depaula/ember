// The book a reading is from, read off its announcement. The lectionary prints the book once, in
// the words the reader proclaims ("Proclamação do Evangelho de Jesus Cristo segundo Lucas"), and
// gives the margin only chapter and verse ("6, 12-19"): a citation lifted out of the page, as the
// Gospel of the day or a list of the day's readings, needs the book put back.
import type { Lang } from './types'

type Book = { match: RegExp; pt: string; en: string; numbered?: boolean }

// Order matters where one name holds another: the Apocalypse "de São João" before the letters
// of John, Ecclesiasticus before Ecclesiastes.
const books: Book[] = [
  { match: /\b(apocalipse|apocalypse|revelation)\b/, pt: 'Ap', en: 'Rev' },
  { match: /\b(atos|acts)\b/, pt: 'At', en: 'Acts' },
  { match: /\b(hebreus|hebrews)\b/, pt: 'Hb', en: 'Heb' },
  { match: /\b(romanos|romans)\b/, pt: 'Rm', en: 'Rom' },
  { match: /\b(corintios|corinthians)\b/, pt: 'Cor', en: 'Cor', numbered: true },
  { match: /\b(galatas|galatians)\b/, pt: 'Gl', en: 'Gal' },
  { match: /\b(efesios|ephesians)\b/, pt: 'Ef', en: 'Eph' },
  { match: /\b(filipenses|philippians)\b/, pt: 'Fl', en: 'Phil' },
  { match: /\b(colossenses|colossians)\b/, pt: 'Cl', en: 'Col' },
  { match: /\b(tessalonicenses|thessalonians)\b/, pt: 'Ts', en: 'Thess', numbered: true },
  { match: /\b(timoteo|timothy)\b/, pt: 'Tm', en: 'Tim', numbered: true },
  { match: /\b(tito|titus)\b/, pt: 'Tt', en: 'Ti' },
  { match: /\b(filemon|philemon)\b/, pt: 'Fm', en: 'Phlm' },
  { match: /\b(tiago|james)\b/, pt: 'Tg', en: 'Jas' },
  { match: /\b(pedro|peter)\b/, pt: 'Pd', en: 'Pet', numbered: true },
  { match: /\b(carta|epistola|letter)\b.*\b(joao|john)\b/, pt: 'Jo', en: 'Jn', numbered: true },
  { match: /\b(judas|jude)\b/, pt: 'Jd', en: 'Jude' },
  { match: /\b(mateus|matthew)\b/, pt: 'Mt', en: 'Mt' },
  { match: /\b(marcos|mark)\b/, pt: 'Mc', en: 'Mk' },
  { match: /\b(lucas|luke)\b/, pt: 'Lc', en: 'Lk' },
  { match: /\b(joao|john)\b/, pt: 'Jo', en: 'Jn' },
  { match: /\b(genesis)\b/, pt: 'Gn', en: 'Gn' },
  { match: /\b(exodo|exodus)\b/, pt: 'Ex', en: 'Ex' },
  { match: /\b(levitico|leviticus)\b/, pt: 'Lv', en: 'Lv' },
  { match: /\b(numeros|numbers)\b/, pt: 'Nm', en: 'Nm' },
  { match: /\b(deuteronomio|deuteronomy)\b/, pt: 'Dt', en: 'Dt' },
  { match: /\b(josue|joshua)\b/, pt: 'Js', en: 'Jos' },
  { match: /\b(juizes|judges)\b/, pt: 'Jz', en: 'Jgs' },
  { match: /\b(rute|ruth)\b/, pt: 'Rt', en: 'Ru' },
  { match: /\b(samuel)\b/, pt: 'Sm', en: 'Sam', numbered: true },
  { match: /\b(reis|kings)\b/, pt: 'Rs', en: 'Kgs', numbered: true },
  { match: /\b(cronicas|chronicles)\b/, pt: 'Cr', en: 'Chr', numbered: true },
  { match: /\b(esdras|ezra)\b/, pt: 'Esd', en: 'Ezr' },
  { match: /\b(neemias|nehemiah)\b/, pt: 'Ne', en: 'Neh' },
  { match: /\b(tobias|tobit)\b/, pt: 'Tb', en: 'Tb' },
  { match: /\b(judite|judith)\b/, pt: 'Jt', en: 'Jdt' },
  { match: /\b(ester|esther)\b/, pt: 'Est', en: 'Est' },
  { match: /\b(macabeus|maccabees)\b/, pt: 'Mc', en: 'Mc', numbered: true },
  { match: /\b(jo|job)\b/, pt: 'Jó', en: 'Jb' },
  { match: /\b(proverbios|proverbs)\b/, pt: 'Pr', en: 'Prv' },
  { match: /\b(eclesiastico|ecclesiasticus|sirach)\b/, pt: 'Eclo', en: 'Sir' },
  { match: /\b(eclesiastes|ecclesiastes)\b/, pt: 'Ecl', en: 'Eccl' },
  { match: /\b(canticos|songs)\b/, pt: 'Ct', en: 'Sg' },
  { match: /\b(sabedoria|wisdom)\b/, pt: 'Sb', en: 'Wis' },
  { match: /\b(isaias|isaiah)\b/, pt: 'Is', en: 'Is' },
  { match: /\b(jeremias|jeremiah)\b/, pt: 'Jr', en: 'Jer' },
  { match: /\b(lamentacoes|lamentations)\b/, pt: 'Lm', en: 'Lam' },
  { match: /\b(baruc|baruch)/, pt: 'Br', en: 'Bar' },
  { match: /\b(ezequiel|ezekiel)\b/, pt: 'Ez', en: 'Ez' },
  { match: /\b(daniel)\b/, pt: 'Dn', en: 'Dn' },
  { match: /\b(oseias|hosea)\b/, pt: 'Os', en: 'Hos' },
  { match: /\b(joel)\b/, pt: 'Jl', en: 'Jl' },
  { match: /\b(amos)\b/, pt: 'Am', en: 'Am' },
  { match: /\b(abdias|obadiah)\b/, pt: 'Ab', en: 'Ob' },
  { match: /\b(jonas|jonah)\b/, pt: 'Jn', en: 'Jon' },
  { match: /\b(miqueias|micah)\b/, pt: 'Mq', en: 'Mi' },
  { match: /\b(naum|nahum)\b/, pt: 'Na', en: 'Na' },
  { match: /\b(habacuc|habakkuk)\b/, pt: 'Hab', en: 'Hb' },
  { match: /\b(sofonias|zephaniah)\b/, pt: 'Sf', en: 'Zep' },
  { match: /\b(ageu|haggai)\b/, pt: 'Ag', en: 'Hg' },
  { match: /\b(zacarias|zechariah)\b/, pt: 'Zc', en: 'Zec' },
  { match: /\b(malaquias|malachi|malachia)\b/, pt: 'Ml', en: 'Mal' },
]

const ordinals: [RegExp, number][] = [
  [/\b(primeir[oa]|first)\b/, 1],
  [/\b(segund[oa]|second)\b/, 2],
  [/\b(terceir[oa]|third)\b/, 3],
]

/** The abbreviation a citation in `lang` names the announced book by, where it can tell. */
export function bookOf(announcement: string, lang: Lang): string | undefined {
  if (lang !== 'pt-BR' && lang !== 'en-US') return undefined
  const text = announcement.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  // A Gospel names its evangelist after "segundo"/"according to"; read only that far, so the
  // "Jesus Cristo" before it is not taken for a book.
  const gospel = /\b(segundo|according to)\b(.*)$/.exec(text)?.[2]
  const book = books.find((b) => b.match.test(gospel ?? text))
  if (!book) return undefined
  const name = lang === 'pt-BR' ? book.pt : book.en
  if (!book.numbered) return name
  const n = ordinals.find(([pattern]) => pattern.test(text))?.[1]
  // "Início da Segunda Carta de São João" says which; a letter that does not, the first.
  return lang === 'pt-BR' ? `${n ?? 1}${name}` : `${n ?? 1} ${name}`
}

/** A reading's citation with its book, as it reads out of context ("Lc 6, 12-19"). */
export function withBook(cite: string, announcement: string, lang: Lang): string {
  // "1Jo 2, 3" names its book already; "9b-10" (a one-chapter letter) does not.
  if (!/^\s*\d/.test(cite) || /^\s*[1-3]\s?[A-Za-zÀ-ÿ]+\s+\d/.test(cite)) return cite
  const book = bookOf(announcement, lang)
  return book ? `${book} ${cite.trim()}` : cite
}
