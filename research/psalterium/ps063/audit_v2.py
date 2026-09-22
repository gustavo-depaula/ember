import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
m = 'claude-opus-5-5 (fresh context)'
d['audit'] += [
 {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': m, 'note': 'Read with latin.json. 3 minor, no major; all three taken.', 'outcomes': [
  {'verse': '63:7', 'remark': '*de tanto* adds an intensive the ablative scrutínio does not state', 'outcome': 'taken', 'decision': 'scrutinio', 'reason': "*no seu sondar* taken instead of his *na sondagem* (heard as an opinion poll); his wording kept as an option"},
  {'verse': '63:7b', 'remark': 'accédet is to draw near; *chegará a* says arrival', 'outcome': 'taken', 'decision': 'accedet'},
  {'verse': '63:6b', 'remark': '*como* narrows ut to "how"; *que esconderiam*', 'outcome': 'taken', 'decision': 'narraverunt'}]},
 {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': m, 'note': '8 remarks in 7 verses; 5 taken, 2 refused and kept as options, 1 answered by the Latinist fix. Best line 63:7, worst 63:8.', 'outcomes': [
  {'verse': '63:3', 'remark': '*Protegestes-me* stiff; *Vós me protegestes*', 'outcome': 'taken', 'decision': 'protexisti'},
  {'verse': '63:4', 'remark': '*como uma espada* → *como espada*', 'outcome': 'taken'},
  {'verse': '63:6', 'remark': 'monosyllable close *má*; *perversa*', 'outcome': 'option', 'decision': 'nequam', 'reason': "*perverso* is pervérsus's word (17:27); an oxytone close is allowed"},
  {'verse': '63:6b', 'remark': '*Narraram* literary; *Contaram*', 'outcome': 'option', 'decision': 'narraverunt', 'reason': 'the narráre → narrar row (18:2, 21:23) repeats across psalms'},
  {'verse': '63:7b', 'remark': 'vowel pile-up *chegará a um*', 'outcome': 'taken', 'decision': 'accedet', 'reason': "answered by the Latinist's *se aproximará de*, not the stylist's *chegará até*"},
  {'verse': '63:8', 'remark': 'fronted predicate parsed backwards; *deles / eles* chime', 'outcome': 'taken', 'decision': 'plagae'},
  {'verse': '63:9', 'remark': '*os que os* stutters; *todos aqueles que os viam*', 'outcome': 'taken'},
  {'verse': '63:9', 'remark': 'clipped close; *e temeu todo homem*', 'outcome': 'taken'}]},
 {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': m, 'note': "Portuguese only. Heard rightly: 63:2, 63:4 (the blameless man, a Marian echo possible), 63:6, 63:7a, 63:9–11. Obscure: 63:7b (the Latin's own obscurity — kept) and 63:8 (fixed by the order change). Unknown words: *ajuntamento*, *imaculado* as a person, *sondar* as 'devise', *desfaleceram* — all kept as glossary words.", 'outcomes': [
  {'verse': '63:8', 'remark': 'Setas de pequeninos … unclear who is wounded', 'outcome': 'taken', 'decision': 'plagae'},
  {'verse': '63:3', 'remark': '*Protegestes-me* half heard as a plea', 'outcome': 'taken', 'decision': 'protexisti'},
  {'verse': '63:7b', 'remark': 'obscure; no clear reading', 'outcome': 'refused', 'reason': 'the Latin is obscure here too (DRB, Augustine); the psalm must not explain it'},
  {'verse': '63:6b', 'remark': '*laços* first suggests ties', 'outcome': 'refused', 'reason': 'the láqueus row (laço) across the psalter; context gives traps'},
  {'verse': '63:3', 'remark': '*ajuntamento* unknown', 'outcome': 'refused', 'decision': 'conventu', 'reason': 'the word of 15:4b; options kept'},
  {'verse': '63:7', 'remark': '*desfaleceram*, *sondar* unknown', 'outcome': 'refused', 'reason': 'glossary words (defícere, scrutári)'}]},
 {'step': 'revision', 'version': 2, 'note': 'v2: 63:3 *Vós me protegestes*; 63:4 *como espada*; 63:6b *Narraram que esconderiam*; 63:7 *no seu sondar*; 63:7b *se aproximará de*; 63:8 *As feridas deles tornaram-se setas de pequeninos*; 63:9 *todos aqueles que os viam … e temeu todo homem*. Script: revise_v2.py.'}]
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
