# TTS bake-off

**Question.** Can Ember's prayers, the Bible and the rest of the corpus be voiced well enough to listen to, in English, Brazilian Portuguese and Latin, and at what cost: on one consumer GPU for free, or with a paid service?

**Where things stand (2026-10-14).**

- English is solved locally. Qwen3-TTS on this machine voices a cast-read book at no cost. Fourteen books are done, about 22 hours, and the dramatized English samples were judged "great".
- Brazilian Portuguese is not solved locally. Every open model either has no Brazilian accent or loses it when cloning. ElevenLabs v4 is the only option that sounded right.
- On ElevenLabs, voices from its English library speak Portuguese with no accent. That opens a library of thousands of voices, against about 150 Brazilian ones.
- Latin has no engine anywhere. Respelling it for an Italian voice gets about 85–90% of words pronounced the church way.

Open choices are listed under [Still open](#still-open).

On 14 October the other local models' environments, their weights and all audio they made were deleted to free the disk. Qwen3-TTS and the Whisper check remain, with the English books and everything voiced on ElevenLabs. The scripts for every model remain, so any of them can be reinstalled.

Everything below was run on an RTX 4070 Ti (12 GB), a Ryzen 9 7900X and 62 GB of RAM, between 5 and 14 October 2026.

## Contents

1. [The Rosary bake-off: six local models](#1-the-rosary-bake-off-six-local-models)
2. [Latin](#2-latin)
3. [Dramatized books](#3-dramatized-books)
4. [The Portuguese accent](#4-the-portuguese-accent)
5. [ElevenLabs](#5-elevenlabs)
6. [The Rosary, three ways](#6-the-rosary-three-ways)
7. [What it costs](#7-what-it-costs)
8. [Competitors to ElevenLabs](#8-competitors-to-elevenlabs)
9. [Lessons](#9-lessons)
10. [Still open](#still-open)
11. [Files and how to run them](#files-and-how-to-run-them)

## 1. The Rosary bake-off: six local models

The Glorious Mysteries, scripted from `content/practices`, voiced by six open models in English, Portuguese and four Latin variants. A Whisper large-v3 transcription of each clip, scored against the text, was the only automatic measure.

| Model | Licence | Languages | Speed on this card | VRAM | Verdict |
| --- | --- | --- | --- | --- | --- |
| Kokoro 82M | Apache 2.0 | en, pt-BR, it, … | about 8× real time on the CPU | none | Genuinely Brazilian, but only three pt-BR voices |
| Chatterbox | MIT | 23, incl. pt, it | 3.5× | 4–6 GB | Clones a voice; keeps no Brazilian accent |
| Voxtral TTS 4B | CC BY-NC 4.0 | 9, incl. pt, it | 2.7× | 11.6 GB | Non-commercial |
| Qwen3-TTS 1.7B | Apache 2.0 | 10, incl. pt, it | 1.0–1.5× (5–7× in batches) | about 6 GB | Best English; European-sounding Portuguese |
| Breeze TTS 2 | research, non-commercial | en and zh only | 0.7–1.0× | 8.8 GB | Forced onto Portuguese: 36% words wrong |
| Fish Audio S2 Pro | research, non-commercial | 80+, incl. pt, it, la | 0.66× | 10 GB | Changes speaker every clip unless cloning |

- English transcribes essentially word-perfect on every model, and Portuguese at about 1–3% word error. Transcription cannot rank them; it only catches broken clips.
- Fish S2 Pro without a reference clip is a different person on every line, and it stopped early on 3 of 575 clips.
- A voice designed once with Qwen can be cloned by Chatterbox and Fish, which gives one voice across models and languages.
- We used the 1.7B Qwen models throughout (VoiceDesign, CustomVoice and Base), not 0.6B.
- ElevenLabs v4 voiced the same Rosary as the paid yardstick (`synth/eleven_v4.py`).

## 2. Latin

No engine has a Latin voice. Four approaches were tried on the same Rosary:

| Variant | What it is |
| --- | --- |
| `la-raw` | The corpus spelling, read by an Italian voice |
| `la-plain` | The same with the stress accents removed |
| `la-ital` | Respelled so an Italian reader says it the Roman way (`build_script.py`, `latin_italianized`) |
| `la-ipa` | Phonemes from a rule-based ecclesiastical-Latin converter (`latin_g2p.py`), for engines that accept phonemes |

- Read from the corpus spelling, every model says *cælis* the classical way ("ka-elis").
- The Italian respelling or the phonemes bring about 85–90% of those words back to the church pronunciation, on Kokoro, Qwen and Voxtral alike. Fish follows the respelling less reliably.
- Whisper's Latin is weak, so Latin scores rank approaches; they are not error rates. Scoring folds spellings together (æ, e) and probes "ae said as e" separately, or correct church pronunciation counts as an error.

## 3. Dramatized books

A book read by a cast: a narrator plus a voice per character, each line cloned by Qwen from its character's reference clip.

**Pipeline** (`drama/`):

1. `prepare.py` writes the verses of an edition: Douay-Rheims (`en`), Matos Soares (`pt-ms`), Ave Maria (`pt-am`, copyrighted, so everything derived from it stays under the gitignored `consult/`). It strips footnote asterisks, soft hyphens and parenthesised references.
2. Agents label who speaks, chapter by chapter, following `LABELLING.md`. `check_attribution.py` proves the labelled spans join back into each verse exactly.
3. `build_utterances.py` joins spans into lines, breaks at pericopes, removes quotation marks, writes chapter numbers as words, and names each clip by a hash of voice and text, so a re-cut only re-voices what changed. A per-edition `fixes` list mends scanning slips for the ear only.
4. `synth.py` voices the lines (Qwen, batches of six, generation length capped, implausible paces redrawn).
5. `check_audio.py` transcribes every clip; `--redo` deletes suspect ones so the next synth run redraws them with a new seed.
6. `stitch.py` assembles each chapter with pauses: 2600 ms before a new pericope, 650 ms when the speaker changes, 450 ms when the same voice goes on, 300 ms after "he said:", 1400 ms after the chapter title, 1800 ms at the end.

`book.sh` runs the whole chain for a book; `finish.sh` resumes from the redraw step.

**Done in English:** Genesis, Exodus, Ruth, Tobias, Judith, Esther, Job, Jonas, Matthew, Mark, Luke, John, Acts and the Apocalypse. About 22 hours, voicing at five to seven times real time. Library page: `out/_listen/livros/`.

**Done in Portuguese:**

- Mark in full in Matos Soares and Ave Maria with Qwen voices. They sounded European, and that audio was deleted on 14 October.
- Mark 1 in many voice and engine trials (section 4).
- Job 20–42 in Matos Soares on ElevenLabs (section 5).

**What the books taught:**

- One cast across every book (`cast.json`), overridden per book (`<book>/casting.json`). A speaker not listed gets a voice from the gender, age and kind the labeller recorded.
- The longer pause between pericopes was the single biggest improvement to the listening.
- The corpus text has slips that only become obvious aloud. Found and fixed for the audio only, with `say`: John 16:1 (a duplicated phrase), John 17:1 (missing "Father,"), Luke 4:4 (missing "It"), Exodus 23:22 ("hear hi voice"). Matos Soares Mark had scanning slips ("disse-Ihe", "E m qualquer", "doa sapatos", "Imediamente", "lhe linha feito").
- Job in Matos Soares is full of the translator's bracketed supplies ("(Deus) enviará"). They are read as part of the sentence, with only the brackets dropped, and the old spelling "Job" is said "Jó".
- Labelling the Portuguese Job from the English labels worked verse by verse: the versification is identical (both follow the Vulgate), and only two verses needed a manual split.

## 4. The Portuguese accent

This took most of the effort, and it is the reason the project moved to ElevenLabs.

| Trial | Result |
| --- | --- |
| Qwen voice design, asking for Brazilian | European Portuguese |
| Qwen voice design, redesigned, asking for São Paulo | "Portuguese, a little bit Carioca" |
| Qwen cloning Kokoro's Brazilian voices | Still not Brazilian; three voices only |
| Qwen cloning ElevenLabs-designed Brazilian voices | The *chiado* (the "sh" sound of European and Carioca speech) survives: the accent comes from Qwen's own Portuguese, not the reference |
| Chatterbox (multilingual and the pt-BR finetune) cloning the same voices | No better by ear (1.4% and 2.9% words misheard) |
| Kokoro directly, cast built by blending its three Brazilian voices with other languages' voices | Right accent, thin cast (0.5%) |
| ElevenLabs v4, designed Brazilian voices | Right accent, but voices "esganiçadas": strained, not restful |
| ElevenLabs v4, real Brazilian voice actors from the library | Calmer |
| ElevenLabs v4, English library voices speaking Portuguese | Accent-free, "works perfectly" |

- Qwen's cloning takes no instructions: accent, pace and mood all come from the reference clip, and a style tag does nothing. Its voice design always lands on European Portuguese.
- Whisper's word error rate cannot hear an accent. Every trial scored 0.5–3%; only listening decided.
- Very short Portuguese lines can make Qwen run on for minutes of noise unless `max_new_tokens` is capped. A line can also come out as noise of a plausible length, which only the transcription check catches.

## 5. ElevenLabs

**Setup.** The key is `ELEVENLABS_API_KEY` in the gitignored `.env` beside this file. `drama/eleven.py` wraps the calls: voice design, saving a voice, speech, usage.

**What the API does well:**

- **Voice design** (`/v1/text-to-voice/design`) returns three candidates per description. Descriptions follow their guide: language and region first, then gender, age, quality, a persona, two or three emotions, and a sentence on timbre and pace. Asking for "grave", "stern", "ringing" produced the strained voices; asking for low, relaxed, unprojected voices works better.
- **The library**: about 150 Brazilian voices, and thousands of English ones. Adding one to the account takes a voice slot. The voice belongs to its actor, who can withdraw it with notice (usually two years).
- **English voices speak Portuguese without an accent on v4.** The working cast is in `drama/voices/el-library.ids.json` (Mark) and `el-job.ids.json` (Job).
- **Dialogue mode** (`/v1/text-to-dialogue`) voices a whole scene in one call, the voices taking turns. Tried on Mark 1:21-28; it works on v3 and v4. The trade-offs: the model decides the pauses, and one bad line means redoing the scene.
- **Audio tags** like `[whispers]` work on v4 (`style_trial.py`). Qwen has no equivalent.

**Things measured:**

- **Rate:** v4 charges 110 credits per 1,000 characters through the API while the launch discount runs (it ended 12 October 2026). At the regular price that is about 400.
- **The usage counter lags** a minute or more after a call, sometimes several minutes. Measure cost by polling after a pause, never right after the call; an early reading undercounted one chapter by half.
- **The web app (Studio) is dearer than the API.** The pricing page gives text to speech in the app as 1 credit per character, so playing in the Studio burns credits 2.5–9× faster than the same text through the API.
- **Plan fees are prepaid API usage at the list price.** The "characters included" on the pricing page are the fee divided by the per-character price, on every tier, with no volume discount below Enterprise. A bigger plan buys voice slots, concurrency and features, not a better rate.
- **Starter cannot buy extra credits**; Creator and above can.

**What was voiced:**

- Mark 1 in many casts: designed voices, Brazilian library voices, English library voices, v4 and v4 Turbo.
- Job 20–42 in Portuguese (65 minutes, 1.6% words misheard, about 5,700 credits) and Job 20–28 in English, stopped part-way.
- The Rosary three ways (section 6).
- The account stood at about 31,100 of 40,000 credits used on 12 October. The whole month cost $1, the Starter first-month price.

## 6. The Rosary, three ways

`rosary_day.py` voices a Rosary for the day, in both languages, three ways, all from one set of clips:

- **A.** One voice prays everything.
- **B.** A leader says the first half of each prayer and one woman answers.
- **C.** The leader is answered by a small group: four voices (two women, two men) recorded separately and mixed here, each stretched to the same length and started a few tens of milliseconds apart.

A narrator announces each mystery and reads its meditation in all three. Each Hail Mary half is recorded in five takes per voice and rotated, so neighbouring Hail Marys are never the same recording. Each prayer is voiced once per voice and reused, so a different day's Rosary only needs its five mysteries and meditations.

The Joyful Mysteries in both languages cost about 17,700 characters, roughly 2,000 credits. English came back word-perfect on the check, Portuguese at 0.5%. The one flag: in the Portuguese "Salve, Rainha", Whisper hears "ranha" on every take, so the leader's voice may swallow that vowel. Page: `out/_listen/terco/`.

## 7. What it costs

Portuguese text in the corpus, counted from `content/`, priced at ElevenLabs' regular rates and at the cheaper competitors' (section 8):

| Part | Characters | v4 ($0.08 per 1,000) | v4 Turbo ($0.04) | Cheaper rivals (~$0.018) |
| --- | --- | --- | --- | --- |
| Bible (Matos Soares) | 4.4 M | $352 | $176 | $79 |
| Practices and prayers | 1.5 M | $120 | $60 | $27 |
| Missal (incl. lectionary) | 4.9 M | $395 | $197 | $89 |
| Books (26 titles) | 14.5 M | $1,160 | $580 | $261 |
| Short chapters | 0.3 M | $26 | $13 | $6 |
| Liturgy of the Hours (Brazil) | 5.2 M | $419 | $210 | $94 |
| Divinum Officium, Portuguese | 1.5 M | $121 | $61 | $27 |
| **Total** | **32.4 M** | **~$2,590** | **~$1,300** | **~$580** |

English (54 million characters without the Catholic Encyclopedia's 90 million) would be about $4,300 on v4, but English can be voiced locally for nothing.

How to read the table:

- **Redraws:** add 10–20% for lines that need a second take.
- **Practices:** the figure counts every seasonal variant, so it is an upper bound, since each distinct text is voiced once and reused.
- **Liturgy of the Hours:** half of it is the Office of Readings.
- **Rule of thumb:** at regular prices, finished audio costs about $3 per hour on the Starter plan, or $4.80 at the list API price.
- **Grants:** ElevenLabs' Startup Grants Program offers 33 million characters free for 12 months, which would cover the whole Portuguese corpus. Apply before paying for a large run.

**Promotions are rare and tied to model launches:**

- v3's alpha (5 June 2025) ran 80% off in the web app to the end of that month.
- v4 (28 September 2026) ran 72% off for two weeks.
- The rest of the time there are only first-month discounts (Starter $1, Creator $11) and two months free on annual billing.

## 8. Competitors to ElevenLabs

Artificial Analysis' blind-listening arena, October 2026. Elo on the company's own voices, then on a fixed set of cloned voices:

| Model | Own voices | Cloned voices | Price per 1,000 characters |
| --- | --- | --- | --- |
| Eleven v4 Turbo | 1327 | 1168 | $0.04 |
| Eleven v4 | 1323 | 1160 | $0.08 |
| Qwen-Audio 3.1 TTS Plus (Alibaba, hosted) | 1298 | 1185 | ~$0.019 |
| Cartesia Sonic 3.6 | 1284 | not seen | ~$0.049 |
| Gemini 3.8 Flash TTS | 1272 | 1049 | ~$0.017 |
| HeyGen Voice | not seen | 1200 | ~$0.03 |
| Inworld Realtime TTS-2 | not seen | 1144 | ~$0.021 |

- A 40–50 point gap is a mild preference. v4 Turbo is level with v4 at half the price and should be compared by ear first.
- Cartesia's Sonic led the Portuguese arena when it was announced, before v4, with ElevenLabs in the top three. Whether the voters were Brazilian is unknown.
- The hosted Qwen-Audio is not the open Qwen3-TTS we ran; whether it shares the accent problem is unknown.
- ElevenLabs' real advantage for a cast is its voice library.
- Not checked for any competitor: whether their terms allow distributing the audio in an open app.

## 9. Lessons

**On judging quality**

- Only listening ranks voices. Whisper's word error rate is a guard against broken clips: noise, truncation, run-ons, wrong words. It cannot hear accent, warmth or strain.
- Whisper's false alarms are predictable: hyphenated Portuguese forms ("Segui-me" heard as "Seguime") and proper names. Its Latin is unreliable.
- Judge a change on one chapter (Mark 1), and voice a whole book only once the sample is approved. A full-book run costs 15 minutes or more of GPU time per variant, and the feedback that matters comes from a short sample.

**On the local models**

- Clone, don't design per line. A designed voice drifts; cloning a fixed reference clip keeps one person per character across a book.
- The reference clip is everything for Qwen: accent, pace and mood come from it, and no instruction overrides them.
- Batch generation by similar length, cap the generation length, and redraw clips whose pace is implausible (outside 5–24 characters per second).
- Model environments are large: about 6–18 GB each, 50 GB for six models. Delete an engine once it has lost.

**On ElevenLabs**

- Use the API, not the web app, for anything sizeable.
- Read usage only after the counter settles.
- Spend discounted credits while the discount lasts. Clips are cached by content, so anything voiced is never paid for twice.
- Order a long run chapter by chapter, so running out of credits leaves whole chapters and the run resumes where it stopped.
- Three requests at a time is the Starter limit; more gets refused.

**On running things here**

- Share the GPU through `flock /tmp/ember-tts-gpu.lock`.
- Background jobs are cut off at two hours; split long chains (`finish.sh`).
- Never `pkill -f` with a broad pattern: it matched the agent's own shell twice and once killed the session. Stop jobs by their task id or exact process id.
- Two scripts with the same name in different folders shadow each other on import (`verify.py`, `assemble.py`), hence `check_audio.py` and `stitch.py`.
- Kokoro needed `transformers>=4.45`, `tokenizers>=0.20`, the system espeak-ng (the bundled one points at the build machine's path) and a spaCy model. faster-whisper's PyAV was incompatible, so audio is decoded with ffmpeg instead.
- The listening pages are served on the LAN with `npx http-server out/_listen -p 8765 -a 0.0.0.0 -c-1`, reachable at 192.168.15.23 or over WireGuard at 10.99.99.1.

## Still open

- **The Portuguese cast:** narrator, Jesus and the other roles, chosen by ear from the English library (`/narradores/`, `/mark-pt-ms-el-library/`).
- **Line by line or scene by scene:** whether dialogue mode sounds better enough to give up control of the pauses.
- **The Rosary:** which version, A, B or C.
- **The Portuguese "Rainha":** whether it really is swallowed in the Rosary.
- **Respelling:** whether the European spellings in Matos Soares ("connosco", "baptizados", "dum") need respelling for the Brazilian ear.
- **Where it goes in the app:** clips keyed by a hash of voice and text, so the content-addressed corpus syncs them for free, with lazy generation through a Cloudflare Worker and R2.
- **Grants:** whether to apply for the ElevenLabs startup grant.
- **Competitors:** a side-by-side of Mark 1 on v4 Turbo, Gemini Flash TTS and Cartesia, which needs API keys for the last two.

## Files and how to run them

| Path | What it is |
| --- | --- |
| `build_script.py`, `latin_g2p.py` | Rosary scripts per language variant; the Latin converter |
| `synth/<model>.py`, `synth/common.py` | One synthesizer per local model, plus ElevenLabs |
| `assemble.py`, `index.py`, `verify.py` | Stitch the Rosary, write its page, transcribe and score |
| `rosary_day.py` | The Rosary for a day, three ways, on ElevenLabs |
| `drama/edition.py` | `BOOK`, `EDITION`, `VOICESET`, `CHAPTERS`: which text, which cast, which chapters |
| `drama/prepare.py` … `drama/stitch.py` | The book pipeline (section 3) |
| `drama/design_voices.py`, `drama/design_eleven.py`, `drama/library_eleven.py` | Voice design (Qwen, ElevenLabs) and library auditions |
| `drama/synth_eleven.py`, `drama/synth_chatterbox.py`, `drama/synth_kokoro.py` | Other engines for the same lines |
| `drama/voices/<set>/` | Reference clips per cast; `*.ids.json` are ElevenLabs voice ids |
| `drama/library.py`, `drama/night_page.py` | The book library page, the options page |
| `out/` | All audio (gitignored), with pages under `out/_listen/` |
| `envs/` | Virtual environments: `qwen3-tts` and `verify` (Whisper) remain; the others were deleted |

Typical runs:

```sh
# A book in English, end to end, on the local model
BOOK=luke EDITION=en drama/book.sh

# One chapter of a trial cast
BOOK=mark EDITION=pt-ms CHAPTERS=1 VOICESET=el-library ELEVEN_CAST=el-library ELEVEN_MODEL=eleven_v4 python3 drama/synth_eleven.py
BOOK=mark EDITION=pt-ms CHAPTERS=1 VOICESET=el-library python3 drama/stitch.py

# Today's Rosary
python3 rosary_day.py joyful
```
