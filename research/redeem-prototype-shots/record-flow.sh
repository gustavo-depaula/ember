#!/bin/zsh
# PROTOTYPE helper: record the whole redeem flow on my simulator as a smooth video.
cd "$(dirname "$0")"
udid=11212E70-6308-469A-B131-7D99AB7DDDA2
axe=~/.local/axe/axe
$axe tap --label "Restart" --udid $udid >/dev/null
sleep 3
rm -f flow.mov
xcrun simctl io $udid recordVideo --codec h264 --force "$PWD/flow.mov" >/dev/null 2>&1 &
rec=$!
sleep 4.5
$axe swipe --start-x 90 --start-y 330 --end-x 320 --end-y 420 --duration 2.2 --udid $udid >/dev/null
sleep 1.5
$axe swipe --start-x 350 --start-y 560 --end-x 40 --end-y 560 --duration 0.5 --udid $udid >/dev/null
sleep 2.5
$axe swipe --start-x 200 --start-y 700 --end-x 200 --end-y 350 --duration 0.8 --udid $udid >/dev/null
sleep 3
$axe swipe --start-x 350 --start-y 560 --end-x 40 --end-y 560 --duration 0.5 --udid $udid >/dev/null
sleep 2
$axe swipe --start-x 200 --start-y 700 --end-x 200 --end-y 400 --duration 0.6 --udid $udid >/dev/null
sleep 3
$axe tap --label "Amen" --udid $udid >/dev/null
sleep 6
kill -INT $rec
wait $rec
# Crop off the prototype pill and the tab bar, 30fps, phone-friendly size.
ffmpeg -loglevel error -y -i flow.mov -vf "fps=30,scale=590:-2" -c:v libx264 -pix_fmt yuv420p -movflags +faststart redeem-envelope.mp4
ffmpeg -loglevel error -y -i flow.mov -vf "fps=15,scale=320:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" redeem-envelope.gif
ls -la redeem-envelope.mp4 redeem-envelope.gif
