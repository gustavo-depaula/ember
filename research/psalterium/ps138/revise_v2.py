import json
p = '/Users/gustavo/Documents/prayer/.claude/worktrees/parallel-prancing-avalanche/research/psalterium/ps138/prayed.json'
d = json.load(open(p))
d['version'] = 2
v = d['verses']
v['138:10'] = v['138:10'].replace('e a vossa direita me {tenebit}.', 'e me {tenebit} a vossa direita.')
assert '{tenebit} a vossa direita' in v['138:10']
v['138:20'] = v['138:20'].replace('Porque vós dizeis', 'Porque dizeis')
assert v['138:20'].startswith('Porque dizeis')
dec = {x['id']: x for x in d['decisions']}

e = dec['exme']
e['why'] = ("*ex me* (ἐξ ἐμοῦ) renders the Hebrew comparative *mimmenni* ('too wonderful for me'), but a Latin reader can also hear "
            "'from me' or 'of me' — God's knowledge made wonderful from what he did in me (Augustine's reading). v1 ruled for MS1932's "
            "*acima de mim*, the comparison 6b supports; the v1 Latinist (minor) showed it closes what the Latin leaves open. v2 takes "
            "the preposition's own word, *de mim*: 'of me / from me' stays audible and 6b still says the knowledge is out of reach (D2). "
            "The colon is also in the Easter Introit; *o vosso saber* is the sciéntia row's word.")
de = {"label": "de mim", "forms": {"exme": "de mim"},
      "note": "v2, the v1 Latinist's fix: the preposition, the Latin's openness kept.", "from": "latinist"}
e['options'][0]['note'] = "v1; MS1932 *Maravilhosa acima de mim*. The comparison, as 6b supports; resolves the ambiguity."
e['options'].insert(0, de)

t = dec['tenebit']
t['why'] += (" v2: the second colon follows the Latin order (*et tenébit me déxtera tua → e me segurará a vossa direita*), "
             "which also breaks the v1 *guiará / segurará* rhyme at mediant and final (the v1 stylist).")

c = dec['conculcabunt']
c['options'].append({"label": "me pisem", "forms": {"conculcabunt": "me pisem"},
                     "note": "The v1 stylist: plainer, but leaves the conculcáre row and loses the *con-*.", "from": "stylist"})

tb = dec['terribiliter']
tb['options'][1]['note'] = ("The adverb; everyday 'awfully'. The v1 stylist asked for it in the Latin order "
                            "(*porque terrivelmente fostes engrandecido*).")

m = dec['mihi']
m['options'].append({"label": "Mas para mim, Deus, … os vossos amigos", "forms": {"mihi": "Mas para mim"},
                     "note": "The v1 stylist moved the vocative forward (*ó Deus*). Not taken: the bare *Deus* is house style, and the Apostles' Gradual lifts *Nimis honoráti sunt amíci tui, Deus* without *Mihi autem*, so the vocative has to stay in the colon's end.",
                     "from": "stylist"})

d['audit'].append({
  "step": "latinist",
  "model": "claude-opus-5-5 (fresh context, with latin.json)",
  "note": "No majors; two minors.",
  "outcomes": [
    "138:6 *ex me → acima de mim* resolves the Latin's ambiguity: taken, *de mim* (decision exme).",
    "138:15 *os meum* made plural: declined. Collective singular; *o meu osso* is heard as one bone, number is grammar (D2); kept as option.",
    "138:15 *substántia → o meu ser* too abstract: declined. D39 settles *o meu ser* and names 138:15."
  ]})
d['audit'].append({
  "step": "stylist",
  "model": "claude-opus-5-5 (fresh context, with latin.json)",
  "note": "Worst line 138:20, best 138:16.",
  "outcomes": [
    "138:5 drop the first *vós*: declined. The Latin's *tu … tu* is a repetition D2 keeps.",
    "138:10 *guiará / segurará* rhyme: taken, *e me segurará a vossa direita* (the Latin order).",
    "138:11 *me calquem aos pés → me pisem*: declined, conculcáre row (D44); kept as option.",
    "138:14 *de modo terrível → terrivelmente*: declined. The adverb is heard as 'awfully'; the option notes the request.",
    "138:17 vocative forward (*ó Deus*): declined. Bare *Deus* is house style, and the Apostles' Gradual lifts the colon without *Mihi autem*, so *Deus* stays at its end; kept as option.",
    "138:20 drop *vós*: taken, *Porque dizeis em pensamento* (the Latin has no pronoun), so the ear no longer hears God speaking."
  ]})
d['audit'].append({
  "step": "ambiguity",
  "model": "claude-opus-5-5 (fresh context)",
  "note": "Thirty-three items, mostly the Latin's own.",
  "outcomes": [
    "138:20 *vós* heard as God: fixed by the stylist's change (*Porque dizeis*). *as vossas cidades* stays God's cities (*civitátes tuas*) inside a plural address; the Latin is as obscure.",
    "138:1 *o meu ressurgir* heard as resurrection: intended; the verse is the Easter Introit.",
    "138:6 *acima de mim*: now *de mim* (Latinist).",
    "138:14 *terrível* heard as 'bad': kept, D43's word.",
    "Kept as the Latin's own obscurities: 138:3 *corda*, 138:4, 138:11b, 138:12 *suas*, 138:16 *todos* and *ninguém neles*, 138:17 *sua soberania*, 138:18 *Eu os contarei*, 138:19 the open conditional, 138:20b.",
    "Unknown words (*vereda, calquem, amparastes, matardes, definhava*) are all settled glossary rows; not changed."
  ]})
d['audit'].append({"step": "revision", "note": "v2: 138:6 *de mim*; 138:10 Latin order, rhyme broken; 138:20 *vós* dropped. prayed.v1.json keeps v1."})
json.dump(d, open(p, 'w'), ensure_ascii=False, indent=2)
open(p, 'a').write('\n')
