/**
 * YouTube IFrame player. Uses the official IFrame API in a `react-native-webview`
 * on native and a plain `<iframe>` on web. We never extract audio or proxy
 * video — that violates YouTube ToS.
 */

import { useMemo } from 'react'
import { Platform, View } from 'react-native'

const NATIVE_HTML = (videoId: string) => `
<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
html,body{margin:0;padding:0;background:#000;height:100%;}
#player{width:100%;height:100%;}
</style></head><body>
<div id="player"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      videoId: ${JSON.stringify(videoId)},
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onStateChange: function(e) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'state', state:e.data})); },
        onError: function(e) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', error:e.data})); },
      },
    });
  }
</script></body></html>`

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

export function YouTubePlayer({ videoId }: { videoId: string }) {
  const source = useMemo(() => ({ html: NATIVE_HTML(videoId) }), [videoId])

  if (Platform.OS === 'web') {
    return (
      <View style={{ aspectRatio: 16 / 9, width: '100%', backgroundColor: '#000' }}>
        <iframe
          title="YouTube"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </View>
    )
  }

  return (
    <View style={{ aspectRatio: 16 / 9, width: '100%', backgroundColor: '#000' }}>
      <WebView
        source={source}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        originWhitelist={['*']}
        javaScriptEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  )
}
