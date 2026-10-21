# Denis the Carthusian

**Question.** Can the *Opera Omnia* of Dionysius Cartusianus (Montreuil/Tournai, 1896–1913, 42 volumes, all in Latin) be brought into the corpus as faithful text? It exists only as page scans, and the OCR that ships with them is unusable.

**Where things stand (2026-10-18).** The method is settled, in two passes:

1. **dots.mocr drafted every page** on the local RTX 4070 Ti, at no cost: 39 volumes, 28,212 pages, between 18 and 21 October 2026, as a systemd service that survives a power cut (see [Running the full drafts](#running-the-full-drafts)). 96 pages (0.34%) still fail: the model loops on them even on the retry pass, at a higher token cap and temperature 0.3. `draft_with_claude.py` transcribes those from scratch with a lean Sonnet call (the bake-off's `prompt.md`), and writes the same files a dots.mocr page has, plus a `.source` marker. That way assembly and proofreading need no special case. Of the 96, 66 have text, 24 are blank leaves, and 6 are scans whose print cannot be read (faded, grey, one with a hand over the page). One of those 6 is covered by a retaken capture, which leaves **5 real gaps**; all are listed in [`gaps.tsv`](gaps.tsv) with the blank leaves Claude described. Claude first answered the unreadable pages in prose ("I can't transcribe this page…"). The prompt now asks for an `unreadable` marker, and prose is caught either way, so neither reaches a draft.
2. **Claude Sonnet proofreads each draft** through the Claude Code subscription: one lean `claude -p` call per page, with the page cropped to its text, returning only a list of fixes. The result scores 0.03% character error with italics restored, slightly better than Sonnet transcribing alone (0.04%). It costs about $0.03 per page at API rates, around $770 for the set, paid from subscription limits.

**The pilot is in the corpus (2026-10-19):** *Enarratio in Genesim* (vol. 1, pp. 1–469) as `content/books/denis-opera-omnia/commentaries/genesis/`: the preface and 103 articles, about 248,000 words, with the table of contents grouped by chapter of Genesis. See [The Genesis pilot](#the-genesis-pilot).

## The edition

Source list: [The Online Books Page](https://onlinebooks.library.upenn.edu/webbin/metabook?id=denisworks). `volumes.txt` has the 36 volumes on the Internet Archive with their page counts. Volumes 37–41 and 14bis are linked only to HathiTrust, which serves page images to US addresses only (403 from here). Volumes 38, 39 and 41 turned up on the Internet Archive anyway, in a University of Illinois series the source page does not link (`operaomnia38deni`, `operaomnia39deni`, `operaomnia41deni_0`); their title pages confirm Tomus XXXVIII, XXXIX and XLI, *Opera minora*, and they are now in `volumes.txt`. Still missing: **37, 40 and 14bis**. They are not on the Internet Archive under any name (searched by title, creator and identifier, and every unlabelled Google scan identified by its title page; those all duplicate volumes already here). Gallica holds one digitized item of the edition but blocks automated access. A Boston College series (`doctorisecstatic19deni` to `…25deni2`) duplicates 19–25 and adds 25 *bis*, an index to the *Sentences* commentaries, left out.

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

## The Claude check

On the subscription, the budget is usage limits, not dollars. That changed the design, because the cost of an agent is dominated by its own setup. All figures are from each call's own usage records, priced at API rates as a common yardstick (`agent_tokens.py` totals a subagent's transcript; `claude -p` reports its usage directly).

| Setup | CER | Cost per page |
| --- | --- | --- |
| Subagent, one page each | 0.04% | ~$0.27 |
| Subagent, 5 / 10 / 20 pages each, fixing the dots.mocr draft | 0.11% | $0.09 / $0.073 / $0.066 |
| `claude -p`, one page per call, whole page | 0.11% | $0.039 |
| **`claude -p`, one page per call, page cropped to 1600 px, tuned prompt** | **0.03%** | **$0.030** |

- **A subagent carries about 60k tokens of system prompt** before it reads a page. Putting more pages in one agent barely helps, because each page's image and draft stay in context and are re-read at every later step.
- **`check_pages.py` runs a stripped `claude -p`**: the fix-list instructions (`fix-prompt.md`) as the whole system prompt, the Read tool only, no MCP servers, no settings, run outside the repo so CLAUDE.md and memory don't load. That is about 3.5k tokens of overhead. `--bare` would be leaner, but it accepts only an API key.
- **Fixing a draft rather than transcribing** cuts output from about 1.5k to under 1k tokens a page. `apply_fixes.py` applies the fixes and skips any whose search text is missing or not unique, so a bad fix can never land in the wrong place.
- **Cropping to the text block** (taken from dots.mocr's layout boxes) shrinks the image. At 1200 px one fix that fell on a line break (`possu-|mus`) was missed, so 1600 px it is.
- **Lower effort** saved little output and fumbled fixes; default effort stays.
- **Most of the remaining cost is cache writes.** Claude Code writes each page to cache with a 1-hour lifetime, at twice the input price, though the page is never read again.
- **The clean-up in `ocr_local.dots_markdown`** also matters. It moves reference-only blocks to the margin note and drops lone A–D letters. It also rejoins leftover line-end hyphens, so Sonnet has less to fix.

## The Genesis pilot

`works/genesis.json` describes the work: volume, leaf range, place in the corpus, metadata. `assemble.py` applies the fixes, joins the pages, cuts the text at the author's headings and writes `book.json`; `check_pages.py --volume … --leaves …` ran the check (via `denis-check.service`, which retries every 30 minutes if the usage limit is reached).

- **Usage.** 483 pages, $16.30 at API rates ($0.034 a page). During the run the 5-hour session meter went from 16% to 54% and the weekly one from 13% to 15%. Other sessions were running too, so these are upper bounds. That puts the whole set (~25,600 pages) at no more than about one week's full allowance, so it needs pacing over several weeks.
- **Retaken scans.** The scanner retook a two-page spread 13 times in this volume, so the same page appears twice a few leaves apart. `assemble.py` finds these by text similarity and keeps the capture with more ink in its text block. Neither the first capture nor the retake is reliably the good one. The patchy retake of p. 255 had been read "iis … cum … solo … appellat" where the print has "illis … quum … illo … appellavit": with ink missing, both models filled the gaps with plausible words, and the check could not tell. One blurred capture whose OCR is too garbled to match is listed in `skip_leaves`.
- **Italics are a per-character mask, not markers.** Laying Sonnet's italic runs over the draft's own as `*…*` markers produced `**` in 207 of about 2,000 paragraphs. A `*` in a margin note, a bullet-like `* ` at a line start, and runs broken by a page or line break did the rest. `apply_fixes.py` and `assemble.tidy` now strip the markers to a mask, lay the runs on it, and write the markers back balanced, per paragraph. In the assembled book, no paragraph has an unbalanced marker.
- **Spot checks.** Two faded upper thirds (leaves 0251 and 0449) matched the scan word for word. The book renders on the website with the italics as emphasis and the articles grouped by chapter.
- **Page-number warnings** from `assemble.py` mostly come from a printed number misread on the page before (p. 49 for 19), not from missing pages.

## Running the full drafts

```bash
ln -s "$PWD/denis-ocr.service" ~/.config/systemd/user/
ln -s "$PWD/denis-watchdog.service" "$PWD/denis-watchdog.timer" ~/.config/systemd/user/
systemctl --user daemon-reload && systemctl --user enable --now denis-ocr.service denis-watchdog.timer
loginctl enable-linger      # start at boot, before anyone logs in
journalctl --user -u denis-ocr -f      # or: tail -f ~/ember-data/denis-carthusian/progress.log
```

- **Monitoring.** `denis-watchdog.timer` runs `watchdog.py` every 10 minutes and appends a line to `heartbeat.log`. It alerts (desktop notification and `alerts.log`) when no page has been drafted for 30 minutes, the service has failed, or it restarted more than 3 times since the last check. The service state alone is not enough: it read "active" through a 12-hour restart loop. An hourly scheduled task also wakes the Claude session that runs the import, to check, fix and notify.
- `pipeline.sh` starts vLLM and runs `run_volumes.py`. If either dies, systemd restarts both a minute later.
- Data lives in `~/ember-data/denis-carthusian/`, outside the worktree.
- **Recovery.** A volume's zip is downloaded afresh on each attempt (the archive does not always honour resumes) and only used once its size and MD5 match the archive's listing. Size alone once passed a corrupt download (vol. 17). Each page's draft is written to a temporary file, synced and renamed into place. A restart skips every page that has a draft. Tested by killing the service mid-volume: it came back on its own and resumed at "809 of 830 pages to do".
- **Failures stay with their page.** Any error on a page, reading its image included, gives that page a `.err` file and the run moves on. An unreadable entry in a zip is fetched on its own from the archive, which serves single files out of a zip by path. Before this, one unreadable leaf crashed the service on every start, and it restarted in a loop for 12 hours; the unit now stops and shows as failed after 5 failures in half an hour.
- **Page images come as a JPEG 2000 zip, or for a few Google scans only as a TIFF zip** (vol. 34). The downloader takes either; before it did, vol. 34 was skipped with a blank error, because the item has no `_jp2.zip`.
- **Downloads never idle the GPU.** It takes whichever volume's zip is on disk, while the missing ones download in order in the background.
- **Failed pages.** A page whose model output won't parse also gets a `.err` file. Retry those with `run_volumes.py --retry-failed`.
- The raw layout JSON is kept beside each draft, so the markdown can be regenerated whenever `dots_markdown` improves, without the GPU.

## Still open

- **Proofreading the rest (~27,700 pages).** About 240 pages use 1% of the weekly allowance, so the whole set is roughly one week's allowance. It needs a pace (a share per week) and an order (the commentaries in Bible order, or the minor works first) before `check_pages.py` runs at scale.
- **Volumes 37, 40 and 14bis** are only reachable from a US address. 37 and 40 are on Google Books as `1sgVCSrpHzwC` and `4asOlgsHwWEC`, with full view and a PDF download in the US; 14bis is on HathiTrust as `coo.31924065775227`. From Brazil, Google reports both as not public domain.
- **Gaps.** `gaps.tsv` lists every leaf with no usable text: blank leaves, and unreadable scans with the printed page numbers around them. The unreadable ones that are not covered by a retaken capture need the page from another copy (HathiTrust's Cornell scans, or Google's). Assembly flags them too, as a skip in the page numbers.
- **Mistral OCR 4.1** is untested (no key). `ocr_mistral.py` is ready. At about $2–3.5 per 1,000 pages, it would be worth trying if it keeps italics.
- **Splitting the set into books.** One book per work, not per volume: the minor works (vols. 33–41) hold about 150 treatises. Each needs a `works/<slug>.json` like `works/genesis.json`. The Latin is the canonical language; there are no translations.

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
