#!/bin/bash
# Cut sheets into panels and install them: slice.sh 37 38 15-child   /   slice.sh (every sheet).
# Each sheet is a 5x4 grid split by thin gutters: row = age, column = mood.
# The model never draws the gutters on the even grid (up to ~25px off), so find them:
# a gutter line (cream or dark) is flat, every row through a face is not.
set -e
cd "$(dirname "$0")"
# whole sheets before fix.sh sheets, so a fix lands on top
ids=("$@"); [ ${#ids[@]} -gt 0 ] || ids=($(ls sheets | grep -E '^[0-9]+\.png$' | sed 's/\.png$//') $(ls sheets | grep -E '^[0-9]+-[a-z]+\.png$' | sed 's/\.png$//'))
python3 - "${ids[@]}" <<'EOF'
import sys, numpy as np
from PIL import Image
AGES = ["child", "young", "mid", "old"]
MOODS = ["happy", "neutral", "sad", "angry", "scared"]

def edges(a, n):
    """Cell spans along axis 0 of a: cut through the middle of the flattest band near each even cut."""
    L = a.shape[0]; std = a.std(1); cuts = [0]
    for k in range(1, n):
        lo = int(k * L / n) - 60
        y = lo + int(np.argmin(std[lo:lo + 120]))
        if std[y] > 25: sys.exit(f"no gutter near {k * L // n}")
        band = [i for i in range(y - 12, y + 13) if std[i] < std[y] + 10]
        cuts.append((band[0] + band[-1]) // 2)
    cuts.append(L)
    return list(zip(cuts, cuts[1:]))

def cut(img, x0, y0, x1, y1, name):
    # 9px off each side clears the gutter, then the centred square — the head is centred
    x0, y0, x1, y1 = x0 + 9, y0 + 9, x1 - 9, y1 - 9
    s = min(x1 - x0, y1 - y0); cx = (x0 + x1) // 2
    panel = img.crop((cx - s // 2, y0, cx - s // 2 + s, y0 + s)).resize((192, 192), Image.LANCZOS)
    g = np.asarray(panel.convert("L"), float)
    if any(sliver(e) for e in (g, g[::-1], g.T, g.T[::-1])): print(f"  face-{name}: a gutter is still inside the panel, look at it")
    panel.save(f"../../assets/face-{name}.webp", quality=72)

def sliver(a):
    # a flat gutter row near the edge with a different-coloured strip beyond it: the next panel bleeding in
    return any(a[i].std() < 14 and abs(a[:i].mean() - a[i].mean()) > 30 for i in range(1, 10))

for sheet in sys.argv[1:]:
    id, _, what = sheet.partition("-")
    img = Image.open(f"sheets/{sheet}.png").convert("RGB"); a = np.asarray(img.convert("L"), float)
    # a whole person is 4 ages x 5 moods; a fix.sh sheet is 2x3, one row (5 moods) or one column (4 ages)
    nr, nc = (2, 3) if what else (4, 5)
    try: rows, cols = edges(a, nr), edges(a.T, nc)
    except SystemExit as e: sys.exit(f"{sheet}: {e}")
    cells = [(y, x) for y in rows for x in cols]
    names = ([f"{id}-{a}-{m}" for a in AGES for m in MOODS] if not what else
             [f"{id}-{what}-{m}" for m in MOODS] if what in AGES else [f"{id}-{a}-{what}" for a in AGES])
    for ((y0, y1), (x0, x1)), name in zip(cells, names): cut(img, x0, y0, x1, y1, name)
    print(sheet, "sliced", "rows", [y for y, _ in rows], "cols", [x for x, _ in cols])
EOF
echo "$(ls ../../assets/face-*.webp | wc -l) panels, $(du -sh ../../assets | cut -f1) total"
