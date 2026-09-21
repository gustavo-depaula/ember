"""Ps 36, stage one (36:1–36:20), draft 1. python3.13 research/psalterium/ps036/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '36:1': 'Não {aem1} dos malvados: * nem {zel} os que {fac1} a iniquidade.',
    '36:2': 'Porque, como o feno, depressa secarão: * e, como {olera}, logo cairão.',
    '36:3': 'Espera no Senhor, e {bonit}: * e habita a terra, e {pasc} nas suas riquezas.',
    '36:4': 'Deleita-te no Senhor: * e ele te dará as petições do teu coração.',
    '36:5': '{revela} ao Senhor o teu caminho, e espera nele: * e ele {faciet}.',
    '36:6': 'E {educet} a tua justiça como a luz, e o teu juízo como o meio-dia: * {subd} ao Senhor, e {ora}.',
    '36:7': 'Não {aem7} daquele que prospera no seu caminho: * do homem que {fac7} injustiças.',
    '36:8': '{desine} a ira, e abandona o furor: * não {aem8}, {malig8}.',
    '36:9': 'Porque os que {malig9} serão exterminados: * mas os que esperam pelo Senhor, {ipsi} {her9} a terra.',
    '36:10': '{pusillum}, e {nonerit}: * e buscarás o seu lugar, e não o encontrarás.',
    '36:11': 'Mas os mansos {her11} a terra: * e se deleitarão na {multit} da paz.',
    '36:12': 'O pecador {observ} o justo: * e rangerá contra ele os seus dentes.',
    '36:13': 'Mas o Senhor {irrid} dele: * porque {prosp} que virá o seu dia.',
    '36:14': 'Os pecadores desembainharam a espada: * armaram o seu arco,',
    '36:14b': 'Para {deic} o pobre e o {inops}: * para {truc} os retos de coração.',
    '36:15': 'Que a espada deles entre nos seus próprios corações: * e o arco deles seja quebrado.',
    '36:16': '{melius} o pouco para o justo, * do que as muitas riquezas dos pecadores.',
    '36:17': 'Porque os braços dos pecadores serão quebrados: * mas o Senhor {confirm} os justos.',
    '36:18': 'O Senhor conhece os dias dos imaculados: * e a herança deles será para sempre.',
    '36:19': 'Não serão envergonhados no tempo mau, e nos dias de fome serão saciados: * porque os pecadores perecerão.',
    '36:20': 'Os inimigos do Senhor, porém, logo que forem honrados e exaltados: * {defic}.',
}

dec('aemulari', ['36:1', '36:7', '36:8'], 'Noli æmulári in malignántibus … Noli æmulári in eo, qui prosperátur … noli æmulári ut malignéris', 'word',
    'æmulári three times, the psalm\'s opening command repeated (παραζήλου three times in the Greek). L&S: in the bad sense "to strive after or vie'
    ' with enviously, to be envious of, be jealous of". Douay-Rheims "Be not emulous of … Envy not … have no emulation"; Matos Soares 1932 "Não'
    ' invejes … Não invejes … não queiras ser émulo". One Portuguese wording three times, as the Latin repeats one verb (rule 6). "ter inveja de"'
    ' is the plain Brazilian phrase and lets 36:8, which has no object, stand as the Latin does ("não tenhas inveja, a ponto de …"). The cognate'
    ' "emular" is current only as "imitate to rival" (and computing); it keeps the Latin\'s word but loses the envy the psalm is about. The Hebrew\'s'
    ' "fret not" (DM1962 and modern Bibles: "não te irrites") is not the Latin\'s sense (rule 1). The antiphon of Tuesday Matins adapts 36:7'
    ' (Psalmi matutinum.txt: "Noli æmulári * in eo qui prosperátur et facit iniquitátem"; grep).',
    o('tenhas inveja ×3', {'aem1': 'tenhas inveja', 'aem7': 'tenhas inveja', 'aem8': 'tenhas inveja'}, 'Ruling: one phrase three times; L&S\'s bad sense.', 'draft'),
    o('invejes ×3', {'aem1': 'invejes', 'aem7': 'invejes', 'aem8': 'invejes'}, 'Matos Soares 1932\'s verb; then zeláre would need another word (36:1).', 'MS1932'),
    o('queiras rivalizar ×3', {'aem1': 'queiras rivalizar com', 'aem7': 'queiras rivalizar com', 'aem8': 'queiras rivalizar'},
      'The emulation (L&S\'s first sense, "vie with"); loses the envy.', 'draft'))

dec('zelare', ['36:1'], 'neque zeláveris faciéntes iniquitátem', 'word',
    'zeláre (ζηλόω), beside æmulári (παραζηλόω) in the same verse: the Greek pairs a compound and its simple verb of one root, the Latin two'
    ' different verbs. "nem invejes" answers "Não tenhas inveja" with the verb of the same root — the Greek\'s pairing, and two words for the'
    ' Latin\'s two. Only other place: 72:3 "Quia zelávi super iníquos" (grep) — should follow ("invejei"). "ter ciúme de" is the cognate'
    ' (ciúme < zelumen) but in Brazil is first a lover\'s jealousy; "ter zelo por" is devotion, the opposite sense. Douay-Rheims "nor envy";'
    ' Matos Soares 1932 "nem sejas émulo" (he gives æmulári\'s cognate to zeláre).',
    o('invejes', {'zel': 'invejes'}, 'Ruling: the verb of "inveja" (the Greek\'s simple beside its compound).', 'DRB'),
    o('tenhas ciúme d', {'zel': 'tenhas ciúme d'}, 'The cognate; heard as a lover\'s jealousy.', 'draft'),
    o('sejas émulo d', {'zel': 'sejas émulo d'}, 'Matos Soares 1932; bookish.', 'MS1932'))

dec('facere_iniq', ['36:1', '36:7'], 'faciéntes iniquitátem … in hómine faciénte injustítias', 'word',
    'fácere, twice: faciéntes iniquitátem (ποιοῦντας τὴν ἀνομίαν) and faciénte injustítias (ποιοῦντι παρανομίας). The glossary keeps "praticar a'
    ' iniquidade" for operári iniquitátem (5:7a, 6:9; ἐργάζομαι), a different Latin and Greek verb; so fácere keeps its own plain verb, "fazer".'
    ' Matos Soares 1932 "praticam … comete"; Douay-Rheims "work … doth".',
    o('fazem … faz', {'fac1': 'fazem', 'fac7': 'faz'}, 'Ruling: fácere\'s own verb.', 'draft'),
    o('praticam … pratica', {'fac1': 'praticam', 'fac7': 'pratica'}, 'operári\'s verb (glossary); the more usual collocation.', 'MS1932'))

dec('olera', ['36:2'], 'et quemádmodum ólera herbárum cito décident', 'word',
    'ólera herbárum (λάχανα χλόης): "greens of the grass" — ólus is a green, a pot-herb. Douay-Rheims "the green herbs"; Matos Soares 1932 "as tenras'
    ' hastes das plantas" (explains). "as ervas verdes" keeps both nouns\' matter (the herb and its greenness) in one phrase; "as verduras das ervas"'
    ' keeps both nouns and is clumsy. décidere → cair (the glossary\'s literal sense, 89:6 véspere décidat): withered plants "fall".',
    o('as ervas verdes', {'olera': 'as ervas verdes'}, 'Ruling: Douay-Rheims.', 'DRB'),
    o('as verduras das ervas', {'olera': 'as verduras das ervas'}, 'Both nouns kept; clumsy.', 'draft'),
    o('as hortaliças', {'olera': 'as hortaliças'}, 'ólus alone; loses herbárum.', 'draft'))

dec('bonitatem', ['36:3'], 'Spera in Dómino, et fac bonitátem', 'glossary',
    'fac bonitátem (ποίει χρηστότητα) — not "fac bonum", which 36:27 has ("Declína a malo, et fac bonum", copied from 33:15 "faz o bem"): the two'
    ' must differ. The glossary\'s bónitas row has "bonitátem fácere cum → usar de bondade com" (118:65); here without a person, "usa de bondade".'
    ' Douay-Rheims "do good" and Matos Soares 1932 "faze obras boas" merge it with 36:27.',
    o('usa de bondade', {'bonit': 'usa de bondade'}, 'Ruling: the bónitas row; apart from 36:27 "faz o bem".', 'glossary'),
    o('faz o bem', {'bonit': 'faz o bem'}, 'Douay-Rheims; the same words as 36:27.', 'DRB'),
    o('pratica a bondade', {'bonit': 'pratica a bondade'}, 'The noun kept; praticar is operári\'s.', 'draft'))

dec('pasceris', ['36:3'], 'et pascéris in divítiis ejus', 'word',
    'pascéris, future passive of páscere, "to feed, pasture" (ποιμανθήσῃ, "you will be shepherded"). "serás apascentado" keeps the shepherd\'s verb'
    ' and the passive; Douay-Rheims "thou shalt be fed"; Matos Soares 1932 "te sustentarás" (active, another verb). The Hebrew\'s "feed on'
    ' faithfulness" is not the Latin\'s (rule 1).',
    o('serás apascentado', {'pasc': 'serás apascentado'}, 'Ruling: the pastoral verb, passive.', 'draft'),
    o('serás alimentado', {'pasc': 'serás alimentado'}, 'Douay-Rheims "fed"; plainer, loses the pasture.', 'DRB'))

dec('revela', ['36:5'], 'Revéla Dómino viam tuam', 'word',
    'reveláre (ἀποκάλυψον): uncover, disclose — the Latin\'s and the Greek\'s image, the way laid open before the Lord. Douay-Rheims "Commit" and'
    ' modern Bibles follow the Hebrew ("roll onto"); Matos Soares 1932 "Expõe". The glossary has "desvendar" for reveláre with eyes (118:18) and'
    ' "desnudar" for woods (28:9); with a way to disclose, "revelar" is plain. The cost: it can be heard as telling God what he does not know —'
    ' which the Latin also allows. The monastic Matins antiphon sings "Revéla * Dómino viam meam" and the Mass of 01-31 the verse (grep).',
    o('Revela', {'revela': 'Revela'}, 'Ruling: the Latin\'s verb.', 'draft'),
    o('Descobre', {'revela': 'Descobre'}, 'uncover; heard first as "find".', 'draft'),
    o('Expõe', {'revela': 'Expõe'}, 'Matos Soares 1932.', 'MS1932'),
    o('Entrega', {'revela': 'Entrega'}, 'The Hebrew\'s sense (Douay-Rheims "Commit"): refused, rule 1.', 'draft'))

dec('faciet', ['36:5'], 'et ipse fáciet', 'grammar',
    '"et ipse fáciet" has no object (καὶ αὐτὸς ποιήσει): "and he himself will do (it)". The pronoun "ele" says ipse; an object "o" would supply what'
    ' the Latin leaves open (Douay-Rheims "he will do it"). Matos Soares 1932 "e ele procederá" changes the verb.',
    o('fará', {'faciet': 'fará'}, 'Ruling: no object, as the Latin.', 'draft'),
    o('o fará', {'faciet': 'o fará'}, 'Douay-Rheims: the object supplied.', 'DRB'),
    o('mesmo agirá', {'faciet': 'mesmo agirá'}, 'ipse heard; another verb.', 'draft'))

dec('educet', ['36:6'], 'Et edúcet quasi lumen justítiam tuam', 'glossary',
    'edúcere → fazer sair (glossary; 17:20 "E me fez sair para a amplidão"): ἐξοίσει, "will bring forth". "fará sair a tua justiça como a luz" — the'
    ' justice brought out into the open as light comes out; Douay-Rheims "he will bring forth thy justice as the light". Matos Soares 1932 "fará'
    ' brilhar" gives the effect, not the verb. The natural order puts the object before the comparison.',
    o('fará sair', {'educet': 'fará sair'}, 'Ruling: the glossary\'s verb.', 'glossary'),
    o('fará brilhar', {'educet': 'fará brilhar'}, 'Matos Soares 1932: the effect, not the verb.', 'MS1932'))

dec('subditus', ['36:6'], 'súbditus esto Dómino, et ora eum', 'word',
    'súbditus esto: "be subject" — a state, in the imperative (the Greek ὑποτάγηθι is a passive aorist). subdere shares "sujeitar" with subjícere in'
    ' the glossary (17:48 "sujeitais os povos"; one Greek verb, ὑποτάσσω). "sê sujeito" keeps the state and the passive; "sujeita-te" makes it'
    ' an act (the middle); "sê submisso" is plainer and leaves the family. Matos Soares 1932 "Sê obediente". In DO the colon closes 36:6 (the'
    ' Clementine prints it at the head of v. 7).',
    o('sê sujeito', {'subd': 'sê sujeito'}, 'Ruling: the state, the family of sujeitar.', 'draft'),
    o('sujeita-te', {'subd': 'sujeita-te'}, 'The act (middle voice).', 'draft'),
    o('sê submisso', {'subd': 'sê submisso'}, 'Plainer; another root.', 'draft'))

dec('ora', ['36:6'], 'et ora eum', 'word',
    'oráre → orar (glossary: orátio / oráre, 5:3–4), here with the person as object (ἱκέτευσον αὐτόν, "entreat him"). "ora a ele" keeps the'
    ' psalter\'s verb of prayer; Matos Soares 1932 "roga-lhe" is rogáre\'s; "suplica-lhe" is deprecári\'s (D35).',
    o('ora a ele', {'ora': 'ora a ele'}, 'Ruling: oráre\'s verb.', 'glossary'),
    o('roga-lhe', {'ora': 'roga-lhe'}, 'Matos Soares 1932; rogáre\'s verb.', 'MS1932'))

dec('desine', ['36:8'], 'Désine ab ira, et derelínque furórem', 'word',
    'désinere ab (παῦσαι ἀπό): "cease from". derelínquere → abandonar (glossary; this psalm has it four more times, 36:25, 28, 33). "Deixa a ira"'
    ' is the plainest "leave off"; "Desiste da ira" keeps the "from"; Douay-Rheims "Cease from anger"; Matos Soares 1932 "Guarda-te da ira" is'
    ' another sense. ira / furor → ira / furor (glossary).',
    o('Deixa', {'desine': 'Deixa'}, 'Ruling: plain.', 'draft'),
    o('Desiste d', {'desine': 'Desiste d'}, 'ab heard.', 'draft'),
    o('Cessa', {'desine': 'Cessa'}, 'Douay-Rheims "Cease".', 'DRB'))

dec('malignari', ['36:8', '36:9'], 'noli æmulári ut malignéris. Quóniam qui malignántur, exterminabúntur', 'word',
    'malignári, the verb, twice in two lines (πονηρεύεσθαι / οἱ πονηρευόμενοι): "to do evil". The glossary settles the participle as a noun →'
    ' "malvados" (D24; 36:1 malignántibus) and leaves the verb open. One wording for both: "fazer o mal". ut + subjunctive after "Noli æmulári"'
    ' is consecutive (ὥστε): "a ponto de fazeres o mal"; Douay-Rheims "have no emulation to do evil", Matos Soares 1932 "não queiras ser émulo em'
    ' fazer mal". exterminári → exterminar (the cognate; the glossary uses the word for dispérdere, which does not meet it here).',
    o('a ponto de fazeres o mal … fazem o mal', {'malig8': 'a ponto de fazeres o mal', 'malig9': 'fazem o mal'}, 'Ruling: consecutive, one verb twice.', 'draft'),
    o('para fazeres o mal … fazem o mal', {'malig8': 'para fazeres o mal', 'malig9': 'fazem o mal'}, 'A purpose clause; ut is consecutive here.', 'draft'),
    o('para não fazeres o mal … fazem o mal', {'malig8': 'para não fazeres o mal', 'malig9': 'fazem o mal'}, 'Reads the negation onto the clause; changes the sense.', 'draft'))

dec('ipsi', ['36:9'], 'sustinéntes autem Dóminum, ipsi hereditábunt terram', 'grammar',
    'ipsi resumes the hanging participle (αὐτοί): "those who wait for the Lord — they shall inherit". Matos Soares 1932 "esses herdarão"; the resumptive'
    ' pronoun is the Latin\'s emphasis. sustinére → esperar por (D36).',
    o('esses', {'ipsi': 'esses'}, 'Ruling: Matos Soares 1932.', 'MS1932'),
    o('eles', {'ipsi': 'eles'}, 'Plainer; weaker.', 'draft'))

dec('hereditare', ['36:9', '36:11'], 'ipsi hereditábunt terram … Mansuéti autem hereditábunt terram', 'glossary',
    'hereditáre terram (κληρονομήσουσιν γῆν), the psalm\'s refrain: 36:9, 11, 22, 29, and the noun in 36:34 (hereditáte cápias terram); 24:13 already'
    ' has "herdará a terra" (grep: hereditáre 6 lines). One wording every time. "a terra" keeps the Latin\'s openness between the land and the earth.'
    ' 36:11 is the verse of the Beatitude: Mt 5:4 in the Clementine reads "Beati mites: quoniam ipsi possidebunt terram" (fetched,'
    ' consult/bolls-VULG-40-5.json) — another Latin wording of the same Greek (κληρονομήσουσιν τὴν γῆν, Tischendorf, consult/bolls-TISCH-40-5.json);'
    ' the psalm keeps its own verb.',
    o('herdarão', {'her9': 'herdarão', 'her11': 'herdarão'}, 'Ruling: the Latin\'s verb (24:13).', 'glossary'),
    o('possuirão', {'her9': 'possuirão', 'her11': 'possuirão'}, 'Mt 5:4\'s Clementine verb; not this Latin.', 'draft'))

dec('pusillum', ['36:10'], 'Et adhuc pusíllum, et non erit peccátor', 'grammar',
    '"Et adhuc pusíllum" (καὶ ἔτι ὀλίγον): "and yet a little (while)". "E ainda um pouco" keeps the Latin\'s words (Matos Soares 1932 "Ainda um'
    ' pouco"); "Mais um pouco" is the everyday idiom.',
    o('E ainda um pouco', {'pusillum': 'E ainda um pouco'}, 'Ruling: the Latin\'s words.', 'MS1932'),
    o('Mais um pouco', {'pusillum': 'Mais um pouco'}, 'The idiom.', 'draft'))

dec('nonerit', ['36:10'], 'et non erit peccátor', 'grammar',
    '"non erit peccátor": "the sinner will not be". The next colon asks for "his place", so the sinner is one man, not sinners in general: "o pecador'
    ' não existirá" (Matos Soares 1932 "não mais existirá o pecador"). "não haverá pecador" is heard as "there will be no sinners".',
    o('o pecador não existirá', {'nonerit': 'o pecador não existirá'}, 'Ruling: the one sinner whose place is sought.', 'MS1932'),
    o('não haverá pecador', {'nonerit': 'não haverá pecador'}, 'Generic.', 'draft'))

dec('multitudo', ['36:11'], 'et delectabúntur in multitúdine pacis', 'glossary',
    'multitúdo → multidão (glossary, open; the row names 36:11). Odd with an abstract, as the Latin is (ἐπὶ πλήθει εἰρήνης); Douay-Rheims "abundance",'
    ' Matos Soares 1932 "abundância" — abundántia\'s word (71:7 abundántia pacis, grep), which would merge the two Latin phrases.',
    o('multidão', {'multit': 'multidão'}, 'Ruling: the row.', 'glossary'),
    o('abundância', {'multit': 'abundância'}, 'Douay-Rheims, Matos Soares 1932; abundántia\'s word (71:7).', 'MS1932'))

dec('observabit', ['36:12'], 'Observábit peccátor justum', 'word',
    'observáre (παρατηρήσεται, watch closely, lie in wait). 36:32 "Consíderat peccátor justum" says the same with another Latin and Greek verb'
    ' (κατανοεῖ), and the glossary gives consideráre with a person "observar" (21:18); observáre is also "observar" for vanities (30:7). "espreitar"'
    ' (watch unseen, waiting) keeps the two verbs of the psalm apart and says the Greek\'s hostile watching; Matos Soares 1932 and Douay-Rheims'
    ' "observará / shall watch".',
    o('espreitará', {'observ': 'espreitará'}, 'Ruling: apart from 36:32 "observa".', 'draft'),
    o('observará', {'observ': 'observará'}, 'Matos Soares 1932; the cognate; merges with 36:32.', 'MS1932'))

dec('irridebit', ['36:13'], 'Dóminus autem irridébit eum', 'glossary',
    'irridére → rir de (glossary, 2:4 "O que habita nos céus rir-se-á deles" family; ἐκγελάσεται). Matos Soares 1932 "zombará" is subsannáre\'s word'
    ' (glossary).',
    o('rirá', {'irrid': 'rirá'}, 'Ruling: the row.', 'glossary'),
    o('zombará', {'irrid': 'zombará'}, 'Matos Soares 1932; subsannáre\'s verb.', 'MS1932'))

dec('prospicit', ['36:13'], 'quóniam próspicit quod véniet dies ejus', 'word',
    'prospícere (προβλέπει, "foresees"); the glossary\'s row (13:2) gives "olhar" and names this verse as another sense: "sees ahead". "prevê" is'
    ' the plain verb of foresight (though of pro-vidére\'s root: providére only at 15:8, "ver", so nothing collides); Douay-Rheims "foreseeth";'
    ' Matos Soares 1932 "vê".',
    o('prevê', {'prosp': 'prevê'}, 'Ruling: foresight, as the Greek.', 'DRB'),
    o('vê de longe', {'prosp': 'vê de longe'}, 'The pro- as distance.', 'draft'),
    o('vê', {'prosp': 'vê'}, 'Matos Soares 1932; loses the pro-.', 'MS1932'))

dec('deiciant', ['36:14b'], 'Ut deíciant páuperem et ínopem', 'word',
    'deícere (καταβαλεῖν), "throw down". "derrubar" would be the word, but it is supplantáre\'s in the glossary (17:40) and 36:31 has'
    ' supplantabúntur. "abater" (strike down) is free; Douay-Rheims "To cast down"; Matos Soares 1932 "arruinarem" (ruin).',
    o('abater', {'deic': 'abater'}, 'Ruling: free; apart from supplantáre (36:31).', 'draft'),
    o('lançar por terra', {'deic': 'lançar por terra'}, 'The image; lançar is proícere\'s.', 'draft'),
    o('derrubar', {'deic': 'derrubar'}, 'supplantáre\'s word.', 'draft'))

dec('inops', ['36:14b'], 'páuperem et ínopem', 'glossary',
    'pauper et inops → "o pobre e o indigente" (the inops row, open: "indigente" was unknown to the blind reader three times — Pss 11, 13 — and'
    ' "desvalido" (MS1932 in Ps 11) is the candidate named there). Kept with the row so that the evidence accumulates in one place; the pair is'
    ' the Latin\'s (Matos Soares 1932 "o pobre e o indigente" here).',
    o('indigente', {'inops': 'indigente'}, 'Ruling: the row.', 'glossary'),
    o('desvalido', {'inops': 'desvalido'}, 'The row\'s named fall-back.', 'MS1932'))

dec('trucident', ['36:14b'], 'ut trucídent rectos corde', 'word',
    'trucidáre (σφάξαι, slaughter): the cognate "trucidar" is current (the news\'s word for a massacre) and keeps the violence; "matar" is flat;'
    ' "degolar" is σφάζω\'s image but not the Latin\'s. Matos Soares 1932 "assassinarem".',
    o('trucidar', {'truc': 'trucidar'}, 'Ruling: the cognate, current.', 'draft'),
    o('degolar', {'truc': 'degolar'}, 'The Greek\'s throat-cutting.', 'draft'),
    o('matar', {'truc': 'matar'}, 'Flat.', 'DRB'))

dec('melius', ['36:16'], 'Mélius est módicum justo', 'order',
    '"Mélius est … super": the comparative with super, "better … than" (κρεῖσσον … ὑπέρ). The Latin\'s order ("Melhor é") keeps the verse opening'
    ' on the comparison, as the Latin; "Mais vale" (Matos Soares 1932) is the idiom.',
    o('Melhor é', {'melius': 'Melhor é'}, 'Ruling: the Latin\'s order.', 'draft'),
    o('Mais vale', {'melius': 'Mais vale'}, 'Matos Soares 1932.', 'MS1932'))

dec('confirmat', ['36:17'], 'confírmat autem justos Dóminus', 'glossary',
    'confirmáre → confirmar (glossary, open; options fortalecer, firmar). ὑποστηρίζει, "props up". "confirma os justos" keeps the Latin\'s word; it'
    ' may be heard as the sacrament or as "verifies" — a test for the readers. "fortalece" (Matos Soares 1932, Douay-Rheims "strengtheneth") is'
    ' confortári\'s in the glossary (9:20, 26:14). The Tuesday Matins antiphon sings the verse ("Brácchia peccatórum * conteréntur, confírmat autem'
    ' justos Dóminus", grep).',
    o('confirma', {'confirm': 'confirma'}, 'Ruling: the row.', 'glossary'),
    o('fortalece', {'confirm': 'fortalece'}, 'Matos Soares 1932; confortári\'s word.', 'MS1932'),
    o('sustenta', {'confirm': 'sustenta'}, 'The Greek\'s prop; free.', 'draft'))

dec('deficientes', ['36:20'], 'deficiéntes, quemádmodum fumus defícient', 'glossary',
    'The participle + finite verb of one root (ἐκλιπόντες … ἐξέλιπον): the glossary row gives gerund + verb and never drops the repetition (117:11,'
    ' 117:18). defícere → desfalecer (glossary). The row warns that "desfalecer" fails with a person meaning "is gone" (11:2); here it is failing and'
    ' fading, as smoke thins — the sense 17:38 kept ("até que desfaleçam"). 101:4 "defecérunt sicut fumus dies mei" should agree. Douay-Rheims "shall'
    ' come to nothing and vanish like smoke"; Matos Soares 1932 "cairão e se desvanecerão como o fumo" — both drop the repetition. fumus → fumaça'
    ' (glossary).',
    o('desfalecendo, como a fumaça desfalecerão', {'defic': 'desfalecendo, como a fumaça desfalecerão'}, 'Ruling: the row, one root twice.', 'glossary'),
    o('desaparecendo, como a fumaça desaparecerão', {'defic': 'desaparecendo, como a fumaça desaparecerão'}, 'The vanishing, plain; leaves the row.', 'draft'),
    o('desfalecerão e se desvanecerão como a fumaça', {'defic': 'desfalecerão e se desvanecerão como a fumaça'}, 'Two verbs, as Matos Soares 1932; drops the repetition.', 'MS1932'))

choices = {
    '36:1': 'malignántes → malvados (D24). iníquitas → iniquidade.',
    '36:2': 'velóciter → depressa (glossary), cito → logo; aréscere → secar (21:16 secou-se); décidere → cair. The two futures at mediant and final (secarão / cairão) rhyme, as the Latin\'s do (aréscent / décident); accepted as the Latin\'s own echo. fænum → feno.',
    '36:3': 'speráre in → esperar em; inhabitáre with an object → habitar (transitive, as the Latin; 36:27 and 36:29 have it without). divítiæ → riquezas.',
    '36:4': 'delectári in → deleitar-se em (κατατρύφησον; 36:11 has the same verb, delectabúntur, κατατρυφήσουσιν — one verb both times; 103:34 "delectábor in Dómino" should agree). petítio → petição (19:7a "todas as tuas petições"; the postulátio row leaves "petição" to petítio). "ele" supplied. The versicle "V. Delectáre in Dómino. R. Et dabit tibi petitiónes cordis tui" (Psalmi matutinum.txt, grep) — each half stands alone.',
    '36:6': 'lumen → luz; judícium → juízo (glossary; Matos Soares 1932 "o direito da tua causa" explains); merídies → meio-dia. The first half has two cola joined by "et" and no flex in DO: kept as one colon.',
    '36:7': 'prosperári → prosperar (glossary). injustítia → injustiça (glossary; the plural kept).',
    '36:9': 'exterminári → ser exterminado (the cognate; ἐξολεθρευθήσονται). The Greek verb returns behind 36:22 disperíbunt, 36:28b períbit, 36:34 períerint and 36:38 disperíbunt / interíbunt, where the Latin varies; stage two decides.',
    '36:10': 'quǽrere → buscar; invenire → encontrar (36:36 "non est invéntus locus ejus" should repeat it).',
    '36:11': 'mansuétus → manso (glossary; πραεῖς).',
    '36:12': 'strídere super eum déntibus suis → "rangerá contra ele os seus dentes" (Portuguese grinds the teeth as an object; the Latin\'s order of "contra ele" before the teeth kept).',
    '36:13': 'dies ejus → "o seu dia" (the sinner\'s day, as the Latin leaves it).',
    '36:14': 'gládius → espada (glossary: frámea and gládius share it; they never meet). evagináre → desembainhar. inténdere arcum → armar o arco (glossary, 10:3; here with the Latin\'s "suum"). The natural order for the Latin\'s fronted object. The comma at the end is DO\'s: the sentence runs on into 36:14b.',
    '36:14b': 'rectus corde → reto de coração (glossary). ut … ut → "Para … para" (infinitives; the subject is the sinners of 36:14).',
    '36:15': 'The jussive intret / confringátur → "Que … entre … e … seja quebrado" (26:14 build "e que o teu coração se fortaleça"). eórum … ipsórum → "deles … seus próprios" (their own hearts). corda plural → corações. confríngere → quebrar (glossary).',
    '36:16': 'módicum → o pouco; super divítias … multas → "do que as muitas riquezas" (the super of comparison, glossary "mais que").',
    '36:17': 'brácchia → braços; contérere → quebrar (glossary: one Greek verb with confríngere, συντρίβω, 36:15 and 36:17 — so one Portuguese verb, as the Greek).',
    '36:18': 'novit → conhece (glossary); immaculátus → imaculado (glossary). The Latin\'s "dies" followed (the Greek has ὁδούς, "ways"). in ætérnum → para sempre (D23).',
    '36:19': 'confúndi → ser envergonhado (D15); tempus malum → tempo mau; saturáre → saciar (glossary, passive); períre → perecer. No flex in DO: the first half is one colon.',
    '36:20': 'vero → "porém", after the subject. mox ut → "logo que"; honorificáre → honrar (honor → honra); exaltáre → exaltar.',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm36.txt: 42 prayed verses 36:1–36:40 with DO\'s own ids 36:14b and 36:28b (no titulus line in DO; the Clementine\'s "Psalmus ipsi David" is not in the file, D7). DO\'s 36:6 carries the Clementine\'s 7a ("Súbditus esto Dómino, et ora eum"). Clementine (Bolls VULG, fetched to consult/bolls-VULG-19-36.json): identical wording. Alphabetic in Hebrew; nothing reproduced. Not in the Diurnal Monástico. Worked in two stages in one folder, as Pss 9 and 17 were: 36:1–36:20 first (21 prayed verses), then 36:21–36:40 (21). Why there: it halves the psalm exactly, and the Hebrew verse 21 opens with lamed, the twelfth letter, which begins the second half of the alphabet (WLC in consult/parallels/ps036.md). While partial, prayed.json and literal.json carry "range"; ps036/partial.py (from ps017/partial.py) stands in for checks.py; ps036/part.py builds the critics\' sub-folder for stage two. Uses checked by grep (ps032/uses.py): Tuesday Matins takes the psalm in three sections, 36(1-15), 36(16-29), 36(30-40), with the antiphons "Noli æmulári * in eo qui prosperátur et facit iniquitátem" (adapts 36:7), "Brácchia peccatórum * conteréntur, confírmat autem justos Dóminus" (36:17), "Custódi innocéntiam * et vide æquitátem" (36:37) and the versicle "V. Exspécta Dóminum, et custódi viam ejus. R. Exaltábit te, ut hereditáte cápias terram" (36:34) — Psalmi matutinum.txt [Day2]; the monastic scheme ([Daym1_]) has "Revéla * Dómino viam meam" and "V. Delectáre in Dómino. R. Et dabit tibi petitiónes cordis tui"; 36:30–31 are versicles and a Gradual of confessors (Commune/C4a, C5; Mass 06-14, 06-28 …); 36:1 and 36:39 in Commune/C3a-1; 36:23 and 36:37 in the Mass of 06-28; 36:4–5 an Alleluia (01-31). Mt 5:4 (Clementine, fetched) "Beati mites: quoniam ipsi possidebunt terram" — another Latin wording of 36:11a; the Greek (Tischendorf, fetched) is the LXX\'s κληρονομήσουσιν τὴν γῆν.'},
    {'step': 'draft', 'note': 'Stage one (36:1–36:20), draft 1, from consult/parallels/ps036.md (LXX Rahlfs, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counted with ps005/grep_latin.py: æmulári 3 lines here + 77:58 (the noun); zeláre 36:1, 72:3; exterminári 36:9, 79:14; malignári 36:8–9, 104:15; hereditáre 6 lines (24:13, 81:8, four here); aréscere 36:2, 89:6; relíquiæ 16:14c, 75:11, 36:37–38; fænum 11 lines; próspicit, trucidáre, evagináre, strídere, collídere, mutuári, superexaltáre only here. Glossary applied: D15, D23, D24 (malvados), D36 (esperar por), velóciter → depressa, delectári → deleitar-se, petítio → petição, edúcere → fazer sair, prosperári, ira / furor, derelínquere → abandonar, exterminar, quǽrere → buscar, mansuétus → manso, multitúdo → multidão, irridére → rir de, gládius → espada, inténdere arcum → armar o arco, pauper / inops → pobre / indigente, rectus corde, confríngere / contérere → quebrar, confirmáre → confirmar, novit → conhece, immaculátus, saturáre → saciar, períre → perecer, defícere → desfalecer with the participle + verb row, fumus → fumaça. Latin (= Greek) readings kept against the Hebrew: 36:1 envy (not "fret"), 36:3 "serás apascentado nas suas riquezas" (not "feed on faithfulness"), 36:5 "Revela" (not "commit"), 36:6 "ora a ele" (not "wait patiently"), 36:18 "dias" where the Greek has "ways" (the Latin followed against both), 36:20 "logo que forem honrados e exaltados" (not "like the glory of the pastures"). Every tu imperative is to a single man (the psalm\'s addressee); no vós imperative in stage one. Tests for the readers: "tenhas inveja … invejes", "usa de bondade", "serás apascentado", "Revela ao Senhor", "e ele fará", "sê sujeito", "ora a ele", "a ponto de fazeres o mal", "espreitará", "prevê", "abater", "indigente", "trucidar", "confirma os justos", "desfalecendo, como a fumaça desfalecerão", "na multidão da paz".'},
    {'step': 'checks', 'note': 'Stage one, draft 1, through ps036/partial.py (checks.py\'s own code on 36:1–36:20): hard pass (ids and marks). Mended before the critics: 36:7 mediant comma → colon (the Latin\'s). Rhymes accepted: 36:2 secarão / cairão (aréscent / décident, the Latin\'s own paired futures); 36:19 / 36:20 finals perecerão / desfalecerão (two futures of the Latin, períbunt / defícient; both verbs are glossary rows). Lengths accepted: 36:2 second colon −4 and 36:7 second −4 (ólera herbárum; hómine faciénte, Latin polysyllables), 36:11 first −3, 36:13 both −3 (irridébit; próspicit … véniet); 36:8 second +4 (the consecutive "a ponto de"), 36:14b second +4 (trucídent; "de coração" for corde), 36:3 second +3 (serás apascentado), 36:10 first +3 (existirá).'},
]

data = {'psalm': 36, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'range': '36:1–36:20', 'verses': verses,
        'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
