# Denis the Carthusian

**Question.** Can the *Opera Omnia* of Dionysius Cartusianus (Montreuil/Tournai, 1896–1913, 42 volumes, all in Latin) be brought into the corpus as faithful text? It exists only as page scans, and the OCR that ships with them is unusable.

**Where things stand (2026-10-18).** An OCR bake-off on five pages. Two engines are good enough to build on:

- **dots.mocr** runs locally on the RTX 4070 Ti at no cost. It has 0.84% character error and keeps every æ/œ, but drops italics. Doing all 25,610 Internet Archive pages would take about 37 hours.
- **Claude Sonnet 5.5** is near-perfect (0.04%) and keeps italics. At Batch API rates it would cost an estimated $300 for the same pages.

Nothing is in `content/` yet. Which engine to use, and how to split the volumes into books, are still open.

## The edition

Source list: [The Online Books Page](https://onlinebooks.library.upenn.edu/webbin/metabook?id=denisworks). `volumes.txt` has the 36 volumes on the Internet Archive with their page counts. Volumes 37–41 and 14bis are only on HathiTrust, which serves page images to US addresses only (403 from here).

Each page is set in two columns, with a running head, A–D section letters in the gutter (Migne-style citations point to them), and scripture references in the outer margins. Italics mark the text being commented on: the verse, the Areopagite, the Sentences. The volumes Google scanned (33–36) are sharp; the Cornell scans (the rest) are often faded in the upper third of the page.

The OCR shipped with the scans is unusable. On the Cornell scans it reads across both columns, so a line comes out as `raiii |)riC(C(lci'c iiiiiinalia`. On the Google scans the columns are right but every ligature is lost (`quæ`→`que`, `naturæ`→`nature`) and drop caps vanish.

## The bake-off

Five pages from five volumes: a faded commentary page (vol. 1), the Psalms (6), the pseudo-Dionysius (15, with a Greek word), a sermon (29) and a Google scan (33). `samples/` holds the reference transcriptions, written from zoomed column crops. `prompt.md` is the instruction given to the Claude engines. `score.py` gives character and word error rates after normalising markup and punctuation spacing, and counts the æ/œ words kept.

| Engine | Where | CER | WER | æ/œ kept | Italics | Speed |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Sonnet 5.5 | API | **0.04%** | 0.17% | 96/96 | yes | ~16 s/page per request |
| dots.mocr (3B) | local, vLLM | **0.84%** | 1.35% | 96/96 | no | 5.2 s/page at 8 concurrent |
| Chandra OCR 2 (FP8) | local, vLLM | 2.02% | 4.64% | 83/96 | yes | 27 s/page |
| Claude Haiku 4.5 | API | 15.72% | 25.66% | 46/96 | partly | ~60 s/page |
| olmOCR 2 (7B FP8) | local, vLLM | 20.32% | 24.52% | 20/96 | no | 17 s/page |

- **The references were made by a Claude model too**, so Sonnet's near-zero score may hide misreadings the two share. Before choosing, any page where Sonnet and dots.mocr disagree should be settled against the image.
- **dots.mocr**'s remaining errors are real misreadings: `condolendum`→`condolences`, `peccatorum`→`pecatorum`, `(13)`→`(15)`. It also leaves a few line-end hyphens in place, and on the Google page it put one block in the wrong order. Its layout JSON gives each block a bounding box. `ocr_local.py` uses that to set the margin references aside (`<!-- margin: … -->`), strip the gutter letters, and rejoin paragraphs split by the column break. Before that post-processing it scored 2.00%.
- **Chandra** silently classicises the Latin: `judicare`→`iudicare`, `cœlum`→`cælum`, `exstiterunt`→`extiterunt`, `quorumdam`→`quorundam`. That rules it out, because spelling must stay as printed.
- **Haiku** invents plausible words (`deprompsit`→`composuit`, `habemus`→`habebat`), repeats lines across the column break, and writes `ae` for `æ`.
- **olmOCR** dropped a whole column on two of the five pages and writes `ae` for `æ`.
- **Mistral OCR 4.1** was not tried: it needs a `MISTRAL_API_KEY`. At about $2 per 1,000 pages in batch, it would cost about $60 for the set.

## Still open

- **Engine.** Options: dots.mocr alone, free but without italics; Sonnet alone, about $300 in batch; or dots.mocr everywhere with Sonnet only on the pages where it is unsure. The last keeps italics only if Sonnet re-reads every page with italics, which in the commentaries is nearly all of them.
- **Volumes 37–41 and 14bis** need HathiTrust access from a US address, or another copy of the scans.
- **Splitting the set into books.** One book per work, not per volume: the minor works (vols. 33–41) hold about 150 treatises. The Latin is the canonical language; there are no translations.

## Files and how to run them

```bash
uv venv -p 3.12 .venv && uv pip install -p .venv vllm pillow rapidfuzz openai beautifulsoup4 markdownify pydantic-settings python-dotenv
uv pip install -p .venv --no-deps chandra-ocr olmocr     # only for their prompts and post-processing
./serve.sh dots                                         # or olmocr / chandra; one at a time on 12 GB
.venv/bin/python ocr_local.py dots scans/*.jpg --parallel 8
.venv/bin/python score.py                               # every engine under out/
```

- `scans/` and `out/` are gitignored.
- A sample page comes from `https://archive.org/download/<id>/page/n<N>.jpg`.
- vLLM needs `VLLM_USE_FLASHINFER_SAMPLER=0` here, because flashinfer's sampler compiles with nvcc and this machine has none.
- On 12 GB, every model also needs its image budget capped (`--mm-processor-kwargs max_pixels`), or the vision-encoder profiling runs out of memory before the server starts. `serve.sh` has the settings that worked.
