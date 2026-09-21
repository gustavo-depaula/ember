import json
import sys

for path in sys.argv[1:]:
    try:
        data = json.load(open(path))
        print(path, len(data), '|', data[0]['text'][:90] if data else 'EMPTY')
    except Exception as error:
        print(path, 'ERR', error)
