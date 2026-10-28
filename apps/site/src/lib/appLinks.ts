import { practiceWebPaths } from '@/lib/webLinks'
import app from '../../../app/app.json'

const { ios, android } = app.expo

// Who signs the app. Both are public: they are published in the files below
// and readable from any installed copy.
// The Apple Team ID is app.json's `ios.appleTeamId`, which the build reads too.
// SHA-256 of the Android signing certificates. Play re-signs what is uploaded,
// so a phone that installed from Play carries Play's app-signing certificate
// (Play Console → App integrity → App signing), not the upload key's.
const androidCertSha256 = [
  // Play's app-signing key: installs from the store.
  'B7:28:9A:7B:E1:6D:AE:40:1C:6C:CB:AA:21:8C:0E:81:01:84:9C:97:04:55:6C:76:94:DF:CF:97:7D:E2:85:2C',
  // Upload key: builds installed outside Play.
  '6C:81:CD:62:F0:E3:BF:DF:AD:4F:53:6D:3D:0A:F4:F2:49:AF:B7:07:0B:E3:0C:FB:A8:3E:09:55:4A:1D:06:D1',
]

/**
 * `/.well-known/` files by name. A prayer's address opens in the app on a
 * phone that has it: the app claims the paths (app.json), and these files are
 * the site's consent, naming the app by its signing identity.
 */
export function appLinkFiles(): Record<string, unknown> {
  return {
    'apple-app-site-association': {
      applinks: {
        details: [
          {
            // The store build and the dev build (app.config.js) are two apps.
            appIDs: [ios.bundleIdentifier, `${ios.bundleIdentifier}.dev`].map(
              (id) => `${ios.appleTeamId}.${id}`,
            ),
            // `?*`: a prayer's page, not the section's index.
            components: Object.values(practiceWebPaths).map((path) => ({ '/': `${path}/?*` })),
          },
        ],
      },
    },
    'assetlinks.json': [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: android.package,
          sha256_cert_fingerprints: androidCertSha256,
        },
      },
    ],
  }
}
