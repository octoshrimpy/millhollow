#!/bin/bash
# Draw new people from written briefs: new.sh 37 38 39   /   new.sh $(seq 37 60)
# Each id's brief is its line in people.txt ("<id> <f|m|any> <description>").
#
# One sheet per person: 5 moods across, 4 ages down, one generation. Identity
# holds far better inside a single image than across separate calls.
#
# Sequential on purpose. codex does not print the path it wrote, so a sheet is
# found as "newest png since the marker"; run two at once and they claim each
# other's image, silently pairing a face to the wrong id.
cd "$(dirname "$0")"
. ./prompt.sh
mkdir -p sheets logs
STORE="$HOME/.codex/generated_images/"

for i in "$@"; do
  who=$(awk -v i="$i" '$1 == i { $1 = ""; $2 = ""; sub(/^  /, ""); print }' people.txt)
  [ -n "$who" ] || { echo "$i: no brief in people.txt"; continue; }
  [ -f "sheets/$i.png" ] && cp "sheets/$i.png" "sheets/$i.old.png"

  touch logs/.mark
  codex exec --skip-git-repo-check "Use your image_gen tool ONE time, passing referenced_image_paths=[\"$STYLE_REF\"].

$STYLE_REF_NOTE

THE PERSON: $who.

WHAT MAKES THEM THE SAME PERSON, kept exactly in all twenty panels: their skin tone, the shape of the skull, the nose, the set and shape of the eyes, the shape of the ears, the shape of the mouth, the texture of their hair, and any moles, scars, freckles or birthmarks. $PROPORTION

WHAT CHANGES WITH AGE, decided fresh for each row: how old they look, hair colour, hair length, whether they have a beard or moustache at all, their clothing.

Make ONE wide landscape image (1536x1024): a strict grid of 20 equal panels, 5 columns across and 4 rows down, separated by thin dark gutters. Every panel is a head-and-shoulders portrait, facing forward, centred, head filling most of the panel.

ROWS are age. The four rows must be four OBVIOUSLY different ages that a viewer could put in order at a glance.

Row 1 — $AGE_CHILD

Row 2 — $AGE_YOUNG

Row 3 — $AGE_MID

Row 4 — $AGE_OLD

COLUMNS are expression, the same five in every row, left to right: $MOODS_TEXT The age and the clothing do not change across a row.

$STYLE

Generate the one image. Do not write any code or files." < /dev/null > "logs/$i.log" 2>&1

  f=$(find "$STORE" -name '*.png' -newer logs/.mark -printf '%T@ %p\n' \
      | sort -n | tail -1 | cut -d' ' -f2-)
  if [ -n "$f" ]; then cp "$f" "sheets/$i.png"; echo "$i drawn"; else echo "$i FAILED"; fi
done
