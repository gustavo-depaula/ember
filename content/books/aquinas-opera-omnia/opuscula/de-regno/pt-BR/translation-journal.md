# Translation Journal — Do Reino, ao Rei de Chipre (pt-BR)

Source: la (Latin, Leonine/Marietti text from aquinas.cc — canonical; en-US, Phelan/Eschmann 1949, consulted only as a secondary reference for register and terminology, never as the source text)
Target: pt-BR

## Key Terms

| Latin | Português | Notes |
|-------|-----------|-------|
| rex / regnum | rei / reino | *regnum* as the regime of one is "reino" (cf. "o reino é o melhor governo"); "realeza" only in the prologue's *librum de regno* and the `g2` toc title |
| regimen | governo | also "regime do governo" once (`g3-c002`: *a gubernationis regimine*) |
| gubernatio / gubernare | governo / governar | the ship image (*gubernator* = piloto) is kept, since Aquinas derives the name from it; outside the ship image *gubernator* is "governante" (`g2-c001` *Ubi non est gubernator*; `g3-c003` *gubernatoris intentio*) |
| rector / regens | governante | |
| praeesse / praesidere | presidir; estar à frente | both verbs are "presidir" by default; "estar à frente" only in `g2-c003` (*plus praeesse appetunt quam prodesse* → "estar à frente do que ser úteis") and `g3-c004` ×2 (*praeesse debet his qui…*; *ita praeesse debet omnibus humanis officiis*, set against *subdi*), and *praefici* → "postos à frente" (`g2-c010`) |
| tyrannus / tyrannis | tirano / tirania | |
| multitudo | multidão | kept literal throughout; it is the technical term for the governed community |
| bonum commune | bem comum | |
| civitas / provincia | cidade / província | |
| vicus | povoado | |
| politia | politia | Aristotle's *politeia*, the just rule of the many; "democracia" stays the unjust form, as in the Latin |
| aristocratia / optimates | aristocracia / optimates | *potentatus optimus vel optimorum* → "o poder ótimo, ou dos ótimos" |
| oligarchia / democratia | oligarquia / democracia | |
| beatitudo | bem-aventurança | as in the other Aquinas pt-BR works |
| felix / felicitas | feliz / felicidade | kept distinct from *beatus* (bem-aventurado) |
| virtus | virtude; força; potência | "força" where it means physical/operative power (*virtus unita*, *virtus corporalis*, *virtute radii solaris*, *naturales virtutes*); "potência" for powers of the soul (`g3-c001` *spirituales virtutes*, `g3-c002` *virtute animae*) |
| ratio (regis, gubernationis, institutionis) | razão | "razão de rei", "razão do governo": the defining character, not a mere notion |
| institutio / institutor | instituição / fundador | *institutor civitatis et regni* → "fundador" (`g3-c002`); *institutor morum* → "educador dos costumes" (`g3-c003`), where nothing is founded |
| conversatio civilis | convivência civil | |
| negotiatio / mercatio | negócio / comércio | |
| delectatio / deliciae | deleite / delícias | |
| temperies | temperança (do clima) | |
| Tullius | Túlio | Cicero, as Aquinas names him |
| Salustius, Vegetius, Vitruvius, Valerius Maximus, Suetonius | Salústio, Vegécio, Vitrúvio, Valério Máximo, Suetônio | |
| Sapiens | o Sábio | the author of Wisdom/Ecclesiasticus; capitalized also in `g2-c003`, where the edition prints lowercase *sapiens* for the same Sirach quotation |
| Apostolus | o Apóstolo | Paul |
| Aioth | Aod | Vulgate form of Ehud, as in Portuguese Vulgate-based Bibles |
| Assuerus, Nabuchodonosor, Ioas, Achab, Helias | Assuero, Nabucodonosor, Joás, Acab, Elias | |

## Translation Decisions

- 2026-10-02: Translated from the Latin (`la/`), keeping its file, heading and paragraph structure. Each chapter is `# Capítulo N` plus the Latin's italic sub-heading line where the Latin has one (none in `g3-c001`). The prologue is `# Proêmio`, as in *Do Ente e da Essência*.
- 2026-10-02: `g2-c005.md`: the Latin gives the chapter title as a plain paragraph line rather than a `***…***` sub-heading. Mirrored as a plain line so the paragraph structure matches the source; not changed in the Latin, since it is a formatting choice of the import, not an OCR error.
- 2026-10-02: Scripture references: the Latin carries none; the en-US adds bracketed references (e.g. "(Eccl 4:9)") as translator apparatus. Dropped, as *Do Ente e da Essência* dropped Maurer's added citations. Bible books named in the prose take their usual Portuguese names (Ezequiel, Eclesiástico, Jó, Oseias, Deuteronômio, …).
- 2026-10-02: Scripture and classical quotations are rendered from the Latin wording Aquinas gives, not from a standard Portuguese Bible (e.g. *Melius est duos esse quam unum; habent enim emolumentum mutuae societatis* → "têm a vantagem da sociedade mútua"). Where the Latin splits one quotation into several italic spans (`*Melius est duos* *esse* *quam unum…*`, in `g2-c001`, `g2-c006`, `g2-c009`, `g2-c010`), the pt-BR uses one span, since the split is an import artifact with no meaning.
- 2026-10-02: Bracketed editorial insertion in the Gregory quotation (`g2-c009`, `[potestas culminis]`) kept as "[o poder do cume]".
- 2026-10-02: No footnotes in the Latin; none added.
- 2026-10-02: Toc titles in `book.json` follow the en-US descriptive titles (the Latin toc has only "Caput N"), matching the pattern of *Do Ente e da Essência*; the in-file sub-headings translate the Latin sub-heading itself, so the two can differ slightly in wording (as en-US and la do).
- 2026-10-02: The `description` field already existed, so a pt-BR entry was added to it alongside `name`, `author`, `languages` and the toc.

## Source edits (la/)

OCR-class slips in the Latin, corrected in place:

- `g2-c004.md` sub-heading: *regia dignatis* → *regia dignitas*.
- `g2-c009.md`: *sublimen* → *sublimem*; *in diebus euis* → *in diebus eius*.
- `g2-c010.md`: *benefaciendo subiectiset* → *subiectis et*.
- `g3-c006.md`: *animalia palestria* → *palustria*.
- `g3-c007.md`: *nociuus* → *nocivus*; *populus civitates exerceatur* → *civitatis*; *non facili potest* → *non facile*.

Left as transmitted (edition readings or medieval spellings, translated by sense): *premium*, *optinebunt*, *que* for *quae*, *amenus*; `g2-c002` *ea quae sunt ad naturam sunt optime se habent*; `g2-c010` *ad quaelibet attendenda* (read as "a empreender qualquer coisa").

## Review log

### Round 1

Focus: paragraph-by-paragraph completeness against `la/` (paragraphs, quotations, parentheticals, Scripture and classical references, Latin phrases), plus the mechanical audit and `book.json`. Verdict: 3 defects, all fixed. Paragraph counts match 1:1 in all 21 files; `book.json` is valid, lists `pt-BR`, and has pt-BR `name`, `author`, `description` and every toc title.

Fixed:

- `g2-c002`, last paragraph: "*Muitos pastores devastaram a minha vinha*" → "*… devastaram a vinha*". Aquinas quotes *Pastores multi demoliti sunt vineam* without the Vulgate's *meam*; "minha" was supplied from the Bible.
- `g3-c004`, Malachi quotation: "*Os lábios do sacerdote guardam*" → "*Os lábios dos sacerdotes guardam*". The Latin reads *Labia sacerdotum* (plural), not the Vulgate's *sacerdotis*.
- Journal, Translation Decisions: the list of files where the Latin splits one quotation into several italic spans named `g2-c002` (which has no split; its *Solliciti*, inquit, *sitis…* is a quotation interrupted by *inquit*) and omitted `g2-c010` (*dividunt propria* *benefaciendo…*). Corrected to `g2-c001`, `g2-c006`, `g2-c009`, `g2-c010`.

Considered and rejected:

- `g2-c002` *melius igitur regit unus quam plures ex eo quod appropinquant ad unum* → "pelo fato de que estes apenas se aproximam do um". "apenas" makes explicit the contrast the argument already draws (the many only approach unity; the one is one). It adds no claim the Latin lacks.
- `g2-c008` *civis sanctorum et domesticus Dei* → "concidadão dos santos e membro da família de Deus". Same meaning as *civis* in this phrase. A defensible rendering, not an added word.
- `g2-c010` *ad faciendum iudicium* → "para fazer justiça". "fazer justiça" is the Portuguese idiom for exercising judgment; not a mistranslation.
- `g2-c010` *in sua Politica* → "na sua *Política*", italic where the Latin has none. The translate-book guidelines italicize book titles.
- `g2-c011` *horrende et cito apparebit vobis* → "ele vos aparecerá horrenda e prontamente". Portuguese needs a subject; the implied subject is God, as in the Latin.
- `g3-c005` *si humor infusus … consumatur* (of a lamp) → "se o óleo nela infundido se consome". The liquid in a lamp is oil. A gloss, not a change of sense.
- `g3-c007` *Est autem negotiationis usus nocivus* → "O uso do negócio é também nocivo". *autem* here adds a further argument, so "também" fits.

Evidence (paragraph alignment with quoted pt-BR beside the Latin): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of all 21 files against `la/` (negation, subject/object, tense/mood, false friends, dropped qualifiers, quotations pulled toward the familiar Bible wording), plus the mechanical audit and `book.json`. Verdict: 1 defect, fixed. Paragraph counts still match 1:1; italic-span differences are exactly the merged splits listed in Translation Decisions plus the italic *Política*; `book.json` valid, with `pt-BR` and all pt-BR fields.

Fixed:

- `g3-c006`, Vitruvius quotation: "*voltado para as regiões do céu que não são nem tórridas nem frias*" → "*voltado para as regiões do céu, nem tórrido nem frio*". In the Latin as given (*regionesque caeli spectans neque aestuosus neque frigidus*), *aestuosus*/*frigidus* are masculine nominative and qualify *locus*, not *regiones*. Vitruvius's own text has *aestuosas neque frigidas*, but this book renders the Latin that Aquinas gives.

Considered and rejected:

- `g2-c006` *ex hoc multotiens proveniunt gravissimae dissensiones* → "muitíssimas vezes". A small intensification of "often", with no change to the claim.
- `g2-c009` *imperatores etiam apud Romanos divi vocantur* → "eram chamados divinos". *vocantur* is a historical present about pagan Rome, and Portuguese past tense is a defensible rendering. (The parallel *in Exodo iudices…dii vocantur* stays present, as Scripture still says it.)
- `g2-c010` *praestabilis super malitia* (Joel) → "se compadece da malícia". *malitia* here is the threatened evil; "compadecer-se da malícia" keeps the Vulgate's ambiguity and does not reverse it.
- `g2-c010` *diliguntur a plurimis* → "são amados pela maioria". *plurimi* can mean "most"; no change of sense.
- `g2-c011` *ministri regni illius* → "ministros do seu reino". The addressees are *vós* (julgastes, guardastes), so "seu" is third person here (God's kingdom), not "your". A 2nd-plural reading would need "vosso".

Evidence (pt-BR quoted beside the Latin for every passage checked): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-2.md`.

### Round 3

Focus: source-blind cold read of all 21 files (grammar, concord, regency, pronoun reference, sense), each mark then verified against `la/`; then a mechanical sweep of spelling, diacritics, crase, post-1990 hyphenation, punctuation and italic/dash pairing; plus the mechanical audit and `book.json`. Verdict: 1 defect, fixed.

Fixed:

- `g2-c006`, Theban legion: "por suportarem paciente e armados a morte" → "por suportarem pacientemente e armados a morte". The Latin *patienter* is an adverb; the singular adjective "paciente" against a plural subject was broken concord.

Considered and rejected:

- `g2-c006` *ut sic multitudini provideatur de rege ut non incidant in tyrannum* → "que não caiam sob um tirano" after "a multidão". The Latin has the same plural ad sensum; Portuguese allows the silepse.
- `g2-c003` *nec firmari quidquam potest quale sit quod positum est in alterius voluntate* → "nem se pode dar por firme *o que será* aquilo que…". Same sense: nothing placed in another's will can be made sure as to how it will turn out.
- `g3-c004` *in perversitate voluntatum … dum vel desides … vel insuper sunt … noxii* → "das vontades, quando são ou indolentes … ou … nocivos". The Latin itself shifts to the men (masculine *desides*, *noxii*); mirrored.
- `g3-c004` *Sic igitur bonae multitudinis institutioni tertium restat* → "para a boa instituição da multidão". *bonae* can agree with *institutioni*; defensible.
- `g3-c007` *negotiatores namque, dum umbram colunt, a laboribus vacant et fruuntur deliciis, mollescunt animi* → same asyndetic run of clauses with a change of subject. Mirrors the Latin and reads clearly.
- `g2-c008` *Hic est honor quem … rex David dicebat* → "a honra que o rei Davi, desejando-a e admirando-a, dizia". The relative mirrors *quem … dicebat*; not ungrammatical.

Evidence (pt-BR quoted beside the Latin for every passage checked, and the sweep results): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-3.md`.

### Round 4

Focus: function words, headings and forced commitments (prepositions, articles, demonstratives, connectors, possessive "seu/sua", "consigo"; gender and antecedent commitments; tu/vós traced turn by turn in every quotation and apostrophe; every heading and toc title), plus the mechanical audit and `book.json`. Verdict: 2 defects, both fixed. Paragraph counts still match 1:1; italic-span differences are only the recorded merges plus *Política*; `book.json` valid, with `pt-BR` and all pt-BR fields; Key Terms rows verified against the chapter files.

Fixed:

- `g2-c006`, successive tyrants: "que a posterior se torne mais grave que a precedente, enquanto não abandona … e ainda, pela malícia do seu coração" → "que o posterior se torne mais pesado que o precedente, enquanto não abandona … e ainda ele mesmo, pela malícia do seu coração". In *ut posterior gravior fiat quam praecedens, dum … non deserit et etiam ipse ex sui cordis malitia nova excogitat*, *ipse* and *sui cordis* make the referent the tyrant, not tyranny. "pesado" matches the earlier *gravem tyrannum* → "tirano pesado".
- `g2-c010`, kings' guards: "Mas o domínio dos reis, porque agrada aos súditos, tem todos os súditos por guardas" → "Mas os reis, porque o seu domínio agrada aos súditos, têm todos os súditos por guardas". The main verb *habent* (and the following *opus non habent*) is plural, so the subject is the kings. With "o domínio … tem", the next clause "nos quais não precisam gastar" was left without a subject.

Considered and rejected:

- `g2-c003` *regnum autem tyranno* → "e ao reino, a tirania". The Latin puts the person in the dative, but tyranny is the regime named on the other side. "um e outro" for a mixed pair is regular.
- `g2-c007` *filium, qui contra imperium suum … pugnavit* → "lutara contra a sua ordem". *suum* is Torquatus. A son cannot fight against his own order, so "sua" can only mean the father's.
- `g2-c007` *verbis eorum, quibus nihil mutabilius* → "e nada há na vida mais mutável para os homens". The comparison with the opinions and words just named is implied.
- `g2-c008` *quam non fallax … lingua … profert* → "que não a profere a língua enganosa". A literary resumptive clitic, not broken grammar.
- `g2-c010` *per eorum deiectionem tranquillitatem inducet* (God) → "pela sua deposição". The nearest antecedent is "por eles" (the tyrants), and God's deposition is not a possible reading.
- `g3-c007` *dum cives eorum exemplo … provocantur* → "pelo seu exemplo a fazer coisas semelhantes". "semelhantes" ties the example to the foreigners just described.
- `g2-c005` *plures inveniet exercuisse tyrannidem* → "achará que mais exerceram a tirania". The claim is the same whether it is read as more men or as more tyranny.
- `g3-c004` *regnum aut civitas funditus dissipatur* → "o reino ou a cidade é destruído". Masculine agreement for a mixed disjunction is regular.

Evidence (headings, the tu/vós trace, and every commitment checked, with pt-BR beside the Latin): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-4.md`.

### Round 5

Focus: terms, journal and names. A per-file term-frequency diff of every Key Terms row against `la/`, in both directions; a grep of every falsifiable journal claim (Key Terms rows, quoted forms, source edits, split-span list, earlier review-log quotations); every proper name and work title checked against standard Portuguese and the sibling pt-BR works. Also the mechanical audit and `book.json`. Verdict: 4 defects, all fixed. Paragraph counts still match 1:1. Italic-span differences are only the recorded merges, *Política*, and `g2-c002`'s *Solliciti*, inquit, *sitis…* given as one span after "diz:". `book.json` is valid, with `pt-BR` and all pt-BR fields.

Fixed:

- `g2-c003`, Sirach quotation: "O sábio, portanto, adverte" → "O Sábio, portanto, adverte". *Longe esto ab homine potestatem habente occidendi* is Sirach, the same author the other four *Sapiens* citations name "o Sábio" (Key Terms). The edition prints lowercase *sapiens* here, and the lowercase pt-BR read as "a wise man" in general.
- Key Terms, *praeesse / praesidere*: the row claimed "estar à frente / presidir". In fact *praeesse* is "presidir" in `g2-c001`, `g2-c005`, `g2-c010` (*praefuerunt*), `g2-c011` and `g3-c004` (*officiis praesunt*). "estar à frente" appears only in `g2-c003` and `g3-c004` ×2 (and *praefici* → "postos à frente" in `g2-c010`). The row now says this.
- Key Terms, *institutor*: the row gave only "fundador", but `g3-c003` *institutor morum* is "educador dos costumes". That is correct, because nothing is founded there. The row now records it.
- Key Terms, *virtus*: the row gave only "virtude; força", but `g3-c001` *spirituales virtutes* and `g3-c002` *virtute animae* are "potência(s)". That is correct for powers of the soul. The row now records it.

Also clarified, with no defect behind it: the *gubernatio* row now notes that *gubernator* outside the ship image is "governante" (`g2-c001`, `g3-c003`), so the reverse check on "governante" does not flag it.

Considered and rejected:

- `g2-c010` *Damon et Pythias* → "Dâmon e Pítias", while *Concerning Virgins* (Ambrose) writes "Dámon". "Dâmon" is the Brazilian form (stressed *a* before a nasal takes the circumflex, as in "Dâmocles"). The sibling uses the European spelling, which is outside this book.
- `g2-c006` *apud Lugdunum Galliae civitatem* → "Lugduno, cidade da Gália", while siblings write "Lyon/Lião" for the modern city. Aquinas names the Roman city, and "Lugduno" is its Portuguese form.
- `g2-c007`, `g2-c003` *Tullius* → "Túlio", while most siblings write "Cícero". Aquinas's own works in this corpus keep "Túlio" where he writes *Tullius* (*De principiis naturae*).
- `g3-c007` *convictum* → "convivência com estrangeiros". This is the only use of "convivência" without "civil"/"humana", and it renders *convictus* (living together), not *conversatio*. No conflict with the *conversatio civilis* row.
- `g3-c007` *Alexandro Macedoni* → "Alexandre da Macedônia". This is the same form as the John Chrysostom sibling, and the standard one.

Evidence (term counts, each claim grepped, names compared with siblings, pt-BR quoted beside the Latin): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-5.md`.

### Round 6

Focus: completeness paragraph by paragraph against `la/`. Every paragraph of all 21 files was aligned one to one and checked for dropped, added, merged or split content, and for every quotation, parenthetical gloss, attribution and Latin phrase. Bible book names were checked against the Latin. Also the mechanical audit and `book.json`. Verdict: clean, no defects. Paragraph counts match 1:1. The only italic-span differences are the ones already recorded. The Latin has no chapter:verse numbers and the pt-BR adds none. Each Bible book the Latin names appears in Portuguese form in the same file. `book.json` is valid, with `pt-BR` and all pt-BR fields.

Considered and rejected:

- `g2-c008` *sapientiam quam quaesivit accepit* → "a sabedoria que pediu". Solomon asked for wisdom, so "pediu" renders *quaesivit* correctly here.
- `g3-c002` *distributae videntur* / *provisa videntur* → "vemos distribuídas" / "vemos providas". This renders *videntur* as "are seen". The evidential sense is kept.
- `g2-c005` *quicumque … divertat …, dissensionis periculum multitudini subditorum imminet* → "faz ameaçar o perigo da dissensão sobre a multidão". The subject is recast as the ruler who turns aside, but the claim stays the same as the Latin: his turning aside brings the danger.

Evidence (every paragraph pair quoted, Latin beside pt-BR): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-6.md`.

### Round 7

Focus: clause-by-clause bilingual fidelity read of all 21 files against `la/` (negation, subject/object, tense/mood, false friends, dropped qualifiers, quotations pulled toward the familiar Bible wording), plus the mechanical audit and `book.json`. Verdict: clean, no defects. Paragraph counts match 1:1. The only italic-span differences are the ones already recorded. `book.json` is valid, with `pt-BR` and all pt-BR fields.

Considered and rejected:

- `g2-c003` *Iacent semper et parum vigent quae apud quosque improbantur* → "reprovadas por cada um". *apud quosque* is distributive ("among any given people"), and "por cada um" keeps that sense.
- `g2-c007` *Gloriam qui spreverit, veram habuit* → "Quem desprezou a glória teve a verdadeira". The future perfect belongs to a general maxim. The Portuguese past tense states the same claim.
- `g2-c010` *non deerit ex multis vel unus qui occasione non utatur* → "ao menos um que se valha da ocasião". The second *non* is pleonastic, because the argument needs someone who uses the occasion. Rendered by sense.
- `g2-c005` *ex his quae pro tempore fiunt* → "pelas coisas que sucedem com o tempo". *pro tempore* can mean "in the course of time".
- `g3-c008` *in quas … profusae dispergunt* → "dissipam, pródigos". The feminine *profusae* has no feminine subject in the sentence. The subject is the men (*resoluti*), so the masculine is the only coherent reading.

Evidence (full alignment, Latin beside pt-BR, and the passages weighed): `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-regno/review-7.md`.
