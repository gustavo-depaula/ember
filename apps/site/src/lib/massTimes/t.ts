// A translator over the app's `massTimes` strings that runs in the browser as
// well as at build: the page ships the one namespace it needs, not i18next.
export type Dict = { [key: string]: string | Dict }

export type Translate = (key: string, vars?: Record<string, string | number>) => string

function lookup(dict: Dict, path: string): string | undefined {
  let node: string | Dict | undefined = dict
  for (const part of path.split('.')) {
    if (typeof node !== 'object') return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

/** `dict` is the catalog subtree whose root key is `root` ("massTimes"). */
export function makeT(root: string, dict: Dict): Translate {
  return (key, vars) => {
    const path = key.startsWith(`${root}.`) ? key.slice(root.length + 1) : key
    const plural = typeof vars?.count === 'number' ? (vars.count === 1 ? '_one' : '_other') : ''
    const template = lookup(dict, `${path}${plural}`) ?? lookup(dict, path) ?? key
    return template.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars?.[name] ?? ''))
  }
}
