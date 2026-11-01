import re,sys
for f in sys.argv[1:]:
    s=open(f).read()
    print('==',f)
    for m in re.finditer(r'<work type="work".*?<name>([^<]*)</name>\s*<idno>(\d+)</idno>.*?<words_count>(\d+)</words_count>',s,re.S):
        print(m.group(2),m.group(3),m.group(1))
