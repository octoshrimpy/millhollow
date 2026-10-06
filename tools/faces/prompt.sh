# Prompt text shared by new.sh, redraw.sh and fix.sh, so a lesson lands in all three.
# Each line here exists because a sheet came out wrong without it:
#   child  — smile lines and a hard jaw made 11-year-olds read 40 (Osmund, Maud, Ansel happy)
#   young  — "about 30" drifted to 45–50 (Osmund, Quennel, Rushton, Ansel); "younger" alone went to 15
#   ears   — a big-eared brief got bigger every row until the young adult read as a caricature (face 60);
#            "big ears" on a small child's head came out as jug handles (27, 32, 34, 36)
#   happy  — a closed-mouth half smile reads as neutral at 64px (Isolde)
#   style  — with words alone, dark skin drifted to soft brown shading (37, 38, 39, 48, 51)
ART="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../assets" && pwd)"

AGE_CHILD="A CHILD OF ABOUT 11. A child's proportions, not a shrunken adult: skull rounded and wide against a small undeveloped chin, full soft cheeks, large eyes set low in the face, a short nose, a thin neck, no jaw definition, ears small and close to the head, never bigger or more sticking-out than the same person's adult ears, no cheekbone shadow. Perfectly smooth skin with NO lines anywhere — not even when smiling: a laughing child has round smooth cheeks, never creases at the eyes or mouth. Hair is a child's — dark or fair, never grey or white. ABSOLUTELY NO facial hair. CLOTHING: a plain child's smock or tunic with a soft plain neckline and a BARE NECK. No jewellery, no scarf, no fur, no armour, no heavy work clothing, no adult's knitwear, no hat, no spectacles, no pipe."

AGE_YOUNG="A GROWN ADULT OF ABOUT 28 — clearly a man or woman, not a teenager, yet showing NO sign of age at all. A firm clean jawline with NO jowls. Taut skin with NO wrinkles, NO lines from nose to mouth, NO crow's feet, NO bags under the eyes, NO furrowed brow. Hair is FULL and DARK — no grey, no white, no thinning, no receding. Facial hair, if any, is dark, short and neat, never long, grizzled or white. A firm neck. CLOTHING: practical working clothes of an adult in their prime — a sturdy well-fitting shirt, jerkin or jacket. Clearly older than the child, and unmistakably younger than the 48-year-old."

AGE_MID="THE SAME PERSON AT ABOUT 48. The first deep lines from nose to mouth, creases at the eyes, a heavier and slacker jaw, grey coming in at the temples. CLOTHING: adult working clothes, heavier and more worn than at 28, perhaps an extra layer."

AGE_OLD="THE SAME PERSON AT ABOUT 78. Deeply carved lines all over, hollowed cheeks, a sunken mouth, thin white hair, heavy drooping lids, a thin loose neck. CLOTHING: plain, heavy and warm, covering high on the neck — a shawl, a heavy wrap, a thick soft collar. NO tight neckwear: no choker, no buckled collar, no youthful ornament."

PROPORTION="Distinctive features — big ears, a long nose, a gap in the teeth — stay the same SIZE relative to the head at every age. Never exaggerate them into a caricature."

MOODS_TEXT="happy, neutral, sad, angry, frightened. HAPPY is a broad open smile that shows in the whole face — lifted cheeks, teeth showing, never a polite closed-mouth smile that could pass for neutral."

STYLE="STYLE: match the STYLE of the referenced linocut panels — bold linocut relief print, thick hand-carved lines, flat solid areas of ink, no gradients, no soft shading, no mid-tones, no photographic texture. Only two colours: warm amber-cream ink on a very dark brown background. Visible gouge marks and chunky carved edges. Skin tone is carried by how much of the face is cut away to cream: dark skin is mostly dark ground with cream carved highlights, light skin is mostly cream with dark carved lines. No text, no labels, no numbers, no border, no signature."

# Six strangers who came out right, dark skin and light: a style reference, never an identity.
STYLE_REF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/logs/style.png"
mkdir -p "$(dirname "$STYLE_REF")"
[ -f "$STYLE_REF" ] || magick montage $(for i in 54 58 50 3 24 8; do echo "$ART/face-$i-young-neutral.webp"; done) -tile 3x -geometry +0+0 "$STYLE_REF"
STYLE_REF_NOTE="The image at $STYLE_REF shows six strangers carved the way every panel must be carved. It is a STYLE reference only — do not draw any of them."
