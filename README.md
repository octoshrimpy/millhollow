# Millhollow

A little village at the edge of a dungeon. You build it up, send people down, and live with
who comes back. Play it at <https://octoshrimpy.github.io/millhollow/>. It installs like an
app and works offline.

## What it's like

You start by picking a handful of settlers. Each has a face, a class and a past, and pasts
matter: the one who "burned down a forge" might do it again if you put them in yours, and the one who "fought bandits"
will want revenge if a friend dies below.

Up top, you clear land and build. Farms like water, lumber camps like woods, quarries like
hills. People get bored doing one job too long, buildings cost upkeep, food spoils if you
hoard it, and traders, bandits and strangers turn up at the gate.

Down below, a party of three or four walks a random map of rooms. Fights run on their own;
you pause, change speed, hand out potions, and decide when to run. Death is permanent. The
dead leave remains, and anyone left unburied haunts someone back home.

There are five places to dig into: the old mill, a barrow, a mine, a thornwood and a
shrine. None of them ever runs out, and every third floor has a keeper. Carry a keeper's
crown home and your land grows.

The village talks. When someone dies, people decide whose fault it was, and the story
changes as it gets passed around. Tap a face to hear what they think.

People age, marry, divorce and have children. Children inherit pieces of their parents'
natures and grudges, grow up at twelve, and carry the village into another generation.
Stray pets sometimes find the right person and may pass to someone close when their owner
dies.

Burial rites follow the dead person's deity. Voices at the graves can warn of trouble or
inspire the living. The wonder weathers each year; leave it cracked too long and it falls into
a ruin whose foes are your own dead villagers.

A barracks lets villagers drill as militia, while royal parties, refugees, deserters and
wildfires can bring new choices to the gate. Once the wonder stands, its gate can found and
switch between up to three settlements or send villagers through; settlements you are not
playing stay frozen. Travellers keep their ages, pet ages and remaining thought durations
when crossing between settlements with different local dates.

Ninety portraits change with a person's age and mood.

Goals live behind the bell. Some are hidden until they happen, and a few reward the long game:
how many people have ever lived in the village. Every year (365 days) ends with a recap of who
came and went, what got built and lost, and a few moments worth remembering, plus a gift of
relics. Every fifth year adds starmetal, and every tenth gets fireworks and a much bigger gift.
Past recaps are under the clock tab.

## Running it yourself

Plain JavaScript, no build step, no server code. Your save lives in the browser, and the
gear menu can export it as a code or a file.

Settings stays available even when a village is empty, so you can switch slots or import
a save. File imports ask before replacing the current game. Settings also has error logs;
an unexpected error opens a report with Copy and Email actions.

```
python3 serve.py   # http://localhost:8791
```

Run the focused simulation regression checks without changing any saved games:

```
node tools/sim/regressions.js
```

## Where things are

Everything lives in `js/ds/`:

| File | What's in it |
|---|---|
| `themes.js` | Colour themes |
| `text.js` | Every flavor-text pool: names, pasts, fireside lines |
| `data.js` | The tables: terrain, buildings, research, enemies, sites, pasts |
| `names.js` | Name generator for settlers |
| `game.js` | The rules, the world, saving |
| `combat.js` | Fights |
| `juice.js` | Particles, floating numbers, shakes |
| `ui.js` | Everything on screen |
| `icons.js`, `sprite.js` | Icons |

`sw.js` and `manifest.webmanifest` make it installable. If I push an update while you're
playing, the page saves and reloads itself when you're idle, but never during a fight.

## Icons

The game's text is written with emoji, and `iconize()` in `icons.js` swaps each one for a
proper SVG coloured by the current theme. To add or change one, edit the `ICONS` table and run:

```
python3 tools/build_icons.py
```

That pulls Lucide (`lu-`) and RPG Awesome (`ra-`) into `tools/.cache/`. The `mh-` icons are
drawn by hand in the script. Licences are in `ICON-LICENSES.md`.

## Themes

Eighteen of them, half dark and half light, picked from the gear menu. Your pick isn't part
of the save. Portraits get tinted to match, except in the Millhollow theme, which shows them
as drawn.

## Older versions

Two earlier attempts are still in the repo. They run, but I don't work on them anymore:

- `old-slice.html`: minigames and town projects.
- `log-rebuild.html`: a village told through its log, described in `DESIGN.md`.
  `transcript.js` runs it without a screen.
