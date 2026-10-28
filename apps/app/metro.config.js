const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const monorepoRoot = path.resolve(__dirname, '../..')
const config = getDefaultConfig(__dirname)

// Monorepo: watch workspace packages and resolve node_modules from both app and root
config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Android stand-ins. The bottom sheet: Material's modal sheet ignores a lone
// snap point and opens full-screen, so the stand-in sizes the sheet to that
// point. The date/time picker: `@expo/ui`'s Material 3 pickers in place of the
// community library's AppCompat dialogs. The first wraps the module it
// replaces, so its own import of it passes through.
const androidShims = {
	'@expo/ui/community/bottom-sheet': path.resolve(
		__dirname,
		'src/lib/android-shims/bottom-sheet.tsx',
	),
	'@react-native-community/datetimepicker': path.resolve(
		__dirname,
		'src/lib/android-shims/datetime-picker.tsx',
	),
}

const defaultResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
	const androidShim = platform === 'android' ? androidShims[moduleName] : undefined
	if (androidShim && context.originModulePath !== androidShim) {
		return { type: 'sourceFile', filePath: androidShim }
	}
	return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform)
}

// content/do is the Divinum Officium submodule (~300MB of upstream text, Perl
// and JS). The app reads it through the corpus, never by import — keep Metro
// from crawling it.
const doSubmodule = path.resolve(monorepoRoot, 'content', 'do')
config.resolver.blockList = [
  ...[config.resolver.blockList ?? []].flat(),
  new RegExp(`^${doSubmodule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`),
]

config.resolver.sourceExts.push('sql')
config.transformer.babelTransformerPath = path.resolve(__dirname, 'metro-sql-transformer.js')

// `justif` publishes import-only conditional exports: every subpath offers
// `types` and `import`, with no `require` and no `default`. Metro's exports
// resolver asserts `require` unless it has flagged the importer as ESM
// (`matchSubpathFromExportsLike` in metro-resolver), so no condition matches
// and `justif/core` resolves to nothing — the whole bundle dies at
// `lib/typography/justifyText.ts`. Node and vite both honour `import`, which is
// why the unit tests resolve it and Metro does not.
//
// Adding `import` to `unstable_conditionNames` does not lift it, so map the
// subpaths onto the built files. Narrow on purpose: one package, and it falls
// away the moment justif publishes a `default` condition.
const justifDist = path.resolve(monorepoRoot, 'node_modules/justif/dist')
const beforeJustifResolve = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const justif = /^justif(?:\/(.+))?$/.exec(moduleName)
  if (justif) {
    return { type: 'sourceFile', filePath: path.join(justifDist, `${justif[1] ?? 'index'}.js`) }
  }
  return (beforeJustifResolve ?? context.resolveRequest)(context, moduleName, platform)
}

module.exports = config
