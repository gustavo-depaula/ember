#!/bin/zsh
# PROTOTYPE helper: screenshot my simulator into this folder, shrunk for viewing.
cd "$(dirname "$0")"
xcrun simctl io 11212E70-6308-469A-B131-7D99AB7DDDA2 screenshot "$PWD/$1.png" >/dev/null 2>&1
sips -Z 800 "$1.png" >/dev/null
