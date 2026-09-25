# Millhollow

A settlement builder and dungeon crawler for the browser. Play at
<https://octoshrimpy.github.io/millhollow/>. It installs as an app and plays offline.

## Play

- Found a town hall, clear land, build, and put settlers to work.
- Farms, lumber camps and quarries do better beside water, woods and hills. Fishing docks go
  beside water; quarries find more ore beside mountains.
- Send a party of 3–4 into dungeon sites on the overworld: the old mill, a barrow, a mine, a
  thornwood and a shrine. Each has its own foes, loot and keeper.
- Floors are random room maps. Fights are real-time auto-battles; you control pause, speed,
  potions and retreat. Death is permanent.
- Sites never clear. The keeper returns every third floor.
- Loot feeds the forge, the library's research and the village.

## Run locally

Vanilla JS, no build step, no backend. The save lives in `localStorage` and can be exported
from the gear menu.

```
python3 serve.py   # port 8791
```

## Code

All in `js/ds/`:

| File | Holds |
|---|---|
| `themes.js` | Colour themes |
| `data.js` | Tables: terrain, buildings, research, enemies, sites |
| `names.js` | Settler and place names |
| `game.js` | Rules, world generation, save |
| `combat.js` | Fights |
| `juice.js` | Particles, floating numbers, shakes, transitions |
| `ui.js` | DOM |
| `icons.js`, `sprite.js` | Icons |

`sw.js` and `manifest.webmanifest` make it installable. The worker always checks the server for
code, and an open page reloads itself when a deploy changes any script (never mid-fight).

## Icons

Game text uses emoji. `iconize()` in `icons.js` swaps each one for an SVG from `sprite.js`,
tinted by a hue the theme defines. To add or change an icon, edit the `ICONS` table and run:

```
python3 tools/build_icons.py
```

It pulls Lucide (`lu-`) and RPG Awesome (`ra-`) into `tools/.cache/`. `mh-` icons are drawn in
the script. Licences are in `ICON-LICENSES.md`.

## Themes

Eight dark and eight light themes in `themes.js`, picked from the gear menu and kept outside the
save. Portraits take a two-tone tint from the theme; the Millhollow theme shows them untouched.

## Older versions

Earlier takes still run but aren't maintained:

- `old-slice.html`: minigames and town projects.
- `log-rebuild.html`: log-driven village sim, described in `DESIGN.md`. `transcript.js` runs its
  sim headless.
