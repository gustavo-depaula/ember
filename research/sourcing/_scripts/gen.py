"""emit(bookdir, meta, chapters): chapters = [(id, {lang: (title, body)})].
Writes <lang>/<id>.md ("# title" + body), fills meta toc, writes book.json, returns words per lang."""
import json, os, re

def emit(root, meta, chapters):
    toc = []
    words = {}
    for cid, per in chapters:
        t = {}
        for lang, (title, body) in per.items():
            os.makedirs(os.path.join(root, lang), exist_ok=True)
            with open(os.path.join(root, lang, cid + '.md'), 'w', encoding='utf-8') as f:
                f.write('# ' + title + '\n\n' + body.strip() + '\n')
            t[lang] = title
            words[lang] = words.get(lang, 0) + len(body.split())
        toc.append({'id': cid, 'title': t})
    meta['toc'] = toc
    with open(os.path.join(root, 'book.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write('\n')
    return words
