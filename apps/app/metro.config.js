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

module.exports = config
