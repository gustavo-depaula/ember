import pickle, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import inst_build as B
for t in (1, 2, 3, 4):
    items, notes = B.build(t)
    pickle.dump((items, notes), open('/Users/gustavo/Documents/prayer/research/sourcing/gueranger/inst/s%d.pkl' % t, 'wb'))
