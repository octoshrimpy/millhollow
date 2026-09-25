# Millhollow: design

## Rules

- **Text is terse and factual.** Say what happened and what it changed: `Built farm.`,
  `Floor 3: won. +4🪨`, `Home after 5d: 🏺 🏺`. No flourishes, no mood-setting, no jokes in
  system text.
- **UI doesn't explain itself in words.** If a control needs a caption to be understood, redesign
  it: icons, placement and colour first. Labels are for actions that icons alone can't carry
  (save and load).
- **Time moves on a tap.** A day passes on End day. Expeditions cost days, not wall-clock time.
  Nothing runs while the game is closed.
- **No dark patterns.** No energy, no timers that punish absence, no daily streaks, no
  notifications.

## Village

- The land is generated from the save's seed: hills, mountains, woods, meadow, water, a river
  and ruins, on a 17×17 grid with fog beyond the town hall's sight.
- Untouched land is flat ground. Buildings and sites are raised cards. Open meadow is a dashed
  slot, the only place to build. Woods, hills and ruins clear to meadow for their yield; water and
  mountains stay.
- Farms, lumber camps and quarries get +25% beside water, woods and hills or mountains.
- Quarries turn up 0.15⛏️ a day, 0.5⛏️ beside mountains. Fishing docks only go beside water.
- Workplaces improve in place (+25%, +50%, +80%) instead of taking tools. An improved forge cuts
  crafting and brewing costs instead (−20%, −33%, −44%).
- Settlers level up, gain skill by working, and carry thoughts that move morale.
- Each person at home eats 1🍞 a day. A day without food costs 15% HP (never below 1) and halves
  their work, down to a tenth. Whoever has gone longest without eats first.

## Dungeons

- Sites on the overworld: the old mill, a barrow, a mine, a thornwood and a shrine. Each has its
  own foes, loot and a named keeper.
- No site is ever cleared. The keeper returns every third floor, stronger each time.
- Each floor cleared passes a day in town. Travel to a site and back costs days, by distance from the
  town hall, at least one. The walk home eats 1🍞 a
  day. The game asks once before a step that leaves only enough food for the walk home.
- Out of food below, every room costs 15% HP and the party fights at half attack.
- Packed food leaves the village counter as it's packed; what the walk home doesn't eat comes back.
- The party stands in two lanes under the foes. Walking foes hit the front lane; a melee fighter in
  the back lane swings at half (marked ½). Tap someone to move them across.
- Duty rosters (research) sends a party back to their old jobs when they get home.
- The dead stay on the floor they fell. Each haunts one living person, a witness if any survived:
  scared face, half work, −25% attack, −2 speed, −2 morale a day. The remains show as 🦴 on that
  floor on the next dive; carried home and put in a graveyard, they rest and the haunting ends.
  Unburied dead look angry, buried ones at peace.
- Floors are random room maps. Fights are real-time auto-battles with pause, speed, potions and
  retreat. Death is permanent.

## Names

Settler names come from an order-2 letter chain trained on a list of real names. Output that is
a real name, a plain word or has an awkward cluster is thrown back. Place names are a head (an
old word or a generated root) plus an English ending: `Brackmere`, `Aldwick`.

## Portraits

`assets/face-<id>-<age>-<mood>.webp`: 36 people, four ages (`child`, `young`, `mid`, `old`), five
moods (`happy`, `neutral`, `sad`, `angry`, `scared`), 192px. Each person was drawn as one 5×4
sheet, then sliced, so a face stays the same person across ages and moods. Originals of the 45
replaced child panels are in `assets/.orig-child/`.

Style, the same for every sheet: bold linocut relief print, thick carved lines, flat ink, no
gradients, two colours (amber-cream ink on dark brown), no text or border. The palette matches
the Millhollow theme (`#14110e` ground, `#c08a4e` accent). Other themes tint portraits two-tone.

The save stores a portrait's number, not a filename, so art can be redone without breaking saves.

## Earlier: the log rebuild

`log-rebuild.html` (`js/sim.js`, `js/app.js`) was a text-only village sim, read as a log. Kept
because it still runs. What it tried:

- **Backgrounds as lenses.** About sixty trades map to nine lenses (land, stores, body, history,
  labour, talk, forest, river, underground). Events carry tags; a lens shows the extra detail
  tagged for it. Two players read different logs of the same village.
- **One line shape.** `who - what where : result`. Fields never reorder or get rephrased, so an
  odd line stands out. Replaced prose that rotated phrasings and softened bad days.
- **Showing, not ordering.** Work beside someone and they keep doing that job until something
  they like more wins. Odds shown as *n* in 10; three misses and they give it up. Over 60 turns on
  five seeds, teaching everyone their best job cut 1–10 logs; teaching everyone timber cut
  170–229.
- **Rumours.** Villagers pass on opinions with their source event. Credulity and dislike of the
  teller change what's believed, opinions decay, and a hop can flip or swap the subject.
- **Save as input log.** `{seed, leader, inputs}` replayed through the seeded sim, about 28 bytes
  a turn.
- **Coming back.** Time away bought up to four picks of what the leader did meanwhile. Payouts
  were names, places and history, never stores or skill.

`transcript.js` runs that sim headless and prints two runs of one village for comparison.
