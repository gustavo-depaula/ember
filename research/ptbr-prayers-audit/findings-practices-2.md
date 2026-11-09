The file /tmp/ptaudit/findings-practices-2.md was not written: the harness blocks subagents from writing report files. Here are the findings in full; the calling script can save them to that path.

# pt-BR audit — practices-2

## practice/night-prayer — content/practices/night-prayer/flow.json
- **.sections[10]** (Angele Dei) — severity 2 — confidence high
  - Corpus: "Anjo de Deus, que sois meu Guardião, / por quem a Divina Providência me confiou, / iluminai, guardai, dirigui e governai / este corpo e esta alma."
  - Received: "Santo Anjo do Senhor, meu zeloso guardador, se a ti me confiou a piedade divina, sempre me rege, me guarda, me governa e me ilumina. Amém."
  - Why: every Brazilian Catholic knows the received form. The corpus text is also wrong in itself: "por quem" should be "a quem", "dirigui" is a typo for "dirigi", and "este corpo e esta alma" is not in the Latin.
- **.sections[13]** — severity 1 — confidence high
  - Corpus: "Vegiái sobre mim esta noite"
  - Correct: "Velai sobre mim esta noite" (or "Vigiai").
  - Why: "Vegiái" is not a Portuguese word. It is a garbled form, the first word of the line.
- **.sections[13]** — severity 4 — confidence medium
  - Corpus: "Nas Vossas mãos, ó Senhor, entrego o meu espírito."
  - Received: "Em vossas mãos, Senhor, entrego o meu espírito."
  - Why: this is the received form of Lc 23,46 and of the Compline responsory.

## practice/monday-souls — content/practices/monday-souls/flow.json
- **.sections[7].verses[0–5].r** (6 times) — severity 2 — confidence high
  - Corpus: "Dai-lhes, Senhor, o eterno descanso, entre os esplendores da Vossa luz."
  - Received: "Dai-lhes, Senhor, o eterno descanso, e a luz perpétua os ilumine." The older received form is "…o eterno descanso. — Entre os esplendores da luz perpétua."
  - Why: the corpus mixes the two forms, drops "perpétua" and invents "da Vossa luz".
- **.sections[7].verses[2].v** — severity 3 — confidence high
  - Corpus: "Pelos amigos que sobrevivi"
  - Correct: "Pelos amigos a quem sobrevivi"
  - Why: "sobreviver" takes "a" before its object, so the corpus line is ungrammatical.

## practice/little-office-serotina — content/practices/little-office-serotina/flow.json
- **.sections[43].verses[0]** — severity 2 — confidence high
  - Corpus: "Dai-lhes, Senhor, o descanso eterno. / E brilhe para eles a luz perpétua."
  - Received: "Dai-lhes, Senhor, o eterno descanso. — E a luz perpétua os ilumine."
  - Why: the corpus wording is not the received versicle.
- **.sections[19].verses[0].r** — severity 2 — confidence medium
  - Corpus: "Concedei, Senhor Deus, a recompensa da vida eterna a todos os que nos fizeram bem em vosso nome."
  - Received: "Dignai-vos, Senhor, dar a vida eterna a todos os que nos fazem bem por amor do vosso nome."
  - Why: this is the received Retribuere dignare.
- **.sections[8]** (Confiteor) — severity 2, low priority — confidence medium
  - Corpus: "Portanto, rogo à bem-aventurada…"
  - Received: "Portanto, peço e rogo à bem-aventurada…"
  - Why: the received older Brazilian form starts "Eu, pecador, me confesso a Deus todo-poderoso…" and says "peço e rogo".
- **.sections[57].verses[0].r** — severity 4 — confidence medium
  - Corpus: "derramai preces a vosso Filho pela salvação dos fiéis"
  - Better: "intercedei junto a vosso Filho pela salvação dos fiéis"
  - Why: "derramar preces" is a calque of *effunde preces*.
- **.sections[65].verses[0].v** — severity 4 (variant) — confidence medium
  - Corpus: "Nós vos adoramos, ó Cristo, e vos bendizemos"
  - Most common Via Sacra form: "Nós vos adoramos, Senhor Jesus Cristo, e vos bendizemos"
  - Why: "ó Cristo" also exists, so this is low priority.
- **.sections[27].verses[0].v** — severity 4 — confidence medium
  - Corpus: "uma torre fortificada"
  - Better: "uma torre de fortaleza"
  - Why: minor literalism.

## practice/meditacoes-ligorio — content/practices/meditacoes-ligorio/flow.json
- **.sections[2].sections[4]** — severity 3 — confidence high
  - Corpus: "de todo o coração arrependo de Vos ter ofendido"
  - Correct: "arrependo-me de Vos ter ofendido"
  - Why: the reflexive pronoun is missing, which is ungrammatical. The twin text in mental-prayer .sections[5] has it right.
- **.sections[5].sections[6]** — severity 3 — confidence high
  - Corpus: "dai-me a força de por fielmente em prática"
  - Correct: "de pôr fielmente em prática"
  - Why: the accent is missing on "pôr". The twin text in mental-prayer .sections[37] is correct.
- **.sections[2].sections[6]** (also mental-prayer .sections[7]) — severity 4 — confidence medium
  - Corpus: "esclarecei-me nesta meditação"
  - Better: "iluminai-me nesta meditação"
  - Why: "iluminai-me" is the usual wording in Brazilian Liguori manuals.

## practice/mental-prayer-opus-dei — content/practices/mental-prayer-opus-dei/flow.json
- **.sections[4]** — severity 3 — confidence medium
  - Corpus: "peço-Te ajuda para os pôr em prática"
  - Correct: "peço-te ajuda para pô-los em prática"
  - Why: the Brazilian Opus Dei booklet uses "pô-los"; "os pôr" is European placement. Using the Te/tu address here is correct, because it is the Opus Dei form.

## practice/mental-prayer-redemptorist — content/practices/mental-prayer-redemptorist/flow.json
- **.sections[8]** — severity 4 — confidence medium
  - Corpus: "e peço, pela vossa graça, nunca mais pecar"
  - Better: "e proponho, com a vossa graça, nunca mais pecar"
  - Why: the corpus line is a literal calque of the English.

## practice/novena-for-the-sick-escriva — content/practices/novena-for-the-sick-escriva/flow.json
- **.sections[4]** — severity 2 — confidence high
  - Corpus: "para fundar a Opus Dei"
  - Correct: "para fundar o Opus Dei"
  - Why: the official Brazilian prayer card and opusdei.org/pt-br treat Opus Dei as masculine. The rest of the text matches the official prayer. "Assim seja" instead of "Amém" is a minor difference.

## practice/mary-mother-of-god-novena — content/practices/mary-mother-of-god-novena/flow.json
- **.sections[3]** — severity 4 — confidence medium
  - Corpus: "Santa Mãe de Deus, sob a vossa proteção nos refugiamos."
  - Received: "À vossa proteção recorremos, Santa Mãe de Deus"
  - Why: the prayer opens with an echo of the Sub tuum, so it should use the received wording.

## practice/midnight-office — content/practices/midnight-office/flow.json
- **.sections[25]** — severity 3 (missing text) — confidence high
  - The pt-BR Pater noster stops after "…aos nossos devedores. ℟. Amém."
  - It is missing "℣. E não nos deixeis cair em tentação. ℟. Mas livrai-nos do mal."
  - Why: the Latin has these lines, and the twin in ordo-quiete .sections[19] includes them.
- **.sections[25]** (and ordo-quiete .sections[19]) — severity 2, low priority — confidence medium
  - Corpus: "E perdoai-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores"
  - Received: "Perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido"
  - Why: "dívidas" is defensible as a literal Mozarabic rendering, but it is not what Brazilians pray.
- **.sections[77]** — severity 3 (wrong meaning and missing text) — confidence high
  - Corpus: "desde a manhã velarei por vós"
  - Better: "desde a aurora vigio por vós" or "de madrugada vos procuro"
  - Why: "velar por" means "to watch over, guard", which inverts the sense of *vigilabo ad te*. The pt-BR is also missing the ℟/Gloria/℟ lines that the Latin has.
- **.sections[36]** — severity 3 — confidence medium
  - Corpus: "Doei-vos, Senhor, das minhas iniquidades."
  - Better: "Apagai, Senhor, as minhas iniquidades."
  - Why: the Latin "Dole" is almost certainly a transcription error for "Dele" (blot out). "Doei-vos" also sounds odd.
- **.sections[117]** — severity 3 — confidence medium
  - Corpus: "a entrar, ó santa rainha"
  - Better: "a entrar no santo reino"
  - Why: the Latin "regina" here is a corruption of *regna*. Rendering it as "rainha" puts a Marian address into a hymn about the bridegroom.
- **.sections[103]–[111]** (hymn "Surgentes ad te") — severity 3 (mixed register) — confidence high
  - Stanzas 103–104 address God as "vós".
  - Stanzas 105–108 switch to "tu": "atrai-os com as tuas virtudes", "O teu rebanho", "Cuida das ovelhas", "leva-as".
  - Stanzas 113–115 and 132–133 return to "vós".
  - Fix: make the whole hymn "vós".
- **.sections[43] and [45]** — severity 4 — confidence medium
  - Corpus: "℣. O bastante, com paz."
  - Better: "℣. Basta; em paz.", or match [58] "Terminemos em paz."
  - Why: the corpus line renders *Sufficientia cum pace* in a way a reader cannot make sense of.
- **.sections[27]** — severity 4 — confidence medium
  - Corpus: "Clamores para o dia de cada dia"
  - Better: "Clamores para os dias comuns" (*cotidiano* = ferial)
  - Why: the corpus title is a literalism.
- **.sections[54]** (Oratio Manasse) — severity 4 — confidence medium
  - Corpus: "não há como declinar a multidão dos meus delitos". Better: "e não há como escapar à multidão dos meus delitos". Why: the corpus wording is opaque.
  - Corpus: "Não me percais com as minhas iniquidades". Better: "Não me façais perecer com as minhas iniquidades".
- **.sections[116]** — severity 4 — confidence medium
  - Corpus: "sigamos de tão grande alegria / as promessas do Espírito Santo"
  - Better: "sigamos as promessas de tão grande alegria do Espírito Santo"
  - Why: the word order is a calque.

## practice/ordo-quiete-ante-lectulo — content/practices/ordo-quiete-ante-lectulo/flow.json
- **.sections[24]** — severity 4 — confidence medium
  - Corpus: "vamos e repousemos em paz"
  - Better: "vamo-nos e repousemos em paz"
  - Why: the corpus line mixes an indicative and a hortative.
- **.sections[19]** — see the "dívidas" note under midnight-office.

## practice/morning-rule-byzantine — content/practices/morning-rule-byzantine/flow.json
The same Psalm 50 text is in practice/paraklesis .sections[27], so every Psalm 50 fix below applies to both files.

- **.sections[26]** — severity 3 — confidence high
  - Corpus: "e venceis se Vos puserem em questão"
  - Correct: "e vençais quando fordes julgado"
  - Why: the verb must be subjunctive, parallel to "sejais achado justo". "Venceis" is indicative, which is a grammar error.
- **.sections[26]** — severity 3 — confidence high
  - Corpus: "e em pecados nasceu-me minha mãe"
  - Correct: "e em pecado me concebeu minha mãe"
  - Why: as written, the corpus says "my mother was born to me", which inverts the meaning.
- **.sections[26]** — severity 3 — confidence high
  - Corpus: "Restitui-me a alegria da Vossa salvação"
  - Correct: "Restituí-me"
  - Why: without the accent this is the tu imperative, inside a prayer that addresses God as Vós.
- **.sections[26]** — severity 4 — confidence high
  - Corpus: "Bem-fazei, Senhor, na Vossa benevolência, a Sião"
  - Better: "Sede benigno, Senhor, para com Sião"
  - Why: "Bem-fazei" is not Portuguese usage.
- **.sections[26]** — severity 4 — confidence medium
  - Corpus: "Livrai-me da punição de sangue"
  - Better: "Livrai-me do sangue derramado"
  - Why: the corpus phrase is a calque.
- **.sections[33]** (Axion estin; also paraklesis .sections[133] and [153]) — severity 4 — confidence medium
  - Corpus: "a Vós que, sem corrupção, destes nascimento ao Verbo de Deus — a Vós, verdadeira Mãe de Deus, nós Vos magnificamos"
  - Better: "que sem corrupção destes à luz o Verbo de Deus, verdadeira Mãe de Deus, nós Vos engrandecemos"
  - Why: "destes nascimento" is an anglicism, and "a Vós … nós Vos" is pleonastic. "Deípara" is a bookish word that the rest of the corpus replaces with "Mãe de Deus".

## practice/paraklesis — content/practices/paraklesis/flow.json
- **.sections[94]** (Lc 1) — severity 3 — confidence high for the hyphen, medium for the rest
  - Corpus: "porque se hão-de cumprir"
  - Correct: "hão de cumprir"
  - Why: "hão-de" is the hyphenated European spelling. The passage follows Matos Soares ("venha ter comigo", "baixeza da sua serva"), which is a recognised translation. The Brazilian Ave-Maria wording would read more naturally: "Donde me vem esta honra de vir a mim a mãe do meu Senhor?"
- **.sections[20].verses[2].v** — severity 3 — confidence high
  - Corpus: "Cercaram-me por todos os lados, mas eu esmaguei-as em nome do Senhor."
  - Better: "Cercaram-me por todos os lados, mas em nome do Senhor eu os esmaguei."
  - Why: the feminine "-as" has no antecedent, because the omitted word is "abelhas". "Eu" before the verb also calls for proclisis in Brazil.
- **.sections[14]** (Ps 142) — severity 4 — confidence high
  - Corpus: the bracketed editorial insertions "(Mas) lembro-me (logo)" and "os (mortos)".
  - Fix: remove the brackets from the prayer text, because they are shown to the user.
  - The psalm's tu address is acceptable because it is a Bible translation.
- **.sections[147]** — severity 4 — confidence medium
  - Corpus: "Não Vos ireis em excesso contra nós"
  - Better: "Não Vos irriteis demasiado contra nós"
  - Why: "ireis" is technically the subjunctive of "irar-se", but every reader hears "you will go".
- **.sections[35] and [81]** — severity 4 — confidence medium
  - Corpus: "Ó Donzela"
  - Better: "Ó Virgem"
  - Why: "Donzela" is not used for Our Lady in Brazilian prayer.
- **.sections[24]** — severity 4 — confidence medium
  - Corpus: "jamais deixemos, por silêncio, de proclamar"
  - Better: "nunca nos calemos em proclamar"
  - Why: the corpus wording is a calque.
- **.sections[141]** — severity 4 — confidence medium
  - Corpus: "montanha coberta pela sombra"
  - Better: "monte umbroso"
  - Why: the corpus phrase is a literalism.
- **.sections[136].verses[0].v** — severity 4 — confidence medium
  - Corpus: "Recordarei o teu nome"
  - Note: it does not match the en "They shall remember thy name", and it uses tu while the surrounding Marian address is Vós. Acceptable as psalm text, but worth noting.

## Overall judgement
Most of this chunk is grammatical, devout pt-BR. The Byzantine Paraklesis and the novenas are mostly clean and consistently use the Vós address. The serious problems cluster in three places:

1. **Short prayers translated instead of taken as received.** Prayers every Brazilian knows by heart were translated from the Latin or English. The Angele Dei in night-prayer is the worst: unrecognisable and also ungrammatical. The Requiem aeternam in monday-souls (6 times) and little-office-serotina is not the received text either.
2. **Outright errors that read as broken text:**
   - "Vegiái" in night-prayer
   - "nasceu-me minha mãe", "venceis" and "Restitui-me" in the Byzantine Psalm 50 shared by two practices
   - "esmaguei-as" without an antecedent
   - "arrependo de" and "por" for "pôr" in meditacoes-ligorio
   - "fundar a Opus Dei"
   - "que sobrevivi" written for "a quem sobrevivi"
3. **The Mozarabic offices.** midnight-office and ordo-quiete are direct translations of a corrupt Latin. They have truncated responsories, a Pater noster missing its last two lines, a hymn that mixes tu and vós, and several meaning slips ("velarei por vós", "santa rainha", "Doei-vos"). These are niche texts, so few users will meet them.

The worst items are the Santo Anjo and the Requiem versicle. They are the same failure as the Anima Christi: not the prayer Brazilians say. The Byzantine Psalm 50 errors and "Vegiái" come next.