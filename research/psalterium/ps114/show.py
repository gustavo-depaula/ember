import json,sys,glob,os
for ref in sys.argv[1:]:
    p=int(ref.split(':')[0])
    f=f'research/psalterium/ps{p:03d}/prayed.vos.json'
    if not os.path.exists(f): print(ref,'-- no file'); continue
    d=json.load(open(f))
    for k,v in d.items():
        if k==ref or k.startswith(ref) and not k[len(ref):len(ref)+1].isdigit():
            print(k,v)
