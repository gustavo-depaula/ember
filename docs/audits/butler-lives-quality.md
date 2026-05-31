# Butler's *Lives of the Saints* — English source quality audit

**Date:** 2026-05-31
**Scope:** `content/books/butler-lives-of-saints/en-US/` (399 chapters, 1894 Benziger Bros. edition, scraped from sacred-texts.com)
**Goal:** clean the English source to a publishable standard before any translation derives from it.

## Summary

| Stage | Result |
|-------|--------|
| Scraper bugs fixed | 2 classes (empty chapter, page-break markers) → 36 files |
| LLM audit (173 agents) | 256 flagged → 249 confirmed |
| Fixes applied | 246 (incl. 2 resolved against the print source — see §3) |
| Intentionally **not** changed | 3 (Reflections Butler genuinely omits) |
| Title-page web junk | deleted (file + TOC entry) |
| Id cleanup | `feb-05-the` → `feb-05-the-martyrs-of-japan` (file + TOC) |
| Final state | 399 files ↔ 399 TOC ids (1:1); `pnpm build:corpus` clean |

## 1. Scraper fixes (`scripts/crawl-butler-lives-saints.py`)

The crawler was patched (and the corpus regenerated) for two systematic defects:

- **Empty chapter — `dec-23-servulus`.** `lots392.htm` ships with no `<h3>` heading (title only in `<title>`), so the "start collecting after the `<h3>`" logic collected nothing. Fix: when no `<h3>` is present, synthesize the heading from the index TOC entry (`December 23.—ST. SERVULUS`) and begin collecting after the centered "by Alban Butler" preamble.
- **`[paragraph continues]` markers (35 files).** sacred-texts prefixes a page-break continuation `<p>` with `<span class="contnote">[paragraph continues]</span>`. The parser pulled the marker as literal text and left the paragraph split. Fix: detect the marker, strip it, and force-rejoin the fragment onto the preceding paragraph (e.g. St. Leo: *"…the true doctrine of the"* + *"Incarnation in his famous 'tome;'"*).

## 2. LLM audit

A 34-batch fan-out read every chapter and flagged scrape artifacts + OCR corruption, with an adversarial verify pass to protect valid 1894 archaic prose. 249 confirmed findings, applied as **minimal local edits** (the source files are the canonical copy now; the scraper is bootstrap-only).

Confirmed by category: ocr-corruption 132 · punctuation 86 · structure 19 · scrape-artifact 11 · encoding 1.

Representative fixes: `hiss`→`his`, `CH's`→`CHRIST'S`, `Ring of France`→`King`, `con Pert`→`convert`, `Prather`→`rather`, `Gad`→`God`, `affected`→`effected`, `Whose`→`Whoso` (Imitation), restored drop-cap initials (`T. RAYMUND`→`ST. RAYMUND`, `HERE`→`THERE`), stray-comma/period and quotation-mark spacing, missing `February 5.—`/`November 14.—` heading date prefixes, inline `Reflection.—` → `## Reflection` headings, and the corpus's single footnote (`mar-24-simon-infant`) rewired to markdown `[^1]`.

Where the agent quoted a fragment but returned a whole reconstructed sentence, only the local error was corrected (the full text was already present); one over-deletion (`mar-14-maud`, would have dropped *"who was afterwards chosen king of Germany"*) was caught and reduced to the real fix (`He was s`→`He was a`).

## 3. Resolved against the print source

sacred-texts garbled two passages that needed a second source to settle; both were checked against the original Benziger print scan:

- **`mar-04-casimir`** — corrected "the cathedral of **Vienna**" → "**Vilna**" (Vilnius), where St. Casimir's tomb actually lies. *(Editorial correction of a factual error in the original, applied at the user's direction.)*
- **`nov-05-bertille`** — sacred-texts dropped the Reflection's terminal period, making it look truncated; the audit agent then hallucinated a longer ending. The print scan confirms the sentence is simply *"…going from virtue to virtue, as by steps."* — fixed by adding the period only, **not** the fabricated text.

## 3a. Intentionally NOT changed (source-fidelity)

- **`jul-11-james`, `jun-07-claude`, `nov-28-james-of-la-marca`** — flagged as "missing Reflection", but the source has **no Reflection** for these lives (Butler omits ~55). Not defects.

## 4. Verification

- All 249 confirmed findings resolved except the 5 above (verified programmatically).
- Mechanical sweep: 0 `[paragraph continues]`, 0 `p. NN` markers, 0 nav junk, 0 footnote-anchor artifacts; every file has a `# ` heading.
- 399 `.md` files ↔ 399 `book.json` TOC ids (no orphans either direction).
- `pnpm build:corpus` succeeds; `book/butler-lives-of-saints` present in catalog (`langs: ["en-US"]`).
