#!/bin/zsh
# PROTOTYPE helper: record my simulator while tapping Amen, then cut frames every 0.25s.
cd "$(dirname "$0")"
udid=11212E70-6308-469A-B131-7D99AB7DDDA2
rm -f open.mov frame-*.png
xcrun simctl io $udid recordVideo --codec h264 --force "$PWD/open.mov" >/dev/null 2>&1 &
rec=$!
sleep 1.5
~/.local/axe/axe tap --label "Amen" --udid $udid >/dev/null
sleep 4
kill -INT $rec
wait $rec
ffmpeg -loglevel error -i open.mov -vf "fps=4,scale=368:-1" frame-%02d.png
ls frame-*.png | wc -l
