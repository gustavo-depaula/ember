// The books of the Bible as the two editions abbreviate them in a citation
// ("Rm 12,1-2" / "Rom 12, 1-2"), to one name.

const brazilian: Record<string, string> = {
  Gn: 'gen', Ex: 'ex', Lv: 'lev', Nm: 'num', Dt: 'deut', Js: 'jos', Jz: 'judg', Rt: 'ruth',
  '1Sm': '1sam', '2Sm': '2sam', '1Rs': '1kgs', '2Rs': '2kgs', '1Cr': '1chr', '2Cr': '2chr',
  Esd: 'ezra', Ne: 'neh', Tb: 'tob', Jt: 'jdt', Est: 'esth', '1Mc': '1macc', '2Mc': '2macc',
  Jó: 'job', Sl: 'ps', Pr: 'prov', Ecl: 'eccl', Ct: 'song', Sb: 'wis', Eclo: 'sir', Is: 'isa',
  Jr: 'jer', Lm: 'lam', Br: 'bar', Ez: 'ezek', Dn: 'dan', Os: 'hos', Jl: 'joel', Am: 'amos',
  Ab: 'obad', Jn: 'jonah', Mq: 'mic', Na: 'nah', Hab: 'hab', Sf: 'zeph', Ag: 'hag', Zc: 'zech',
  Ml: 'mal', Mt: 'matt', Mc: 'mark', Lc: 'luke', Jo: 'john', At: 'acts', Rm: 'rom',
  '1Cor': '1cor', '2Cor': '2cor', Gl: 'gal', Ef: 'eph', Fl: 'phil', Cl: 'col', '1Ts': '1thess',
  '2Ts': '2thess', '1Tm': '1tim', '2Tm': '2tim', Tt: 'titus', Fm: 'phlm', Hb: 'heb', Tg: 'jas',
  '1Pd': '1pet', '2Pd': '2pet', '1Jo': '1john', '2Jo': '2john', '3Jo': '3john', Jd: 'jude',
  Ap: 'rev',
}

const latin: Record<string, string> = {
  Gen: 'gen', Ex: 'ex', Lev: 'lev', Num: 'num', Deut: 'deut', Ios: 'jos', Iudc: 'judg',
  Ruth: 'ruth', '1Sam': '1sam', '2Sam': '2sam', '1Reg': '1kgs', '2Reg': '2kgs', '1Par': '1chr',
  '2Par': '2chr', Esd: 'ezra', Neh: 'neh', Tob: 'tob', Iudt: 'jdt', Idt: 'jdt', Est: 'esth',
  '1Mac': '1macc', '2Mac': '2macc', Iob: 'job', Ps: 'ps', Prov: 'prov', Eccle: 'eccl',
  Eccl: 'eccl', Cant: 'song', Sap: 'wis', Sir: 'sir', Is: 'isa', Ier: 'jer', Lam: 'lam',
  Bar: 'bar', Ez: 'ezek', Dan: 'dan', Os: 'hos', Ioel: 'joel', Am: 'amos', Abd: 'obad',
  Ion: 'jonah', Mic: 'mic', Mich: 'mic', Nah: 'nah', Hab: 'hab', Soph: 'zeph', Ag: 'hag',
  Agg: 'hag', Zac: 'zech', Zach: 'zech', Mal: 'mal', Mt: 'matt', Mc: 'mark', Lc: 'luke',
  Io: 'john', Act: 'acts', Rom: 'rom', '1Cor': '1cor', '2Cor': '2cor', Gal: 'gal', Eph: 'eph',
  Phil: 'phil', Col: 'col', '1Thess': '1thess', '2Thess': '2thess', '1Tim': '1tim',
  '2Tim': '2tim', Tit: 'titus', Philem: 'phlm', Hebr: 'heb', Iac: 'jas', '1Petr': '1pet',
  '2Petr': '2pet', '1Io': '1john', '2Io': '2john', '3Io': '3john', Iudae: 'jude', Ap: 'rev',
}

const opening = /^(?:Cf\.\s*)?(\d?\s?[A-Za-zÀ-ú]+)\s*(\d.*)$/

/** A citation as its book and numbers, or nothing where the book is not known. */
export function citation(text: string, edition: 'brazilian' | 'latin'): string | undefined {
  const match = opening.exec(text.trim())
  if (!match) return undefined
  const book = (edition === 'brazilian' ? brazilian : latin)[match[1].replace(/\s+/g, '')]
  const numbers = (match[2].replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2').match(/\d+/g) ?? []).join('.')
  return book && numbers ? `${book} ${numbers}` : undefined
}
