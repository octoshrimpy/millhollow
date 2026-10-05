#!/bin/bash
# Cut sheets into their 20 panels and install them: slice.sh 37 38   /   slice.sh (every sheet).
# Cut each 1536x1024 sheet into its 20 panels and install them as game assets.
# Cells come out 307x256 row-major: row = age, column = mood.
set -e
cd "$(dirname "$0")"
OUT=../../assets
AGES=(child young mid old)
MOODS=(happy neutral sad angry scared)

mkdir -p "$OUT" tmpcells
ids=("$@"); [ ${#ids[@]} -gt 0 ] || ids=($(ls sheets | grep -E '^[0-9]+\.png$' | sed 's/\.png$//'))
for id in "${ids[@]}"; do
  sheet="sheets/$id.png"
  rm -f tmpcells/*.png
  magick "$sheet" -crop 5x4@ +repage +adjoin tmpcells/c-%d.png
  n=$(ls tmpcells/*.png | wc -l)
  [ "$n" -eq 20 ] || { echo "$id: got $n cells, not 20"; exit 1; }
  for c in $(seq 0 19); do
    # shave the gutter off, then square-crop the centre — the head is centred
    # and ~200px wide in a 307px cell, so a 256 crop keeps the ears
    magick "tmpcells/c-$c.png" -shave 11x11 \
      -gravity center -crop 246x246+0+0 +repage \
      -resize 192x192 -quality 72 \
      "$OUT/face-$id-${AGES[$((c / 5))]}-${MOODS[$((c % 5))]}.webp"
  done
  echo "$id sliced"
done
rm -rf tmpcells
echo "$(ls "$OUT"/face-*.webp | wc -l) panels, $(du -sh "$OUT" | cut -f1) total"
