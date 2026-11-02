import json
def cfg(slug, name, name_pt, desc, desc_pt, composed, pub, iaid, manual, start, end, **kw):
    d = dict(id='benson-' + slug, dir='benson-opera-omnia/' + slug, slug=slug, name=name, name_pt=name_pt, desc=desc, desc_pt=desc_pt,
             composed=composed, editor='Robert Hugh Benson (%s)' % pub[0], year=pub[1], url='https://archive.org/details/' + iaid,
             edition='%s (%s), Internet Archive full-text OCR (%s).' % (name, pub[0], iaid), src='robert-hugh-benson/ia/%s_djvu.txt' % iaid,
             manual=manual, start=start, end=end, label='', mode='ia')
    d.update(kw)
    json.dump(d, open('rhb_cfg_%s.json' % slug, 'w'), indent=1, ensure_ascii=False)
