const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

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
