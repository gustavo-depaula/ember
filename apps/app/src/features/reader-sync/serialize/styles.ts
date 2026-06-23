// Minimal, e-ink-friendly stylesheet shipped in every Reader Sync EPUB.
// Kept deliberately plain: no colors (mono display), no custom fonts (the
// reader picks), no layout tricks that strict EPUB engines choke on.
// Inlined as a string because Metro can't import a .css file as text.

export const epubCss = `body {
  margin: 0 6%;
  line-height: 1.45;
  text-align: left;
  hyphens: auto;
}
h1, h2, h3, h4 {
  line-height: 1.2;
  margin: 1.2em 0 0.5em;
  page-break-after: avoid;
}
h1 { text-align: center; margin-top: 0; }
p { margin: 0.6em 0; }
p.prayer { margin: 0.8em 0; }
p.rubric, .rubric { font-style: italic; }
p.text.italic { font-style: italic; }
.voice-priest::before { content: "\\2123 "; }
.voice-people::before, .voice-all::before { content: "\\211F "; }
.verses { margin: 0.8em 0; }
p.verse { margin: 0.2em 0; }
p.verse.r { padding-left: 1em; }
p.verses-header { font-style: italic; margin-bottom: 0.3em; }
.num { font-weight: bold; }
hr {
  border: 0;
  border-top: 1px solid currentColor;
  width: 40%;
  margin: 1.2em auto;
}
figure { margin: 1em 0; text-align: center; page-break-inside: avoid; }
img { max-width: 100%; height: auto; }
figcaption { font-size: 0.85em; font-style: italic; margin-top: 0.3em; }
figcaption.attribution { font-size: 0.75em; }
blockquote { margin: 0.8em 1.2em; font-style: italic; }
aside.callout { margin: 1em 0; padding-left: 0.8em; border-left: 2px solid currentColor; }
.callout-title { font-weight: bold; margin-bottom: 0.2em; }
.callout-meta { font-style: italic; font-size: 0.85em; }
p.question { margin: 0.8em 0; }
p.paragraph-number { text-align: center; font-weight: bold; }
.reference { font-size: 0.85em; }
.response { font-weight: bold; }
`
