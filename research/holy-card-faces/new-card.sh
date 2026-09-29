#!/bin/sh
# Generate a new holy card with Codex image generation, matching the set's frame and style, logging the run.
# Usage (repo root): research/holy-card-faces/new-card.sh <card-id> <initial-letter> "<subject>" "<face>" <ref-card-id>...
# <subject>: dress, attributes, pose and background. <face>: concrete traits (age, hair, beard, gaze).
# The ref cards are unedited originals from 4f53dc95b: they set the frame and, above all, how faces are painted.
# Writes drafts/<card-id>.png and appends a line to log.jsonl.
id=$1; letter=$2; subject=$3; face=$4; shift 4
dir=research/holy-card-faces
mkdir -p "$dir/drafts" "$dir/.base"
refs=""
for ref in "$@"; do
  git show "4f53dc95b:content/saints/$ref.png" > "$dir/.base/ref-$ref.png" 2>/dev/null || cp "content/saints/$ref.png" "$dir/.base/ref-$ref.png"
  refs="$refs $dir/.base/ref-$ref.png"
done
# shellcheck disable=SC2086
cat <<PROMPT | codex exec -s workspace-write -C "$PWD" --skip-git-repo-check -i $refs -- - 2>&1 | tail -3
The attached images are holy cards from one set. With your image generation tool, create ONE new card for the same set, in exactly the same frame and style: portrait 2:3, 1024x1536; cream parchment ground; thin gold ruled border; an illuminated initial "$letter" in gold on a blue square box at the top-left, with the same small flower ornament; the same vine-and-flower borders top and bottom (blue, red and gold flowers); an inner arched, gold-edged window holding the scene; a gold dotted-ring halo; late-19th-century chromolithograph rendering with soft colours and a fine printed texture. No text anywhere except the initial.
Subject: $subject
Face: $face
The face must be idealised and beautiful in the holy-card manner: noble, gentle, serene, with a devotional gaze. Never harsh, grotesque, or unflattering. Render it exactly like the faces on the attached cards: the same stylised, simplified 19th-century holy-card painting, soft even shading, clear outlines, the same eye and skin treatment. NOT photorealistic, not a modern portrait, no fine skin detail or dramatic lighting.
Save the result to $dir/drafts/$id.png. Do not modify any other file.
PROMPT
python3 -c 'import json,sys,datetime; print(json.dumps({"at": datetime.datetime.now().isoformat(timespec="seconds"), "card": sys.argv[1], "kind": "generate", "refs": sys.argv[2].split(), "subject": sys.argv[3], "face": sys.argv[4], "draft": sys.argv[5]}, ensure_ascii=False))' \
  "$id" "$*" "$subject" "$face" "$(git hash-object "$dir/drafts/$id.png" 2>/dev/null)" >> "$dir/log.jsonl"
