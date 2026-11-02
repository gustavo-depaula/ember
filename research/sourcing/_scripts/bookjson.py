import json, os

def write(root, d):
    os.makedirs(root, exist_ok=True)
    with open(os.path.join(root, 'book.json'), 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write('\n')

def author_file(path, name_en, name_pt, century, matches, saint=None):
    if os.path.exists(path):
        return
    d = {'name': {'en-US': name_en, 'pt-BR': name_pt}, 'century': century}
    if saint:
        d['saint'] = saint
    d['matches'] = matches
    with open(path, 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write('\n')
