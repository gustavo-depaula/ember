// The lookup key for the Greek lexicons in content/bible/lexicon/: bare
// lowercase letters, so an enclitic's thrown-back accent, a grave for an
// acute, a capital or a homograph number still find the entry. Homographs
// (εἰμί "be", εἶμι "go") share a key; the caller ranks an exact lemma first.
// scripts/greek-bible/lexicon_key.py is the same algorithm; change both.
//
// Letter by letter rather than one `[\p{M}\P{L}]` class: Hermes matches a
// negated property escape inside a class wrongly, and every key came out
// empty on device while Node's tests passed.
export function lexiconKey(word: string) {
  return [...word.toLowerCase().normalize('NFD')]
    .filter((char) => /\p{L}/u.test(char))
    .join('')
    .replace(/ς/g, 'σ')
    .normalize('NFC')
}
