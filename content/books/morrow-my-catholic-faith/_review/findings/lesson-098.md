# lesson-098 — findings

PDF pages: 206–207

## Issues

### Commandment quotation: "SHALL" vs "SHALT"
- **Type:** ocr
- **Line:** 7
- **Markdown says:** `"THOU SHALL NOT TAKE THE NAME OF THE LORD THY GOD IN VAIN."`
- **PDF says:** `"THOU SHALT NOT TAKE THE NAME OF THE LORD THY GOD IN VAIN."`
- **Suggested fix:** `"THOU SHALT NOT TAKE THE NAME OF THE LORD THY GOD IN VAIN."`

### Closing quotation mark rendered as two apostrophes
- **Type:** ocr
- **Line:** 20
- **Markdown says:** `He will give it to you''`
- **PDF says:** `He will give it to you"`
- **Suggested fix:** `He will give it to you"`

### Cursing answer and point 1 merged onto one line
- **Type:** column-merge
- **Line:** 50
- **Markdown says:** `— Cursing is the calling down of some evil on a person, place, or thing. 1. To call down some punishment on ourselves or other creatures of God in a moment of anger, is cursing. If the name of God is used, the sin is worse.`
- **PDF says:** Two separate paragraphs: the answer ends at `…or thing.` and point 1 (`To call down some punishment…`) begins as its own numbered paragraph.
- **Suggested fix:** Split at `thing.` — close the answer, then begin `1. To call down some punishment on ourselves or other creatures of God in a moment of anger, is cursing. If the name of God is used, the sin is worse.` as a new paragraph.
