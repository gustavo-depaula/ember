"""Assemble the OCR pages of Solesmes II (BLB scan) into one text: one paragraph per line, '@@ ' for headings candidates.
usage: mechtilde_assemble.py TSVDIR OUT"""
import sys, glob, re, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import mechtilde_page as P

def run(d, out):
    paras = []
    for f in sorted(glob.glob(d + '/p-*.tsv')):
        pg = int(re.search(r'p-(\d+)', f).group(1))
        L, x0 = P.page(f)
        B, F = P.split_foot(L)
        # drop running head: lines at the very top of the page (t<215) that are short or name the work/part
        B = [x for x in B if not (x['t'] < 196 and (x['n'] <= 7 or re.search(r'LIBER|SPECIALIS|PARS|GRATI|CAPUT', x['text'])))]
        for x in B:
            paras.append(dict(pg=pg, indent=x['l'] > x0 + 14, text=x['text'], t=x['t'], h=x['h'], n=x['n']))
    json.dump(paras, open(out, 'w'))
    print(len(paras))

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2])
