import { practiceWebPaths } from '@/lib/webLinks'
import app from '../../../app/app.json'

const { ios, android } = app.expo

// Who signs the app. Both are public: they are published in the files below
// and readable from any installed copy.
// The Apple Team ID is app.json's `ios.appleTeamId`, which the build reads too.
const appleTeamId = (ios as { appleTeamId?: string }).appleTeamId
// SHA-256 of the Android signing certificates. Play re-signs what is uploaded,
// so a phone that installed from Play carries Play's app-signing certificate
// (Play Console → App integrity → App signing), not the upload key's.
const androidCertSha256: string[] = [
  // Upload key: builds installed outside Play.
  '6C:81:CD:62:F0:E3:BF:DF:AD:4F:53:6D:3D:0A:F4:F2:49:AF:B7:07:0B:E3:0C:FB:A8:3E:09:55:4A:1D:06:D1',
]

/**
 * `/.well-known/` files by name. A prayer's address opens in the app on a
 * phone that has it: the app claims the paths (app.json), and these files are
 * the site's consent, naming the app by its signing identity. The Apple file
 * is written once the Team ID is in app.json.
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
