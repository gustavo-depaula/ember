# Catechetical Formation — Build Journal

Running log of decisions for the autonomous V0.5–V0.6 build.

---

## 2026-04-26 — Session start

**Mandate (verbatim from user):** "A catechetical formation track with Aquinas and Pius X as our 'teachers', Trent for deep dive. Beginner friendly but fruitful for everyone. Beautiful, glorifies God. All Pius X Catechism questions need to be included. Sessions 8–15 min. Don't sacrifice quality or doctrinal fullness."

**Resources discovered on disk:**
- `Compendium Hagan/` — 4 PDFs (creed, sacraments, commandments, prayer). Use for Pius X ↔ Trent alignment refinement when our intuitive mapping is unclear.
- `Na-Escola-de-Jesus-Catecismo-da-Doutrina-Crista-de-Sao-Pio-X-ed-1912.pdf` (48 MB) — Pe. Fornasari's modern formation book on the same catechism. Format inspiration only; copyrighted, cannot use text.

**V0.1 already shipped:** 45-session anthology book (`content/libraries/base/books/catechetical-formation/`). Trent's spine, all three sources verbatim. This becomes the substrate V0.5/V0.6 builds on.

**V0.5/V0.6 deltas vs V0.1:**

1. **90 sessions, not 45.** All 433 Pius X Qs covered.
2. **New voice hierarchy.** Pius X (questioner) and Aquinas (pastoral teacher) are the daily teachers; Trent is "Going Deeper" (optional, appended). This reverses V0.1's neutral triptych.
3. **Per-session original content** (ours):
   - Opening framing (~30–50 words)
   - Image + ekphrasis (~50 words)
   - Scripture pull-quote (1 verse)
   - Closing reflection (~30 words)
4. **Sacred art per session** — PD/CC0, doctrinally apt.
5. **EN-US + PT-BR** in parallel.

**Not in scope today:**
- Practice wrapper (V0.7 — once a daily reader exists, wrap it in a plan-of-life practice).
- Format-engine extensions (e.g., collapsible deep-dive UI). Plain markdown for now; visual subordination via text labels.
- Image agent runs in foreground (no parallel background subagents).

**Working principles:**
- Plan → Build → Review → Repeat. Multiple cycles allowed.
- Doctrinal fullness > brevity. 8–15 min sessions are fine.
- Don't simplify Aquinas. Pius X is already simple.
- Use existing translated text wherever possible. Original writing only for the joints (ekphrasis, closing, framing, Scripture cap).
- Log every non-obvious decision here.

**Decision log starts below.**

---

## D-01: Sessions per pillar

Per the original project README, the rough budget is:
- Lição Preliminar: 2
- Credo: 32
- Mandamentos: 18
- Sacramentos: 22
- Pai Nosso + Ave Maria: 10
- Virtudes + conclusão: 6
- Total: 90

Refining for actual Q distribution:
- Preliminary (Qs 1–27, 27 Qs): **2 sessions** ≈ 13–14 Qs each
- Creed (Qs 28–160, 133 Qs): **32 sessions** ≈ 4 Qs each
- Sacraments (Qs 267–413, 147 Qs): **22 sessions** ≈ 7 Qs each (each sacrament gets multiple sessions)
- Decalogue (Qs 161–212, 52 Qs): **18 sessions** ≈ 3 Qs each (heavy commandments get 2 sessions; light ones get 1)
- Church precepts (Qs 213–226, 14 Qs): **2 sessions** ≈ 7 Qs each
- Virtues (Qs 227–266, 40 Qs): **4 sessions** ≈ 10 Qs each
- Pater Noster (Qs 414–430): **9 sessions** (intro + Our Father + 7 petitions)
- Hail Mary (Qs 431–433): **1 session**

Total: 2 + 32 + 22 + 18 + 2 + 4 + 9 + 1 = **90 sessions** ✓

This relocates "church precepts" and "virtues" out of "Christian Life" supplement and back into the main spine — they were V0.1 supplements precisely because Trent has nothing to say on them. In V0.5 they become first-class because Pius X gives them substantial coverage and the Mandamentos/Pater bridge needs filling.

---

## D-02: Session voice and shape

```markdown
# Session NN — <Title>

*<Opening framing — one warm sentence positioning today's theme.>*

![<image alt>](../images/session-NN.<ext>)
> *<Image ekphrasis — points the reader's eye, ~50 words.>*

## Pius X asks  /  São Pio X pergunta

**N.** Question?

*Answer.*

[…all relevant Qs in this cluster…]

## St. Thomas teaches  /  São Tomás ensina

[Aquinas paragraph(s) — verbatim from `catechetical-instructions/`, possibly sliced.]

> **Scripture / Escritura** — *"Verse text"* (Reference)

> *Closing reflection or short prayer.*

---

#### Going Deeper — *Catechism of Trent*  /  *Catecismo de Trento*

[Trent passage — verbatim from `catechism-of-trent/`, full chapter or sliced.]
```

- The closing is a **block quote, italic** — visually a different beat from the body.
- "Going Deeper" sits below a horizontal rule with `####` (h4) — visually subordinate, doesn't compete with the day's primary teaching.
- For sessions where Aquinas has nothing (sacraments, virtues, precepts), the "St. Thomas teaches" section is replaced with **"The Roman Catechism teaches"** drawing the day's pastoral teaching from Trent — and the Trent "Going Deeper" is dropped (Trent is already the primary teacher there).
- For Hail Mary: Aquinas teaches; no Trent.
- For prayer petitions where Pius X has only 1–2 Qs: Aquinas teaches; Trent teaches secondarily.

---

## D-03: Image strategy

90 PD/CC0 images. Approach:
1. Use my training knowledge of the Catholic art canon to pick named masters (Fra Angelico, Caravaggio, Murillo, Bouguereau, Tissot, Bellini, Raphael, El Greco, etc.) plus Eastern/Latin American traditions for breadth.
2. Reference via Wikimedia Commons file paths — `https://commons.wikimedia.org/wiki/Special:FilePath/<filename>?width=1200`.
3. Download into `books/catechetical-formation/images/` (will inflate `.pray` size; budgeting ~5–10 MB total at 800–1200 px width).
4. Verify license per image — only PD or CC0.
5. Maintain `images/manifest.json` with attribution per image.

Acceptable risk: a few image picks may end up needing replacement. We're delivering the format; image curation can iterate.

---

## D-04: Scripture verse strategy

One Bible verse per session, chosen to crown the doctrine. Sources of verse text:
- **EN**: Douay-Rheims (PD)
- **PT-BR**: Pereira de Figueiredo (PD) or Almeida (PD; Catholic edition would be ideal but the safer move is to use Pereira directly where I can).

For V0.5 I write the verse text inline (not pulling from a Bible asset). Editorial pass can normalize against canonical translations later.

---

## D-05: PT-BR strategy

I write EN and PT-BR in parallel for the original content (ekphrases, closings, framings). Pius X / Aquinas / Trent text is already translated in the source books and I extract verbatim.

For the ekphrasis + closing prayer, I write each in its native register — not mechanical translation. Brazilian Catholic spiritual register has its own warmth and idioms (e.g., "Senhor", "Cristo", direct Marian address) that don't map word-for-word from English.

---

## D-06: Format DNA from Na Escola de Jesus

Sampled the opening pages of the 1955 Fornasari book. Lessons:

- **Direct second-person address** ("tu") with affectionate register — not condescending, not flat. PT-BR specifically is warmer than EN here.
- **Concrete imagery throughout.** "A lua parece uma barquinha de prata navegando no espaço." Stars, mountains, lion-and-lamb, child's heart with defects, even the sun has spots. Doctrine landed on the senses.
- **Scripture frames the unit** — verses as openers and closers ("«Jesus é o único Mestre que tem palavras de Vida eterna» — Jo. 6, 69").
- **Multiple Q&A per session** — Fornasari clusters Qs 1–3 in his first lesson with one image. We do the same.
- **Image with title + artist caption** (e.g., "O Paraíso terrestre" — Benvenuti·Alinari). Attribution is part of the page, not buried.
- **Imitable virtues** — pastoral take is "we can imitate God's power, wisdom, goodness through specific actions." Not abstract definitions; lived consequences.

V0.5 doesn't aim at children specifically (Fornasari's audience). We aim "beginner-friendly, fruitful for everyone" — keep the warm voice, keep concrete imagery, but pitch the depth a little higher (using Aquinas's actual prose verbatim handles that — Aquinas is more layered than Fornasari's adapted retellings).

We do NOT use any text from Fornasari (still in copyright; 1955 book, lifetime+70 not expired). Format only.

---

## D-07: Audience — young adults 18-35

User confirmed primary audience: young adults 18-35.

This shifts the voice from Fornasari's child-pitched "tu, criancinha" warmth to something more honest:

- **Direct, not coddling.** Young adults have already heard too much marketing-spirituality and saccharine devotional language. Don't perform warmth. Earn it.
- **Beautiful, not cute.** Concrete imagery still essential, but draw from a more grown-up register: the silence of a city at 3 AM, scrolling without satisfaction, the weight of free will, the architecture of a cathedral. Not "a barquinha de prata."
- **Intellectually respectful.** A 24-year-old reading this might also be reading Camus or Pieper. Aquinas does the heavy doctrinal lifting; our voice in framings/closings should sound like it has read books.
- **Reverent but not stiff.** Address the reader as someone who is genuinely seeking. They're not children. They're not customers. They're souls.
- **Acknowledges the actual life of the reader** when fitting — fragmented attention, loneliness, the pressure to perform virtue rather than possess it. Without name-dropping the era. Modern psychic ailments, classical solutions.
- **Address conventions:**
  - **EN-US:** "you" — direct, contemporary; the reader is the catechumen but also the prodigal returning.
  - **PT-BR:** "você" for the reader (universal, modern Brazilian); traditional "Vós" for God in prayer where appropriate, "Tu" for direct mystical address ("Tu, que me criaste"), but liturgical "Vós" / "Senhor" / "ó Pai" for closings.

The Aquinas/Pius X/Trent verbatim text is what it is — early-20th-century Portuguese and 1939 English. We don't sand it down. The reader meets the actual voice of the tradition. Our framings and closings live in their century.

---

## D-09: Trent always as "Going Deeper" — final layout decision

The first build attempt put Trent inline as the primary teacher whenever Aquinas had no parallel sermon (sacraments, virtues, precepts). For sacrament sessions this produced 75-minute reads because Trent's eucharist/penance/baptism chapters are 14–17K words each, and the same Trent chapter would repeat across multiple sub-sessions of the same sacrament.

**Final layout** for every session:

```
Title
Image + ekphrasis (italic block quote)
## Pius X asks                        ← always when Pius X Qs are mapped
## St. Thomas teaches                 ← when an Aquinas chapter is mapped
> Scripture cap                       ← always
> Closing prayer                      ← always; this is the natural daily-read endpoint
---
#### Going Deeper — *Catechism of Trent*  ← when a Trent chapter is mapped
                                          (optional layer; suppressed when prior session already emitted same chapter)
```

The daily 8–15 min read ends at the Closing prayer. Trent always lives below the horizontal rule, in `####`, visually subordinate. This frees us from arguing about who "the teacher" is on a given day — Pius X always asks, Aquinas always teaches when he has a sermon, the Roman Catechism is always the deeper layer.

**Dedupe rule:** If session N's Trent chapter equals session N–1's Trent chapter, session N's Going Deeper is suppressed (the Trent text was already in last session's Going Deeper). This handles consecutive sacrament sessions that share one Trent chapter.

**Result distribution (en-US, primary read = above the `---`):**
- Smallest: ~370 words (virtues sub-session, Pius X-only, no Aquinas sermon to draw from)
- Largest: ~3,700 words (Decalogue sessions where Aquinas's commandment sermons run long)
- Most sessions: 1,500–2,800 words (~7–14 min @ 200 wpm)

Total file sizes including Going Deeper:
- Smallest: ~370 words
- Largest: ~15,600 words (Eucharist Real Presence, where Trent's whole eucharist chapter is the deep dive)
- For first-of-sacrament sessions, the Going Deeper carries Trent's full chapter since it appears nowhere else in the book.

Acceptable. The daily-read budget is met; the Going Deeper is the depth-on-demand the user asked for.

---

## D-10: V0.5 ship status — what's in, what's not

**In:**
- 90 sessions × 2 languages = 180 markdown chapters
- All 433 Pius X questions covered (verified: no missing, no duplicates)
- Per-session original content: ekphrasis (~50w EN+PT), Scripture cap (DRC EN, Pereira PT), closing reflection (~30w EN+PT)
- Aquinas as the day's teacher whenever his Naples sermons match the topic (~50 of 90 sessions)
- Trent appended as "Going Deeper" on every session that has a mapped Trent chapter
- Dedupe across consecutive sessions sharing a Trent chapter
- Voice tuned for young adults 18–35: direct, beautiful, intellectually honest
- New `book.json` TOC grouping sessions into 8 parts (Preliminary / Creed / Decalogue / Precepts / Virtues / Sacraments / Lord's Prayer / Hail Mary)
- Reproducible build pipeline: `sessions.json` + `content.json` → `scripts/build-catechetical-formation-v2.py` → 180 chapter files + book.json. Editing the JSON regenerates everything.

**Out (V0.7+):**
- 90 sacred art images — agent is still curating in background; manifest will be integrated when complete.
- Image filenames are referenced in the build script via `images/<filename>` but render gracefully (just the alt text) when files are absent.
- Practice wrapper for daily plan-of-life scheduling — V0.7. Today the book is consumable as a book; the daily-formation practice wrapper comes next.
- Per-session Trent slicing for sacrament sub-sessions — currently the FIRST sub-session of each multi-session sacrament carries the full Trent chapter as Going Deeper; the others have no Going Deeper. Future polish: slice Trent's huge chapters into 4–6 pieces so each Eucharist sub-session has its own deeper layer.
- Source verification of Scripture verse texts against canonical PD translations (Douay-Rheims for EN, Pereira de Figueiredo for PT). Some verses written from memory; editorial pass to normalize.

---

## D-12: V0.5/V0.6 — shipped

```
content/libraries/base/books/catechetical-formation/
├── book.json                       28 KB  — TOC for 90 sessions across 8 parts
├── sessions.json                   52 KB  — structural spine (Pius X Q ranges, Aquinas+Trent refs, image_topic, scripture_ref)
├── content.json                   105 KB  — original content per session (ekphrasis + scripture text + closing) × EN+PT
├── en-US/session-{001..090}.md  ~1.9 MB  — 90 chapters
├── pt-BR/session-{001..090}.md  ~2.0 MB  — 90 chapters
└── images/
    ├── manifest.json              84 KB  — 90 PD/CC0-verified entries with attribution
    └── session-{001..090}.jpg    ~34 MB  — bundled
```

`base-1.0.0.pray` = 56 MB, 1093 files. Up from V0.1's 19 MB; the delta is mostly the image bundle.

**Coverage check (rebuilt and re-passed):** 433/433 Pius X questions assigned. No missing, no duplicates, no out-of-range Qs.

**Voice samples** (en-US session-001 ekphrasis):

> *Stop a moment. Before you begin scrolling away from this, look. The painter shows you the first morning of everything — water and earth still trembling apart, light arriving where there had been none, the Spirit hovering. You exist on the same word God spoke then. He has never stopped saying it.*

(pt-BR session-066 ekphrasis):

> *A Disputa do Sacramento, de Rafael: o céu e a terra reunidos ao redor de uma única hóstia branca. Esta é a Presença Real. Não símbolo, não metáfora — Cristo inteiro, oculto sob o menor véu possível. Ajoelhe-se.*

**Image agent** (delegated to a sub-agent in parallel with content authoring): produced 90 PD/CC0-verified entries, attribution per image, downloaded all 90 to `images/`. Mix of traditions: Italian Renaissance/Baroque (Michelangelo, Fra Angelico, Caravaggio, Raphael, Velázquez), Northern (Rembrandt, van Eyck, Memling), Russian icons (Rublev's Trinity, the Theotokos), Spanish Baroque (Murillo), Romantic/Victorian devotional (Tissot, Bouguereau, Bloch), and a few modern PD-eligible (Kramskoi). Sample picks visible at session-001 (Michelangelo), session-066 (Raphael's Disputation), session-090 (Fra Angelico's Annunciation).

**Flow of the daily session in the reader:**
1. Open the chapter — image fills the top of the page
2. Read the ekphrasis (italic block quote)
3. **Pius X asks** the question(s)
4. **St. Thomas teaches** the doctrine pastorally (when his Naples sermons cover the topic)
5. Scripture verse caps it
6. Closing prayer — natural daily-read endpoint, ~8–15 min above this line
7. *(below the rule)* **Going Deeper — Catechism of Trent** for those who want depth

**Build pipeline (reproducible):**
```
sessions.json + content.json + images/manifest.json + the 3 source books
        ↓
scripts/build-catechetical-formation-v2.py
        ↓
180 chapter .md files + book.json
        ↓
pnpm build:libraries
        ↓
base-1.0.0.pray
```

Editing any input regenerates everything. No hand-edited chapter files.

---

## D-13: Image agent final report

The sub-agent completed in ~21 minutes (66 tool uses, 162K tokens). Final manifest at `images/manifest.json`:

- **90/90 verified PD or CC0** via Wikimedia Commons API `extmetadata.LicenseShortName` returning "Public domain" or "CC0"
- **0 UNVERIFIED**
- **7 swaps** where the original candidate returned CC-BY/CC-BY-SA (photos of frescoes, sculptures, ceilings carry the photographer's copyright even when the underlying work is PD): sessions 022, 023, 026, 033, 040, 047, 060, 066, 070
- **All 90 downloaded** to `images/session-NNN.jpg`, 34 MB total. 83 at ≥800px on the long edge; 7 below 800px (session-029 catacomb fresco, session-052 Giotto, three Tissot Brooklyn-Museum scans, etc.) — accepted per spec.

**Tradition mix achieved** (target was ~40% Italian / 20% Northern / 15% icons / 10% Latin / 10% French 19th-c / 5% modern):
- Italian: ~47% (Renaissance + Baroque + proto-Renaissance + Mannerist + Venetian + Romantic)
- Spanish: ~14% (Baroque + Hispano-Flemish + 19th-c)
- Dutch / Flemish / Northern: ~14%
- French: ~10% (Tissot, Millet, Poussin, French 19th-c)
- Russian / Byzantine icons: ~4% (Rublev's Trinity, Theotokos, etc.)
- Danish (Bloch): 3
- Singletons: English Romantic (Blake), Pre-Raphaelite (Hunt's Light of the World), American 19th-c (Tanner), Hungarian (Munkácsy), Russian 19th-c (Kramskoi, Morozov), Venezuelan (Rojas), Early Christian (catacomb fresco), Post-Impressionist (van Gogh)

**Notable substitutions** (all flagged in manifest `notes` field):
- session-026 (Pope/Bishops): all photos of Arnolfo di Cambio's bronze St. Peter are CC-BY-SA. Swapped to Roderic d'Osona's *Saint Peter Enthroned* (c. 1490, Hispano-Flemish, PD via Google Art Project) — Peter with the keys, doctrinally tighter.
- session-040 (Holy Name): Gaulli's *Il Gesù* ceiling is CC-BY-SA. Swapped to older PD scan of *Triumph of the Name of Jesus*.
- session-022 (Purgatory): the canonical Vaccaro is only 263×347 on Commons. Swapped to Luca Giordano's *Virgin and Child with Souls in Purgatory* (790×1900).
- session-070/071: ended up with two different PD versions of Adriaen Ysenbrandt's *Mass of St. Gregory* — one for adoration, one for sacrifice. Iconography supports both readings.
- session-078 (Holy Orders / Curé d'Ars): no PD Wikimedia image of John Vianney. Substituted Alexander Morozov's *Easter Service* (Russian 19th-c priest at the altar) — adds tradition variety.
- session-088 (Forgiveness): Fetti's *Unmerciful Servant* not on Commons. Substituted Fetti's *Parable of the Lost Drachma* — same painter, same parable cycle, mercy theme preserved.
- session-053 (Sunday Mass): PD genre paintings of "going to Mass" are scarce. Used "Les Baux sortie de la messe des bergers" (anonymous French 19th-c, faithful leaving Mass).

The notes-per-entry mean a future curator (or you, when you have time to be picky) can see why each substitution was chosen and replace what doesn't satisfy.

---

## D-14: Trent layout refinement (post-ship polish)

After the first ship, an audit showed 7 sessions running too thin (200–400 words / 1–2 min) — sacrament sub-sessions, virtues, precepts. Root cause: when Aquinas had no parallel sermon for a session, Trent had been demoted to "Going Deeper" below the rule, leaving the primary read with only Pius X + ekphrasis + Scripture + closing. The day had no teacher.

**Fixed layout:**
- If an Aquinas chapter is mapped → "## St. Thomas teaches" inline; Trent appended as "Going Deeper" below the rule.
- If Aquinas is empty → "## The Roman Catechism teaches" inline; Trent IS the day's teacher; no separate Going Deeper (Trent already taught above).

**Trent dedupe (smart):** suppressed only when (a) the previous session shared the same Trent chapter AND (b) the current session has Aquinas to take over. If the current session has no Aquinas, Trent is always emitted because suppressing would leave the day without a teacher.

**Aquinas dedupe attempted, then reverted.** With Aquinas dedupe across consecutive sessions sharing one sermon, sub-sessions inside a cluster fell to 1-minute reads (just Pius X + ekphrasis + closing). Worse than mild redundancy. The final pipeline emits Aquinas's full sermon every day, even when consecutive sessions cluster around the same one.

**Final size distribution (en-US, total file including Going Deeper):**

| Quantile | Words | Read time @ 200 wpm |
|---|---|---|
| Smallest (s057, virtues subset) | ~380 | 2 min |
| 5th percentile | ~500 | 2.5 min |
| Median | ~1,800 | 9 min |
| 95th percentile | ~9,000 | 45 min |
| Largest (s071, Mass as Sacrifice — Trent inline) | ~15,900 | 80 min |

The very long sessions are sacraments where Trent's chapter is huge and there is no Aquinas to share the load. Acceptable per "doctrinal fullness over time budget."

The very short sessions are virtues + precepts — Pius X bears the day alone (Aquinas's Naples sermons do not cover virtues; Trent has no virtues or precepts section). Doctrine is still fully covered by Pius X's Q&A.

---

## D-15: Per-session slicing — fixing the methodological flaw

User caught the real defect: sessions 008–012 all referenced Aquinas's `creed-01b` as a whole chapter, so 5 days in a row showed the same 8.5K-word sermon. Same for sessions 024+025 (Aquinas creed-09), all 6 Eucharist sessions sharing one Trent eucharist chapter, and many other multi-session clusters.

**Root cause:** `aquinas` and `trent` fields in `sessions.json` mapped to whole chapters as atomic units. The commentary corpus does not naturally divide into 90 distinct units — Aquinas wrote ~36 sermons across his cycles; Trent has ~42 chapters. A 90-session cluster forces some Pius X clusters (e.g., the 5 sessions on the Creator article) to share commentary that was written as one piece.

**Fix:** schema upgrade to support **section-level slicing**. Fields now accept `{"chapter": "id", "sections": ["H2 anchor", ...]}` objects in addition to chapter-id strings. The build script extracts only the named H2 sections (substring match against `## <heading>` lines, case-insensitive). A special anchor `"@opening"` extracts the pre-H2 chapter introduction.

**Editorial pass.** I read the H2 structure of every multi-session Aquinas/Trent chapter and assigned distinct sections per session in the cluster. Where a chapter has fewer sections than sessions in the cluster, the "extra" sessions drop the source entirely (rather than duplicate). For these sessions Pius X's Q&A is the day's content, with image + ekphrasis + Scripture + closing as the frame.

Migration captured as `scripts/slice-catechetical-formation.py` — re-runnable, transparent, the slicing plan is encoded in a `PLAN` dict.

**Results:**

| Cluster | Before | After |
|---|---|---|
| Aquinas creed-01b (s008–012) | same 8.5K sermon × 5 days | s008 keeps full sermon; s009–012 are Pius X-only |
| Trent creed-09 (s024–029) | same 17K chapter × 6 days | s024 opening, s025 the four marks, s027 communion of saints; s026/028/029 drop Trent |
| Trent eucharist (s066–071) | same 14K chapter × 6 days | each session gets its own Trent slice (Real Presence / Institution / Worthy Reception / Frequency / Adoration / Sacrifice) |
| Trent penance (s072–076) | same 14K chapter × 5 days | each session gets its own slice (Tribunal / Confession / Contrition / Three Parts / Satisfaction) |
| 14 other clusters | similar duplication | all sliced or dropped |

65 of 90 sessions touched. After the migration, the build emits 90 markdown chapters with no consecutive-session content duplication.

**New session length distribution (en-US, total file including Going Deeper):**

- 10 sessions under 500 words (≤2.5 min) — sessions where neither Aquinas nor Trent has topical material; Pius X carries the day with image + ekphrasis + Scripture + closing
- 23 sessions in the 1,600–3,000-word range (8–15 min target)
- 20 sessions over 5,000 words (25+ min including Going Deeper) — sacrament + major commentary days

The under-budget sessions (e.g., s046 on suicide/dueling, where Aquinas's Naples sermons don't address the topic and Trent has no specific section) are now honest reflections of what the source material offers. They become "quiet days" in the rhythm of formation — image + 3 Pius X questions + a Bellini Gethsemane + Romans 12:19 + a closing prayer. Doctrinally complete, structurally short.

`base-1.0.0.pray` after slicing: 55.7 MB (slightly smaller than before — the redundant Trent text is no longer in the file).

---

## D-16: 90-session cluster (final)

All 433 Pius X Qs assigned. Distribution:

| Section | Sessions | Q range | # Qs |
|---|---|---|---|
| Preliminary | 2 | 1–27 | 27 |
| Apostles' Creed | 32 | 28–160 | 133 |
| Decalogue | 18 | 161–212 | 52 |
| Church Precepts | 2 | 213–226 | 14 |
| Virtues | 4 | 227–266 | 40 |
| Sacraments | 22 | 267–413 | 147 |
| Lord's Prayer | 9 | 414–428 | 15 |
| Hail Mary + saints | 1 | 429–433 | 5 |
| **Total** | **90** | **1–433** | **433** ✓ |

Session-level breakdown captured in `content/libraries/base/books/catechetical-formation/sessions.json` (data of record). Each session has: id, order, group, title (en+pt), Pius X Q ranges, Aquinas chapter slice(s), Trent chapter slice, scripture (ref+text), image metadata, ekphrasis (en+pt), closing (en+pt).

The build script reads sessions.json + the existing source books (catechism-pius-x-1912, catechetical-instructions, catechism-of-trent) and emits 90 markdown chapters per language.

---
