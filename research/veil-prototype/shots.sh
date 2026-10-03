#!/bin/sh
# Screenshot veil.html. $1 = shot name, $2 = comma-separated veils (all when empty), $3 = height.
dir=/Users/gustavo/Documents/prayer/.claude/worktrees/prototype-redeem/research/veil-prototype
mkdir -p $dir/shots
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=780,${3:-2300} --virtual-time-budget=4000 --screenshot="$dir/shots/$1.png" "file://$dir/veil.html#$2" 2>/dev/null
echo "$dir/shots/$1.png"
