"""Print the tree outline of a CC file: victorines_probe.py file.xml [depth]"""
import sys
sys.path.insert(0, 'research/sourcing/_scripts')
from victorines_lib import *
def show(nodes, ind=0, maxd=9):
    for x in nodes:
        if x['kind'] == 'group':
            print(' ' * ind + '[G] ' + x['title'][:90], count(x['children']))
            if ind // 2 < maxd: show(x['children'], ind + 2, maxd)
        else:
            print(' ' * ind + x['title'][:90], sum(len(p.split()) for p in x['paras']))
t = build_tree(sys.argv[1])
show(t, 0, int(sys.argv[2]) if len(sys.argv) > 2 else 9)
print('TOTAL', count(t))
