#!/bin/zsh
# run.sh <N> <phase-prompt-file> [chatId]
# Runs one Grok 4.7 phase for Psalm N from the repo root; logs stream-json + timing into the trial folder.
set -e
n=$1; prompt=$2; chat=$3
nnn=$(printf '%03d' $n)
root=/Users/gustavo/Documents/prayer/.claude/worktrees/parallel-prancing-avalanche
dir=$root/research/psalterium/trials/grok-4.7/ps$nnn
text=$(sed -e "s/{{N}}/$n/g" -e "s/{{NNN}}/$nnn/g" $prompt)
stamp=$(date +%Y%m%dT%H%M%S)
resume=()
[[ -n $chat ]] && resume=(--resume $chat)
start=$(date +%s)
cd $root
cursor-agent -p --force --trust --model grok-4.7-high-fast --output-format stream-json $resume "$text" > $dir/log.$stamp.jsonl
end=$(date +%s)
echo "$stamp $(basename $prompt) $((end-start))s" >> $dir/timing.txt
echo "done ps$nnn $(basename $prompt) in $((end-start))s"
