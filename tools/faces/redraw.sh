#!/bin/bash
# Redraw sheets by id, seeded from an existing portrait: redraw.sh 7 10 9
#
# Three things went wrong in pass 1, all the same mistake: the model treated
# everything in the seed portrait as identity. A seed of a bearded grey man in a
# cable-knit came back bearded, grey and cable-knit at eleven.
#
#   1. age bled upward — "young" rows read 50, because grey hair and jowls were
#      being copied as though they were the nose
#   2. facial hair on every row, including the child
#   3. the seed's clothing and accessories on every row — a choker on a
#      seventy-eight-year-old, an adult's knitwear on a child
#
# So the prompt now says outright what identity IS (skull, nose, ears, eye shape,
# mouth shape, marks) and what it is NOT (age, hair colour, facial hair, clothes).
# Existing sheets are kept as .old rather than overwritten, so a bad pass 2 can
# be rolled back.
cd "$(dirname "$0")"
. ./prompt.sh
mkdir -p sheets logs
STORE="$HOME/.codex/generated_images/"

for i in "$@"; do
  # ids 1-30 have an original portrait to seed from. 31+ never did — they were
  # drawn from written briefs — so they reseed from their own age-30 panel, which
  # is the closest thing they have to an original.
  src="$ART/portrait-$i.webp"
  [ -f "$src" ] || src="$ART/face-$i-young-neutral.webp"
  [ -f "$src" ] || { echo "$i no seed"; continue; }
  [ -f "sheets/$i.png" ] && cp "sheets/$i.png" "sheets/$i.old.png"

  touch logs/.mark
  codex exec --skip-git-repo-check "Use your image_gen tool ONE time, passing referenced_image_paths=[\"$src\", \"$STYLE_REF\"].

The first referenced image is a portrait of ONE PERSON. You will redraw THAT SAME PERSON twenty times, at four ages and five expressions. $STYLE_REF_NOTE

WHAT MAKES THEM THE SAME PERSON — copy these exactly in all twenty panels: the shape of the skull, the nose, the set and shape of the eyes, the shape of the ears, the shape of the mouth, and any moles, scars, freckles or birthmarks. $PROPORTION

WHAT IS NOT PART OF THEM — do NOT copy these from the reference, decide them fresh for each row from the age of that row: how old they look, hair colour, hair length, whether they have a beard or moustache at all, their clothing, their hat, their collar, their jewellery. The reference shows this person at ONE moment of their life wearing ONE outfit. The other rows are different decades of that life and they are not wearing that outfit.

Make ONE wide landscape image (1536x1024): a strict grid of 20 equal panels, 5 columns across and 4 rows down, separated by thin dark gutters. Every panel is a head-and-shoulders portrait, facing forward, centred, head filling most of the panel.

ROWS are age. The four rows must be four OBVIOUSLY different ages that a viewer could put in order at a glance.

Row 1 — $AGE_CHILD

Row 2 — $AGE_YOUNG

Row 3 — $AGE_MID

Row 4 — $AGE_OLD

COLUMNS are expression, the same five in every row, left to right: $MOODS_TEXT The age and the clothing do not change across a row.

$STYLE

Generate the one image. Do not write any code or files." < /dev/null > "logs/redraw-$i.log" 2>&1

  f=$(find "$STORE" -name '*.png' -newer logs/.mark -printf '%T@ %p\n' \
      | sort -n | tail -1 | cut -d' ' -f2-)
  if [ -n "$f" ]; then cp "$f" "sheets/$i.png"; echo "$i redrawn"; else echo "$i FAILED"; fi
done
