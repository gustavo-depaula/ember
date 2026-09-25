import { installAudioBackend } from './audio/audioPlayer'
import { drainPendingPins } from './pinning/feedItemPin'
import { installCreatorPinning } from './pinning/install'

/**
 * Boot the module: audio transport, feed-item pinning, and the Wi-Fi listener
 * that drains pins deferred while on cellular. Call once, after the DB is ready
 * and before pinned items rehydrate (pinning learns the creator kind here).
 */
export function startCreators(): void {
  installAudioBackend()
  installCreatorPinning()
  void import('expo-network').then((Network) => {
    Network.addNetworkStateListener((state) => {
      if (state.type === Network.NetworkStateType.WIFI && state.isConnected) {
        void drainPendingPins().catch(() => {})
      }
    })
  })
}
