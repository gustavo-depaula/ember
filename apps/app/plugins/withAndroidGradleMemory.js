// The template gives the Gradle daemon 2 GB of heap and 512 MB of metaspace.
// A release build of this many native modules runs lint over each of them and
// dies with `Metaspace` part-way through; debug builds scrape by. Raise both.

const { withGradleProperties } = require('expo/config-plugins')

const key = 'org.gradle.jvmargs'
const value = '-Xmx4096m -XX:MaxMetaspaceSize=1536m'

function withAndroidGradleMemory(config) {
  return withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter((item) => !(item.type === 'property' && item.key === key))
    c.modResults.push({ type: 'property', key, value })
    return c
  })
}

module.exports = withAndroidGradleMemory
