import { practiceWebPaths } from '@/lib/webLinks'
import app from '../../../app/app.json'
import { androidCertSha256, appleTeamId } from './config'

const { ios, android } = app.expo

/**
 * `/.well-known/` files by name. A prayer's address opens in the app on a
 * phone that has it: the app claims the paths (app.json), and these files are
 * the site's consent, naming the app by its signing identity.
 */
export function appLinkFiles(): Record<string, unknown> {
  const files: Record<string, unknown> = {}
  if (appleTeamId) {
    files['apple-app-site-association'] = {
      applinks: {
        details: [
          {
            // The store build and the dev build (app.config.js) are two apps.
            appIDs: [ios.bundleIdentifier, `${ios.bundleIdentifier}.dev`].map(
              (id) => `${appleTeamId}.${id}`,
            ),
            // `?*`: a prayer's page, not the section's index.
            components: Object.values(practiceWebPaths).map((path) => ({ '/': `${path}/?*` })),
          },
        ],
      },
    }
  }
  if (androidCertSha256.length > 0) {
    files['assetlinks.json'] = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: android.package,
          sha256_cert_fingerprints: androidCertSha256,
        },
      },
    ]
  }
  return files
}
