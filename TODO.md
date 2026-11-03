# TODO

## End game
- [x] Bandit raids target stored goods
- [x] Storehouse, then guarded storehouse: raise resource cap, cut raid losses
- [x] World wonder: 2×2 build, costs past the base cap, the win condition

## Dungeon
- [x] Site difficulty ramp: each newly found site starts harder than the last (mill easiest)
- [x] Beastiary: kills per beast type
- [x] Levelling balance: sim the new XP and log curves against 1.5.20

## Magic
- [x] New building that unlocks spell/skill research
- [x] Class skills and spells unlocked by level and research
- [x] Enchanting room in dungeons: rare find that opens spell research

## UI
- [x] Map zoom
- [x] Goals: "new" badge on the bell, small rewards
- [x] Refactor the expedition villager picker
- [x] Play-test fight speed slider in a real fight and the unpaid-upkeep message

## Refactor: one home for string pools
Live build only (`js/ds/*`). Move every flavor-text pool into a new `js/ds/text.js`, loaded first.
Rule: a plain list/map of names or prose variants moves. Tables mixing strings with stats or
logic (BUILDINGS, ENEMIES, PAST_PAYS, PETS) stay. ID/key lists (`["weapon","armor"]`, resource picks, CAPPED, HUES) stay.
- [x] Create `js/ds/text.js`; add it before `data.js` in `index.html`, `sw.js`, and every `tools/sim/*.js` loader
- [x] Names: merge `NAMES` (data.js) and the `NAME_CORPUS` extras (names.js) into one table in text.js; `namesFor` and the Markov chain read from it
- [x] Pet names: `PET_NAMES` (data.js)
- [x] Place words: `PLACE_HEAD/WORD/TAIL/APART/PRE` and the `WORDS` blocklist (names.js)
- [x] Backstory prose: `PAST`, `PAST_VIOLENT`, `PAST_WAS` (data.js)
- [x] Fireside and muse lines: `FIRESIDE`, `FIRESIDE_AGAIN` (data.js), `MUSE` (game.js)
- [x] Inline `pick(["..."])` prose in game.js (~10: pet send-off/death, mourning, gifts, courting, keepsake names) → named consts in text.js
- [x] Sweep ui.js/game.js for remaining string-only pools (e.g. `GIFTS`, `TROUBLE_TITLE`, `FEELS`) and apply the rule
- [x] Verify: `node tools/sim/regressions.js` and `node tools/sim/play.js` pass; same seed gives same names
