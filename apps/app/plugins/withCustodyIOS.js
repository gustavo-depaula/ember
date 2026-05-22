// Expo config plugin that adds Custody-specific iOS configuration on top of
// the `react-native-device-activity` plugin (which handles the heavy lifting
// of registering the three extension targets and signing them).
//
// What this plugin does:
//   1. Sets `com.apple.developer.family-controls` = true in the main app
//      entitlements so Family Controls APIs are available to JS.
//   2. Adds the App Group identifier to the main app entitlements.
//   3. Sets `NSFamilyControlsUsageDescription` in Info.plist (App Review
//      requires a non-empty justification string).

const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins')

const DEFAULT_USAGE =
  'Custody helps you keep your ascetical commitments by shielding selected apps and websites at your request.'

/**
 * @param {import('expo/config').ExpoConfig} config
 * @param {{ appGroup: string; usageDescription?: string }} props
 */
function withCustodyIOS(config, props = {}) {
  const appGroup = props.appGroup || 'group.me.dpgu.ember'
  const usageDescription = props.usageDescription || DEFAULT_USAGE

  config = withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.developer.family-controls'] = true
    const groupsKey = 'com.apple.security.application-groups'
    const existing = Array.isArray(c.modResults[groupsKey]) ? c.modResults[groupsKey] : []
    const next = Array.from(new Set([...existing, appGroup]))
    c.modResults[groupsKey] = next
    return c
  })

  config = withInfoPlist(config, (c) => {
    c.modResults.NSFamilyControlsUsageDescription = usageDescription
    return c
  })

  return config
}

module.exports = withCustodyIOS
module.exports.default = withCustodyIOS
