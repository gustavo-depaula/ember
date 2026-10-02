#!/usr/bin/env bash
# Build and run the app on Android from the command line — no Android Studio.
# Uses a connected device if there is one, otherwise boots an emulator.
#
#   pnpm android                 # build, install, start Metro
#   EMBER_AVD=Pixel_9 pnpm android
set -euo pipefail
cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
# React Native's Gradle build wants JDK 17; a newer system JDK fails it.
if [ -z "${JAVA_HOME:-}" ] && [ -d "$HOME/Android/jdk-17" ]; then
  export JAVA_HOME="$HOME/Android/jdk-17"
fi
export PATH="${JAVA_HOME:+$JAVA_HOME/bin:}$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

command -v adb >/dev/null || {
  echo "No Android SDK at $ANDROID_HOME — install it or set ANDROID_HOME." >&2
  exit 1
}

if ! adb devices | awk 'NR > 1 && $2 == "device"' | grep -q .; then
  avd="${EMBER_AVD:-$(emulator -list-avds | grep -v '^INFO' | head -1)}"
  [ -n "$avd" ] || {
    echo "No device attached and no emulator (AVD) to boot." >&2
    exit 1
  }
  echo "Booting emulator $avd…"
  # -gpu host: the software renderer draws the Mass Times map without its
  # labels and pins. -port: 5555, the default pair's adb port, may be taken.
  nohup emulator -avd "$avd" -port 5560 -gpu host -no-snapshot-save >/dev/null 2>&1 &
  adb wait-for-device
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done
fi

# The dev app reads the local corpus from `pnpm hearth` on the host.
adb reverse tcp:"${EXPO_PUBLIC_HEARTH_PORT:-4100}" tcp:"${EXPO_PUBLIC_HEARTH_PORT:-4100}" >/dev/null

# 8081 is taken on this machine's usual setup; Metro runs on 8082 for iOS too.
# Expo rejects a port alongside --no-bundler.
port=(--port 8082)
case " $* " in *" --no-bundler "*) port=() ;; esac
exec pnpm --filter @ember/app exec expo run:android "${port[@]}" "$@"
