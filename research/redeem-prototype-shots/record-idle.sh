#!/bin/zsh
# PROTOTYPE helper: record the idle envelope for a few seconds, then a finger drag across it.
cd "$(dirname "$0")"
udid=11212E70-6308-469A-B131-7D99AB7DDDA2
rm -f idle.mov
xcrun simctl io $udid recordVideo --codec h264 --force "$PWD/idle.mov" >/dev/null 2>&1 &
rec=$!
sleep 5.5
~/.local/axe/axe swipe --start-x 90 --start-y 330 --end-x 320 --end-y 420 --duration 2.5 --udid $udid >/dev/null
sleep 1
kill -INT $rec
wait $rec
ffmpeg -loglevel error -y -i idle.mov -vf "crop=iw:ih*0.5:0:ih*0.1,fps=3,scale=200:-1,tile=8x3" idle-sheet.png
