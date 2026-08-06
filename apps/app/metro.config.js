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

// `@expo/ui` is native-only (its views call `requireNativeViewManager`). Since
// `ConfirmHost` mounts a sheet at the root of every screen, leaving it unshimmed
// makes the web build a blank page. Swap in a plain web sheet instead.
const webShims = {
	'@expo/ui/community/bottom-sheet': path.resolve(__dirname, 'src/lib/web-shims/bottom-sheet.tsx'),
	'@expo/ui/community/segmented-control': path.resolve(
		__dirname,
		'src/lib/web-shims/segmented-control.tsx',
	),
	'@expo/ui/swift-ui': path.resolve(__dirname, 'src/lib/web-shims/swift-ui.tsx'),
	'@expo/ui/swift-ui/modifiers': path.resolve(__dirname, 'src/lib/web-shims/swift-ui.tsx'),
}

const defaultResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
	const shim = platform === 'web' ? webShims[moduleName] : undefined
	if (shim) return { type: 'sourceFile', filePath: shim }
	return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform)
}

config.resolver.sourceExts.push('sql')
config.resolver.assetExts.push('wasm')
config.transformer.babelTransformerPath = path.resolve(__dirname, 'metro-sql-transformer.js')

// Required for expo-sqlite on web (wa-sqlite needs SharedArrayBuffer)
config.server = {
	...config.server,
	enhanceMiddleware: (middleware, server) => {
		return (req, res, next) => {
			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
			res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
			middleware(req, res, next)
		}
	},
}

// `@expo/ui` calls `requireNativeView(...)` at module scope, which throws on
// web — and because it runs on import, one @expo/ui import anywhere takes the
// whole web bundle down at boot. Point web builds at a web implementation.
const expoUiWebShim = path.resolve(__dirname, 'src/lib/expo-ui-web.tsx')
const upstreamResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && /^@expo\/ui(\/|$)/.test(moduleName)) {
    return { type: 'sourceFile', filePath: expoUiWebShim }
  }
  return (upstreamResolveRequest ?? context.resolveRequest)(context, moduleName, platform)
}

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
