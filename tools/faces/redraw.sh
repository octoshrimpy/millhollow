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
mkdir -p sheets logs
STORE="$HOME/.codex/generated_images/"
ART="$(cd ../../assets && pwd)"

for i in "$@"; do
  # ids 1-30 have an original portrait to seed from. 31-36 never did — they were
  # drawn from written briefs — so they reseed from their own age-30 panel, which
  # is the closest thing they have to an original.
  src="$ART/portrait-$i.webp"
  [ -f "$src" ] || src="$ART/face-$i-young-neutral.webp"
  [ -f "$src" ] || { echo "$i no seed"; continue; }
  [ -f "sheets/$i.png" ] && cp "sheets/$i.png" "sheets/$i.old.png"

  touch logs/.mark
  codex exec --skip-git-repo-check "Use your image_gen tool ONE time, passing referenced_image_paths=[\"$src\"].

The referenced image is a portrait of ONE PERSON. You will redraw THAT SAME PERSON twenty times, at four ages and five expressions.

WHAT MAKES THEM THE SAME PERSON — copy these exactly in all twenty panels: the shape of the skull, the nose, the set and shape of the eyes, the shape of the ears, the shape of the mouth, and any moles, scars, freckles or birthmarks.

WHAT IS NOT PART OF THEM — do NOT copy these from the reference, decide them fresh for each row from the age of that row: how old they look, hair colour, hair length, whether they have a beard or moustache at all, their clothing, their hat, their collar, their jewellery. The reference shows this person at ONE moment of their life wearing ONE outfit. The other rows are different decades of that life and they are not wearing that outfit.

Make ONE wide landscape image (1536x1024): a strict grid of 20 equal panels, 5 columns across and 4 rows down, separated by thin dark gutters. Every panel is a head-and-shoulders portrait, facing forward, centred, head filling most of the panel.

ROWS are age. The four rows must be four OBVIOUSLY different ages that a viewer could put in order at a glance.

Row 1 — A CHILD OF ABOUT 11. A child's proportions, not a shrunken adult: skull rounded and wide against a small undeveloped chin, full soft cheeks, large eyes set low in the face, a short nose, perfectly smooth skin, no jaw definition, no cheekbone shadow, a thin neck. Hair is a child's — dark or fair, never grey or white. ABSOLUTELY NO facial hair: no beard, no moustache, no stubble. CLOTHING: a plain simple child's smock or tunic with a soft plain neckline, and a BARE NECK. No jewellery, no earrings, no choker, no buckled collar, no necklace, no scarf, no fur, no armour, no heavy work clothing, no adult's knitwear, no hat, no spectacles, no pipe.

Row 2 — THE SAME PERSON AT ABOUT 30, YOUNG AND AT FULL STRENGTH. This row must read as a YOUNG ADULT at a glance. A firm clean jawline with NO jowls and NO sagging under the chin. Taut skin with NO wrinkles, NO lines from nose to mouth, NO crow's feet, NO bags under the eyes. Hair is FULL and DARK — absolutely no grey and no white, no thinning, no receding. If they have facial hair here it is dark, short and neat, never long, never grizzled, never white. A firm neck, not a thick or slack one. CLOTHING: the practical working clothes of an adult in their prime — a sturdy shirt, jerkin or jacket, well fitting. Clearly and unmistakably younger than row 3.

Row 3 — THE SAME PERSON AT ABOUT 48. The first deep lines from nose to mouth, creases at the eyes, a heavier and slacker jaw, grey coming in at the temples. CLOTHING: adult working clothes, heavier and more worn than row 2, perhaps an extra layer.

Row 4 — THE SAME PERSON AT ABOUT 78. Deeply carved lines all over, hollowed cheeks, a sunken mouth, thin white hair, heavy drooping lids, a thin loose neck. CLOTHING: what an old person wears — plain, heavy and warm, covering high on the neck. A shawl, a heavy wrap, a thick soft collar. NO tight neckwear of any kind: no choker, no buckled collar, no band around the throat, no youthful ornament.

COLUMNS are expression, the same five in every row, left to right: happy, neutral, sad, angry, frightened. The expression is in the face — the age and the clothing do not change across a row.

STYLE: match the referenced image exactly — bold linocut relief print, thick hand-carved lines, flat solid areas of ink, no gradients, no soft shading, no photographic texture. Only two colours: warm amber-cream ink on a very dark brown background. Visible gouge marks and chunky carved edges. No text, no labels, no numbers, no border, no signature.

Generate the one image. Do not write any code or files." < /dev/null > "logs/redraw-$i.log" 2>&1

  f=$(find "$STORE" -name '*.png' -newer logs/.mark -printf '%T@ %p\n' \
      | sort -n | tail -1 | cut -d' ' -f2-)
  if [ -n "$f" ]; then cp "$f" "sheets/$i.png"; echo "$i redrawn"; else echo "$i FAILED"; fi
done
