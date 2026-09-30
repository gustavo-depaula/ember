#!/bin/zsh
# PROTOTYPE helper: record envelope → intro + prayer → Amen → card → Read his life.
cd "$(dirname "$0")"
udid=11212E70-6308-469A-B131-7D99AB7DDDA2
axe=~/.local/axe/axe
$axe tap --label "Restart" --udid $udid >/dev/null
sleep 3
rm -f flow2.mov
xcrun simctl io $udid recordVideo --codec h264 --force "$PWD/flow2.mov" >/dev/null 2>&1 &
rec=$!
sleep 3
$axe swipe --start-x 350 --start-y 560 --end-x 40 --end-y 560 --duration 0.5 --udid $udid >/dev/null
sleep 3
$axe swipe --start-x 200 --start-y 700 --end-x 200 --end-y 380 --duration 0.8 --udid $udid >/dev/null
sleep 2
$axe tap --label "Amen" --udid $udid >/dev/null
sleep 5
$axe tap --label "Read his life" --udid $udid >/dev/null
sleep 2.5
$axe swipe --start-x 200 --start-y 700 --end-x 200 --end-y 400 --duration 0.8 --udid $udid >/dev/null
sleep 2
kill -INT $rec
wait $rec
ffmpeg -loglevel error -y -i flow2.mov -vf "fps=1,scale=120:-1,tile=12x3" -frames:v 1 flow2-sheet.png
ffprobe -v error -show_entries format=duration -of csv=p=0 flow2.mov
