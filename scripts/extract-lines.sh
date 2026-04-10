#!/bin/bash
# Extract a range of lines from a file
# Usage: ./extract-lines.sh <file> <start> <end> [output]
#   If output is given, writes to that file. Otherwise prints to stdout.

if [ $# -lt 3 ]; then
  echo "Usage: $0 <file> <start_line> <end_line> [output_file]"
  exit 1
fi

FILE="$1"
START="$2"
END="$3"
OUTPUT="$4"

if [ -n "$OUTPUT" ]; then
  sed -n "${START},${END}p" "$FILE" > "$OUTPUT"
  WORDS=$(wc -w < "$OUTPUT" | tr -d ' ')
  echo "$OUTPUT — $WORDS words (lines $START-$END)"
else
  sed -n "${START},${END}p" "$FILE"
fi
