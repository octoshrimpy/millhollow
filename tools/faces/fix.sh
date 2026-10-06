#!/bin/bash
# Redraw one row or one column of a person, seeded from their current panels:
#   fix.sh 15 child "looks too old"      five moods at one age
#   fix.sh 35 happy "reads as neutral"   four ages in one mood
# Draws sheets/<id>-<row|mood>.png as a 3x2 grid of square panels; slice.sh <id>-<row|mood> installs it.
cd "$(dirname "$0")"
. ./prompt.sh
mkdir -p sheets logs
STORE="$HOME/.codex/generated_images/"
id=$1 what=$2 note=$3
AGES=(child young mid old); MOODS=(happy neutral sad angry scared)
declare -A AGE=([child]="$AGE_CHILD" [young]="$AGE_YOUNG" [mid]="$AGE_MID" [old]="$AGE_OLD")

if [ -n "${AGE[$what]}" ]; then
  panels="Six panels of this person, all at one age, with these expressions left to right, top row then bottom row: happy, neutral, sad, angry, frightened, neutral. $MOODS_TEXT

THE AGE: ${AGE[$what]}"
else
  panels="Four panels of this person, every one $what. $MOODS_TEXT Top left: ${AGE[child]} Top middle: ${AGE[young]} Top right: ${AGE[mid]} Bottom left: ${AGE[old]} Leave the bottom middle and bottom right panels empty dark ground."
fi

seed="$PWD/logs/seed-$id.png"
# the row or column being redrawn is wrong by definition: blank it, or the model copies the mistake
magick montage $(for a in "${AGES[@]}"; do for m in "${MOODS[@]}"; do
  [ "$a" = "$what" ] || [ "$m" = "$what" ] && echo "xc:#14110e[192x192!]" || echo "$ART/face-$id-$a-$m.webp"; done; done) \
  -tile 5x -geometry +6+6 -background '#e8c48a' "$seed"
out="sheets/$id-$what.png"; [ -f "$out" ] && cp "$out" "${out%.png}.old.png"

touch logs/.mark
codex exec --skip-git-repo-check "Use your image_gen tool ONE time, passing referenced_image_paths=[\"$seed\", \"$STYLE_REF\"].

The first referenced image is ONE PERSON drawn at every age and mood except the blank ones, which are what you are drawing now: four ages down (about 11, 28, 48, 78), five expressions across (happy, neutral, sad, angry, frightened). Keep exactly who they are: the skull, nose, eye shape, ears, mouth, skin tone, hair texture and any marks. $PROPORTION $STYLE_REF_NOTE
${note:+
What went wrong before, fix it: $note.
}
Make ONE wide landscape image (1536x1024): a strict grid of 6 equal SQUARE panels, 3 across and 2 down, separated by thin dark gutters. Every panel is a head-and-shoulders portrait, facing forward, centred, head filling most of the panel.

$panels

$STYLE

Generate the one image. Do not write any code or files." < /dev/null > "logs/fix-$id-$what.log" 2>&1

f=$(find "$STORE" -name '*.png' -newer logs/.mark -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
if [ -n "$f" ]; then cp "$f" "$out"; echo "$id $what drawn"; else echo "$id $what FAILED"; fi
