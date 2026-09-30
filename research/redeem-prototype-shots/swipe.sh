#!/bin/zsh
# PROTOTYPE helper: swipe the pager one page left (or right with "back") on my simulator.
if [[ "$1" == back ]]; then
  ~/.local/axe/axe swipe --start-x 40 --start-y 560 --end-x 350 --end-y 560 --duration 0.3 --udid 11212E70-6308-469A-B131-7D99AB7DDDA2 >/dev/null
else
  ~/.local/axe/axe swipe --start-x 350 --start-y 560 --end-x 40 --end-y 560 --duration 0.3 --udid 11212E70-6308-469A-B131-7D99AB7DDDA2 >/dev/null
fi
sleep 2
