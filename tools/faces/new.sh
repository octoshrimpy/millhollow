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
mkdir -p sheets logs
STORE="$HOME/.codex/generated_images/"

for i in "$@"; do
  who=$(awk -v i="$i" '$1 == i { $1 = ""; $2 = ""; sub(/^  /, ""); print }' people.txt)
  [ -n "$who" ] || { echo "$i: no brief in people.txt"; continue; }
  [ -f "sheets/$i.png" ] && cp "sheets/$i.png" "sheets/$i.old.png"

  touch logs/.mark
  codex exec --skip-git-repo-check "Use your image_gen tool ONE time.

THE PERSON: $who.

WHAT MAKES THEM THE SAME PERSON, kept exactly in all twenty panels: their skin tone, the shape of the skull, the nose, the set and shape of the eyes, the shape of the ears, the shape of the mouth, the texture of their hair, and any moles, scars, freckles or birthmarks.

WHAT CHANGES WITH AGE, decided fresh for each row: how old they look, hair colour, hair length, whether they have a beard or moustache at all, their clothing.

Make ONE wide landscape image (1536x1024): a strict grid of 20 equal panels, 5 columns across and 4 rows down, separated by thin dark gutters. Every panel is a head-and-shoulders portrait, facing forward, centred, head filling most of the panel.

ROWS are age. The four rows must be four OBVIOUSLY different ages that a viewer could put in order at a glance.

Row 1 — A CHILD OF ABOUT 11. A child's proportions, not a shrunken adult: skull rounded and wide against a small undeveloped chin, full soft cheeks, large eyes set low in the face, a short nose, perfectly smooth skin, no jaw definition, no cheekbone shadow, a thin neck. Hair is a child's — dark or fair, never grey or white. ABSOLUTELY NO facial hair: no beard, no moustache, no stubble. CLOTHING: a plain simple child's smock or tunic with a soft plain neckline, and a BARE NECK. No jewellery, no earrings, no choker, no buckled collar, no necklace, no scarf, no fur, no armour, no heavy work clothing, no adult's knitwear, no hat, no spectacles, no pipe.

Row 2 — THE SAME PERSON AT ABOUT 30, YOUNG AND AT FULL STRENGTH. This row must read as a YOUNG ADULT at a glance. A firm clean jawline with NO jowls and NO sagging under the chin. Taut skin with NO wrinkles, NO lines from nose to mouth, NO crow's feet, NO bags under the eyes. Hair is FULL and DARK — absolutely no grey and no white, no thinning, no receding. If they have facial hair here it is dark, short and neat, never long, never grizzled, never white. A firm neck, not a thick or slack one. CLOTHING: the practical working clothes of an adult in their prime — a sturdy shirt, jerkin or jacket, well fitting. Clearly and unmistakably younger than row 3.

Row 3 — THE SAME PERSON AT ABOUT 48. The first deep lines from nose to mouth, creases at the eyes, a heavier and slacker jaw, grey coming in at the temples. CLOTHING: adult working clothes, heavier and more worn than row 2, perhaps an extra layer.

Row 4 — THE SAME PERSON AT ABOUT 78. Deeply carved lines all over, hollowed cheeks, a sunken mouth, thin white hair, heavy drooping lids, a thin loose neck. CLOTHING: what an old person wears — plain, heavy and warm, covering high on the neck. A shawl, a heavy wrap, a thick soft collar. NO tight neckwear of any kind: no choker, no buckled collar, no band around the throat, no youthful ornament.

COLUMNS are expression, the same five in every row, left to right: happy, neutral, sad, angry, frightened. The expression is in the face — the age and the clothing do not change across a row.

STYLE: bold linocut relief print, thick hand-carved lines, flat solid areas of ink, no gradients, no soft shading, no photographic texture. Only two colours: warm amber-cream ink on a very dark brown background. Visible gouge marks and chunky carved edges. Skin tone is carried by how much of the face is cut away to cream: dark skin is mostly dark ground with cream carved highlights, light skin is mostly cream with dark carved lines. No text, no labels, no numbers, no border, no signature.

Generate the one image. Do not write any code or files." < /dev/null > "logs/$i.log" 2>&1

  f=$(find "$STORE" -name '*.png' -newer logs/.mark -printf '%T@ %p\n' \
      | sort -n | tail -1 | cut -d' ' -f2-)
  if [ -n "$f" ]; then cp "$f" "sheets/$i.png"; echo "$i drawn"; else echo "$i FAILED"; fi
done
