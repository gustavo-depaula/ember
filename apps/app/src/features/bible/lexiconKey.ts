// The lookup key for the Greek lexicons in content/bible/lexicon/: bare
// lowercase letters, so an enclitic's thrown-back accent, a grave for an
// acute, a capital or a homograph number still find the entry. Homographs
// (εἰμί "be", εἶμι "go") share a key; the caller ranks an exact lemma first.
// scripts/greek-bible/lexicon_key.py is the same algorithm; change both.
export function lexiconKey(word: string) {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\p{M}\P{L}]/gu, '')
    .replace(/ς/g, 'σ')
    .normalize('NFC')
}
