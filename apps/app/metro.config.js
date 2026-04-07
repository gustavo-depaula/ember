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
			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
			middleware(req, res, next)
		}
	},
}

module.exports = config
