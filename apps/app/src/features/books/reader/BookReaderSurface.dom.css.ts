/**
 * CSS injected into the DOM Component as a single <style> tag.
 *
 * Lives outside the .dom.tsx so it can be tested / imported from non-DOM
 * code paths without dragging the DOM bundle along. Inline `@font-face`
 * loading is intentionally absent — Step 3 ships a smoke-test surface that
 * uses the system serif; Step 5 + Step 6 add font-face loading from Hearth.
 *
 * Light/dark themes use CSS variables flipped via a top-level class. Dark
 * values match the existing reader (cf. apps/app/src/features/books/bookReader.ts).
 */

export const surfaceCss = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond&family=Crimson+Pro&family=Lora&family=Cormorant+Garamond&family=Libre+Baskerville&family=Source+Serif+4&family=Merriweather&display=swap');

:root, .light {
  --bg: #FAF6F0;
  --text: #1a1815;
  --text-secondary: #6b6258;
  --heading: #1a1815;
  --border: #d9d2c5;
  --link: #2f5d8a;
}
.dark {
  --bg: #0E0D0C;
  --text: #EDE4D8;
  --text-secondary: #918880;
  --heading: #EDE4D8;
  --border: #2A2622;
  --link: #7A9EC8;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
}

* { box-sizing: border-box; }

.reader-surface {
  background: var(--bg);
  color: var(--text);
  /* Justify by words only, never stretch letters or rivers will appear */
  text-justify: inter-word;
  word-spacing: 0;
  -webkit-hyphens: none;
  hyphens: none;
}

/* --- Scroll mode: comfortable measure, vertical scroll --- */
.reader-scroll {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.reader-scroll section[data-ch] {
  max-width: 38em;
  margin: 0 auto;
}

/* --- Paginated mode: CSS multi-column + transform-based page turns --- */
.reader-paginated { overflow: hidden; }
.reader-paginated .ch-panel + .ch-panel { break-before: column; }
.reader-paginated img {
  max-height: 80vh;
  break-inside: avoid;
}
.reader-paginated h1,
.reader-paginated h2,
.reader-paginated h3,
.reader-paginated h4 {
  break-inside: avoid;
  break-after: avoid;
}
.reader-paginated body { orphans: 2; widows: 2; }

.reader-surface h1, .reader-surface h2, .reader-surface h3, .reader-surface h4 {
  color: var(--heading);
  font-weight: 600;
  margin: 1.5em 0 0.5em;
  line-height: 1.25;
}
.reader-surface h2.chapter-title {
  text-align: center;
  margin: 0 0 1.25em;
  font-size: 1.4em;
  letter-spacing: 0.02em;
}
.reader-surface p {
  margin: 0 0 0.85em;
  text-indent: 0;
}
.reader-surface p + p {
  text-indent: 1.2em;
}
.reader-surface blockquote {
  border-left: 2px solid var(--border);
  color: var(--text-secondary);
  margin: 1em 0;
  padding-left: 1em;
  font-style: italic;
}
.reader-surface a { color: var(--link); text-decoration: none; }
.reader-surface a:hover { text-decoration: underline; }
.reader-surface hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 1.5em auto;
  width: 40%;
}
.reader-surface img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border-radius: 4px;
}

/* Footnotes (marked-footnote output) */
.reader-surface section.footnotes {
  margin-top: 2em;
  padding-top: 1em;
  border-top: 1px solid var(--border);
  font-size: 0.85em;
  color: var(--text-secondary);
}
.reader-surface section.footnotes ol { padding-left: 1.5em; }
.reader-surface .footnote-ref { font-size: 0.75em; vertical-align: super; }

/* Galleries — minimal shared styles; full pagination/peek behaviour ships in Step 5 */
.reader-surface .ember-gallery {
  display: block;
  margin: 1em 0;
}
.reader-surface .ember-gallery img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.reader-surface .ember-gallery figcaption,
.reader-surface .ember-gallery-caption {
  text-align: center;
  margin-top: 0.5em;
  font-size: 0.9em;
  color: var(--text-secondary);
}
.reader-surface .ember-gallery-title {
  display: block;
  font-weight: 600;
  color: var(--text);
}
.reader-surface .ember-gallery-attribution { display: block; font-style: italic; }
.reader-surface .ember-gallery-prose { display: block; font-style: italic; }
.reader-surface .ember-gallery[data-display="stack"] .ember-gallery-slide + .ember-gallery-slide {
  margin-top: 1.5em;
}
`
