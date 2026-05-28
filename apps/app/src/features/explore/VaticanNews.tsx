/**
 * Vatican News embed — the official `<vaticannews-widget>` custom element loaded
 * from vaticannews.va. Native uses a `react-native-webview`, web a plain
 * `<iframe srcDoc>` (mirrors the YouTubePlayer cross-platform pattern). The
 * widget fetches from its own domain, so we give the native WebView a
 * vaticannews.va `baseUrl` to keep those requests same-origin.
 *
 * The widget renders into an OPEN Shadow DOM, so the injected click interceptor
 * walks `composedPath()` (not `closest`) to find anchors across the shadow
 * boundary. Intercepted links open in an in-app bottom-sheet browser on native /
 * a new tab on web (news pages typically block being framed). The widget has no
 * dark-mode attribute — its `type="grey"` is the dark variant — and no intrinsic
 * sizing, so it reports its height back and we grow the container to fit (and
 * disable inner scroll, so it scrolls with the page).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, BottomSheet } from '@/components'
import { Typography } from '@/components/typography'
import i18n from '@/lib/i18n'
import { vaticanWidgetLang } from './vaticanContent'

const widgetOrigin = 'https://www.vaticannews.va'
const minHeight = 480
const maxHeight = 4000
const clampHeight = (v: number) => Math.min(Math.max(Math.round(v), minHeight), maxHeight)

function isDarkHex(hex: string | undefined): boolean {
  if (!hex || hex[0] !== '#') return false
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

// Runs inside the widget document (native + web). Intercepts link clicks across
// the open shadow boundary and reports content height back to the host.
const hostScript = `
<script>
(function(){
  function anchorFrom(e){
    var path = e.composedPath ? e.composedPath() : [];
    for (var i=0;i<path.length;i++){ var n=path[i]; if(n && n.tagName==='A' && n.href) return n; }
    return e.target && e.target.closest ? e.target.closest('a[href]') : null;
  }
  document.addEventListener('click', function(e){
    var a = anchorFrom(e);
    if(!a) return;
    var href = a.href;
    if(!/^https?:/i.test(href)) return;
    e.preventDefault(); e.stopPropagation();
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type:'open', url:href }));
    else window.open(href, '_blank', 'noopener');
  }, true);
  function reportHeight(){
    var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type:'height', value:h }));
    else if (window.parent) window.parent.postMessage({ source:'vnw', type:'height', value:h }, '*');
  }
  window.addEventListener('load', reportHeight);
  var n=0, iv=setInterval(function(){ reportHeight(); if(++n>24) clearInterval(iv); }, 500);
  if (window.ResizeObserver) { try { new ResizeObserver(reportHeight).observe(document.documentElement); } catch(_){} }
})();
</script>`

const widgetHtml = (lang: string, dark: boolean) => `<!doctype html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>html,body{margin:0;padding:0;background:transparent;}</style>
</head><body>
<vaticannews-widget lang="${lang}"${dark ? ' type="grey"' : ''} fontSize="18" carouselVideoAuto="true" carouselVideoTime="fast"></vaticannews-widget>
<script src="${widgetOrigin}/widget.js"></script>
${hostScript}
</body></html>`

// biome-ignore lint/suspicious/noExplicitAny: WebView type not exported
const WebView: any = Platform.OS !== 'web' ? require('react-native-webview').default : undefined

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return 'vaticannews.va'
  }
}

export function VaticanNews() {
  const theme = useTheme()
  const dark = isDarkHex(theme.background?.val)
  const lang = vaticanWidgetLang(i18n.language)
  const html = useMemo(() => widgetHtml(lang, dark), [lang, dark])
  const [height, setHeight] = useState(minHeight)
  const [article, setArticle] = useState<string | undefined>()

  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as {
        type?: string
        url?: string
        value?: number
      }
      if (msg.type === 'open' && msg.url) setArticle(msg.url)
      else if (msg.type === 'height' && msg.value) setHeight(clampHeight(msg.value))
    } catch {
      // Ignore non-JSON postMessage noise.
    }
  }, [])

  // Web: receive the iframe's height postMessages.
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const onWindowMessage = (e: MessageEvent) => {
      const d = e.data
      if (d && d.source === 'vnw' && d.type === 'height' && d.value) setHeight(clampHeight(d.value))
    }
    window.addEventListener('message', onWindowMessage)
    return () => window.removeEventListener('message', onWindowMessage)
  }, [])

  if (Platform.OS === 'web') {
    return (
      <View style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden' }}>
        <iframe
          title="Vatican News"
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </View>
    )
  }

  return (
    <>
      <View style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden' }}>
        <WebView
          source={{ html, baseUrl: `${widgetOrigin}/` }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          scalesPageToFit={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          onMessage={onMessage}
        />
      </View>

      <BottomSheet visible={!!article} onClose={() => setArticle(undefined)} expand>
        <XStack alignItems="center" justifyContent="space-between" gap="$md">
          <Typography variant="reference" numberOfLines={1} flex={1}>
            {article ? hostOf(article) : ''}
          </Typography>
          <AnimatedPressable
            onPress={() => setArticle(undefined)}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('common.done', { defaultValue: 'Done' })}
          >
            <Typography variant="label">
              {i18n.t('common.done', { defaultValue: 'Done' })}
            </Typography>
          </AnimatedPressable>
        </XStack>
        <YStack flex={1} borderRadius={12} overflow="hidden">
          {article && (
            <WebView
              source={{ uri: article }}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              allowsBackForwardNavigationGestures
            />
          )}
        </YStack>
      </BottomSheet>
    </>
  )
}
