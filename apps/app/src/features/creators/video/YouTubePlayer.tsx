/**
 * YouTube IFrame player. Uses the official IFrame API in a `react-native-webview`
 * on native and a plain `<iframe>` on web. We never extract audio or proxy
 * video — that violates YouTube ToS.
 *
 * Reports playback errors (e.g. embedding disabled by uploader) via `onError`
 * so the parent can offer a fallback like "Watch on YouTube".
 *
 * YouTube error 153: after YouTube's 2025-07 stricter embed-identity check,
 * inline-HTML WebViews fail with "Video player configuration error" because
 * WKWebView doesn't auto-send a Referer. Fix is to give the WebView a real
 * HTTPS baseUrl so it has a verifiable origin (this domain doubles as the
 * value YouTube sees in the embed's referrer/origin). Critically the baseUrl
 * must NOT be youtube.com itself — it must be a third-party host.
 * Refs:
 *   github.com/react-native-webview/react-native-webview/issues/3889
 *   til.simonwillison.net/youtube/fixing-153-embed
 */

import { useCallback, useMemo } from 'react'
import { Platform, View } from 'react-native'

const EMBED_ORIGIN = 'https://ember.dpgu.me'

const NATIVE_HTML = (videoId: string) => `
<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="referrer" content="strict-origin-when-cross-origin"/>
<style>
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
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        enablejsapi: 1,
        origin: ${JSON.stringify(EMBED_ORIGIN)},
      },
      events: {
        onStateChange: function(e) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'state', state:e.data})); },
        onError: function(e) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', error:e.data})); },
      },
    });
  }
</script></body></html>`

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

type Props = {
  videoId: string
  onError?: (code: number) => void
}

export function YouTubePlayer({ videoId, onError }: Props) {
  const source = useMemo(() => ({ html: NATIVE_HTML(videoId), baseUrl: EMBED_ORIGIN }), [videoId])

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as { type: string; error?: number }
        if (msg.type === 'error' && typeof msg.error === 'number') onError?.(msg.error)
      } catch {
        // Ignore non-JSON / postMessage noise from the WebView.
      }
    },
    [onError],
  )

  if (Platform.OS === 'web') {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${
      origin ? `&origin=${encodeURIComponent(origin)}` : ''
    }`
    return (
      <View style={{ aspectRatio: 16 / 9, width: '100%', backgroundColor: '#000' }}>
        <iframe
          title="YouTube"
          src={src}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
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
        onMessage={handleMessage}
      />
    </View>
  )
}
