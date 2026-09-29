#!/bin/sh
# Edit only the face of a holy card with Codex image generation, logging the run.
# Usage (repo root): research/holy-card-faces/edit-face.sh <card-id> "<face description>" [base-ref] [style-card-id]
# [style-card-id]: an unedited card whose face rendering the new face must match (default ignatius_loyola).
# Edits from the card as of [base-ref] (default: the pre-project original, 4f53dc95b), never from an
# earlier edit — every edit adds grain. Writes drafts/<card-id>.png and appends a line to log.jsonl.
id=$1; face=$2; base=${3:-4f53dc95b}; style=${4:-ignatius_loyola}
dir=research/holy-card-faces
mkdir -p "$dir/drafts" "$dir/.base"
git show "$base:content/saints/$id.png" > "$dir/.base/$id.png" 2>/dev/null || cp "content/saints/$id.png" "$dir/.base/$id.png"
git show "4f53dc95b:content/saints/$style.png" > "$dir/.base/style-$style.png"
cat <<PROMPT | codex exec -s workspace-write -C "$PWD" --skip-git-repo-check -i "$dir/.base/$id.png" "$dir/.base/style-$style.png" -- - 2>&1 | tail -3
The FIRST attached image is a holy card. The SECOND is another card from the same set, attached only as a style reference for how faces are rendered. Edit the first card with your image generation tool, changing ONLY the saint's head and face. Keep everything else pixel-identical in spirit: frame, illuminated initial, borders, halo position and size, clothing, hands, attributes, background, composition, 1024x1536, and the same late-19th-century chromolithograph rendering.
New head and face: $face
The face must be recognisably this saint and distinct from other cards (proportions, hair, beard, age), yet idealised and beautiful in the holy-card manner: noble, gentle, serene. Never harsh, grotesque, or unflattering.
Render the face exactly like the face in the second image: the same stylised, simplified 19th-century holy-card painting — soft even shading, gently idealised features, clear outlines, the same eye and skin treatment and texture. NOT photorealistic, not a modern realistic portrait, no fine skin detail or dramatic lighting. The new face must look painted by the same hand as the rest of the card.
Save the result to $dir/drafts/$id.png. Do not modify any other file.
PROMPT
python3 -c 'import json,sys,datetime; print(json.dumps({"at": datetime.datetime.now().isoformat(timespec="seconds"), "card": sys.argv[1], "base": sys.argv[2], "face": sys.argv[3], "draft": sys.argv[4]}, ensure_ascii=False))' \
  "$id" "$base" "$face" "$(git hash-object "$dir/drafts/$id.png" 2>/dev/null)" >> "$dir/log.jsonl"
