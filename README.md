# Millhollow

> **Current game (`index.html`, `js/ds/`):** build a settlement above an old
> mill, staff its buildings, and send a party of up to 3–4 settlers down the
> stair under the mill. Floors are randomized room maps; fights are real-time
> auto-battles; heroes fire their own skills. You control pause, speed,
> potions, and flee. Death is permanent. Loot feeds crafting (forge), research (library), and the village.
> `data.js` tables · `game.js` rules/save · `combat.js` fights · `juice.js` particles, floating numbers, shakes, transitions (no audio yet) · `ui.js` DOM.
> Earlier versions: `old-slice.html` (below), `log-rebuild.html` (`DESIGN.md`).

Vanilla JS, no build step, no backend — `localStorage` only. Run it with
`python3 serve.py` (defaults to port 8791) and open `index.html`.

> **This file documents the original vertical slice, which now lives at
> `old-slice.html`.** `index.html` is the rebuild: see `DESIGN.md`. The two
> share nothing but `serve.py`. The old one is kept because it still runs
> and there's no version control here to recover it from — it is not being
> maintained, and everything below describes it, not the game at
> `index.html`.

## The loop

Gather wood/fish/ore via three short minigames → spend resources on
villager-proposed town projects → approving either resolves instantly or
takes a short real-time build delay → unlocks new minigames, villagers, and
story beats.

## What's built

### Proposal cards show irreversible tradeoffs
Projects with still-live rivals list every project they rule out directly on
the proposal card, while keeping the final confirmation before approval.

### Town grid clusters by theme
`renderTown()` keeps each river, forest, mountain, and general village group
together in the grid, with a subtle colored edge marking each area.

### Proposals take time to complete; nets = idle fishing
Implemented in `js/state.js` / `js/ui.js`:
- Approving a project starts a `BUILD_TIME_MS` timer (`state.building`)
  instead of instant approval; resolves on next render tick or app reopen.
- `better_nets`, once approved, unlocks a manual cast/collect net UI
  (`state.netCast`) that trickles fish over real time, capped at `NET_CAP`,
  requires an explicit Collect tap. `collectNet()` sets `active = false` on
  payout, so each cast is one finite expedition — re-fishing requires a
  fresh Cast Net tap, not a silently-refilling idle loop.
- `DEV_MODE` flag at the top of `state.js` zeroes both timers for fast
  testing; flip to `false` to feel real pacing.
- `better_nets` vs `repaint_boat` is a playstyle branch (safe/passive nets
  vs. active skill-combo boat), not a strictly better pick — both sides get
  an aftermath scene of equal weight.
- Approving a project that forecloses a rival (`excludes`) shows a
  `confirm()` prompt naming the rival before committing, since that
  decision is permanent.

### Project aftermath scenes
Every `PROJECTS` entry can carry an `aftermath: [text, ...]` array. On
completion (in `checkBuilding()`), the first line is revealed immediately
into `state.townNotes` (shown in the "Town Notes" panel); any further lines
queue in `state.pendingNotes` and reveal when the player clicks that
project's own town tile (`revealNoteForProject()`) — visiting the built
thing earns the story, not just reopening the app. A small dot on the tile
hints there's something queued, without spoiling it. Never on a timer,
nothing expires unseen. Pure curiosity/relationship payoff, no reward
attached.

### Town charter: an irreversible first choice that reshapes the run
Three zero-cost, mutually-exclusive projects with no prereqs —
`river_charter`, `forest_charter`, `mine_charter` (`js/data.js`) — sit
available from the very start. Picking one grants a small resource bundle,
permanently widens or multiplies that minigame's yield (`easeBonus` /
`yieldBonus`), and gates one existing project behind it (`better_nets` needs
`river_charter`, `library_shelf` needs `forest_charter`, `new_pickaxe` needs
`mine_charter`) — so a second playthrough with a different charter plays
through a genuinely different subset of projects, not just the same content
in a new order. Uses the existing generic `excludes`/`prereq`/`grant`
plumbing; no new engine code, just new data.

### Old Millwheel: rules change, not just numbers get bigger
`old_millwheel` replaces fishing's single target with two out-of-phase markers
and two zones that must align on one click. It stacks with the boat's combo
scoring without changing what a successful catch pays.

### Fishing vs. chopping: same timing bar, opposite risk profile
`js/minigames.js`'s shared `startTimingGame()` now branches on mode flags
instead of one universal bonus stage:
- **Fishing** (`comboBonus`, unlocked by `repaint_boat`): each hit auto-banks
  and the streak escalates the reward while tightening the zone and
  speeding the marker. A miss only resets the streak counter — everything
  already caught stays caught. Pure risk-free push, reads as "how far can I
  ride this," not "how much can I lose."
- **Chopping** (`pushLuck`, always on): hits pile into an unbanked pool with
  an explicit "Bank N wood" / "Push your luck" choice after every swing. A
  miss after pushing loses the *whole* pool, not just the last swing — a
  real bank-or-lose decision every round.
- `better_nets` (no flags) keeps the old plain hit-and-bank loop: slower,
  safer, no streak to manage — the passive option the descriptions promise.

### Mining: a shared swing budget and real information, not pure luck
`startMining()` (`js/minigames.js`) now gives each 3×3 vein a shared
`TOTAL_SWINGS` budget (10) instead of unlimited clicks — you can't crack
every rock, so which ones you spend hits on matters. Cracked empty rocks
reveal a minesweeper-style neighbor count (`🪶3` = 3 of its up-to-8
neighbors hold ore), so later swings in a vein are an actual deduction, not
a blind reroll. `hasOre` odds dropped from 70% to 50% to make that
information worth reading.

### Minigame hit feedback
`startTimingGame()` and `startMining()` layer brief canvas flashes, rising
`+N` rewards, and guarded WebAudio beeps over their existing hit and miss
branches; resource math and minigame mechanics stay unchanged.

### Village epilogue
`checkEpilogue()` in `state.js` fires once, the moment nothing is available
to decide and nothing is mid-build (`availableProjects().length === 0 &&
state.building.length === 0`) — checked on every decline too, not just on
build completion, so declining the last open thread still triggers it.
Drops a one-time closing town note. Deliberately not "all projects
approved" — one pair is mutually exclusive, and a resolved decline should
count as resolved, not as unfinished business.

### Thread progress, without pressure
`threadProgress()` derives settled and total counts from `PROJECTS`,
`isApproved()`, and `state.foreclosed`, and `renderResourceBar()` shows the
plain result alongside resources. It is read-only and deliberately has no
countdown, urgency color, animation, or reward attached.

### Newcomers: welcomed in or turned away
New villagers arrive as a distinct decision, not another construction
project. `PROJECTS` entries can carry `newcomer: true` + `subject:
villagerId`; `renderProposals()` gives those a different card (bigger
framing, "Welcome them in" / "Turn them away" instead of "Approve" /
"Decline") but reuses the exact same `approveProject`/`declineProject`
plumbing underneath — permanence, cost, prereqs, all free. `hasSurfaced()`
also matches on `subject`, so the newcomer shows up in the normal villagers
panel with their base blurb before you've decided anything. First one
authored: Rowan, a hedge-witch who crosses the newly-repaired bridge
(`repair_bridge`'s 3rd aftermath line frames the arrival as an unplanned
surprise, not something the player queued up). Accepting nets a small
`grant` (2 ore, shown in the card as "Brings:") and unlocks a follow-up
project Rowan themself proposes (terracing their garden). Turning them away
is not punishing — `declineAftermath` gives it a wistful, respectful
send-off, and it's reconsiderable later like any other decline. Either way,
`deniedBlurb` / `updates` on the villager entry means the world remembers
which way it went — nothing is forgotten, not even a rejection.

### Favors leave a permanent mark, not just a one-time toast
`VILLAGERS[].favor` can carry `blurbAfter`: once the favor is done, the
villager's blurb in the panel permanently changes to reference it (e.g.
Mira: "swears she has no idea why Bellamy's pies got better, grinning the
whole time she says it"). A completed favor changes how you see that person
from then on, not just a scene you saw once and moved past.

### Finite villager favors
`VILLAGERS[].favor = { after, cost, task, scene }`. Once the linked project
is approved, the villager's card shows a one-off errand (a small resource
hand-in via `completeFavor()`), done at most once per villager
(`state.completedFavors`), rewarding a town note — not a production bonus.
Ties into existing relationship threads (Mira/Bellamy, Tomas/Pike,
Agatha/Finn) instead of adding a new generic system.

## Design constraints (deliberate)

No dark patterns: no timers that punish absence, no FOMO, no energy system,
no notifications. Ideas that trended toward the daily-obligation/idle shape
(timed villager errands with offline catch-up, daily rotations,
trust/relationship meters, procedural quests) were considered and
explicitly skipped — see `IDEAS.md` for what's still on the table.

## Icons

Game text keeps its emoji. `iconize()` in `js/ds/icons.js` draws each one from `js/ds/sprite.js` at
render time. Each icon names a hue (red, green, brown…), and the theme decides what that hue looks like. To add or change an icon, edit the `ICONS` table and run
`python3 tools/build_icons.py`. It pulls Lucide (`lu-`) and RPG Awesome (`ra-`) into `tools/.cache/`;
`mh-` icons are drawn in the script. Licences are in `ICON-LICENSES.md`.

## Themes

`js/ds/themes.js` holds eight dark and eight light themes, each a light/dark pair. The gear menu
picks one, and the choice is kept outside the save. A theme is a set of surface colours plus a
ten-hue palette. Portraits get a two-tone tint from the theme; Millhollow shows them untouched.
