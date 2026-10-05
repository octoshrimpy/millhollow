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

- A new game opens on six people at the gate, one of each class and two more, each card with their past (green: where their trade came from, red: comes back badly); tap four to keep.
  The town hall already stands on the meadow nearest the middle.
- The land is generated from the save's seed: hills, mountains, woods, meadow, water, a river
  and ruins, with fog beyond what's known. The land has no edge: it grows outward as more is
  seen, the same land for the same seed. The town hall's sight reveals it, and clearing or
  building reveals one ring around that tile.
- The town hall wards 3 rings around it. Land past the ward is greyed and contested: each night,
  a building out there may be raided, with odds rising 3% per ring past the ward (at most 50%).
  A worker on site is hurt and drives it off (👁); an unwatched building is wrecked.
- Work more than 4 tiles from any bed is a long walk (👣).
- Untouched land is flat ground. Buildings and sites are raised cards. Open meadow is a dashed
  slot, the only place to build. Woods, hills and ruins clear to meadow for their yield; water and
  mountains stay.
- Farms, lumber camps and quarries get +25% beside water, woods and hills or mountains.
- Quarries turn up 0.15⛏️ a day, 0.5⛏️ beside mountains. Fishing docks only go beside water.
- Workplaces improve in place (+25%, +50%, +80%) instead of taking tools. An improved forge cuts
  crafting and brewing costs instead (−20%, −33%, −44%).
- Settlers level up, gain skill by working, and carry thoughts that move morale.
- Each person at home eats 1🍞 a day. A day without food costs 15% HP (never below 1) and halves
  their work, down to a tenth. From the third day without, they may leave for good: 5%, and 5% more each day after. Whoever has gone longest without eats first.
- Nights bring things, good and bad, grown from the village itself. Choices wait at the gate (a
  popup that says what's wanted and what each answer costs, then a button under the map). They reach a party below as well, on the dungeon screen.
  One person can be kept home on watch (👀): they don't work, count double when the gate is
  fought for, and halve the odds of bandits. Taking a job or going below ends the watch.
  Left until the next End day, trouble goes the worse way and a chance goes by; one that turns up
  partway through days on the road waits to be answered.
  - Someone holding a grudge may go for them (👊, both hurt). Anyone left under half drinks a
    potion, but the last two are kept for the dungeon.
  - Full stores draw bandits (🗡): pay a third of the biggest pile, or fight at the odds shown.
    Ignored, they take twice that. Losing a fight hurts everyone at home and costs the same twice
    over.
  - The haunted sometimes shut the forge door and want relics and more. Given, they come out with
    gear named for their ghost (✨). Refused, they smash where they work.
  - Pasts come back: debt collectors (pay or fight), a jilted ex who wants to join and holds a
    grudge, a mystic who burned down a library burning down yours. Good ones too: a bonesetter
    mends the worst hurt, a harvester brings in extra, a copyist finds research, a net-mender
    lands fish.
  - Plenty brings talk of a feast: 3🍞 a head (🍖). Everyone sits at one long table in no order; a
    grudge is let go only by two who end up side by side. Village weddings seat the same way.
  - Two content people with no grudge between them may want to marry (💍). They marry either
    way; 3🍞 a head buys the whole village a wedding. Anyone may run from their own wedding and leave the
    village for good (2%; 30% for someone who fled one before; 10 points less for anyone happy). Four
    times in five they leave their gear, found by the road the next day. The one left at the altar is jilted (💔), and the story
    goes round.
  - Half of feasts and weddings bring something else: a brawl (an old grudge if there is one),
    loose tongues (two rounds of gossip), someone wandering off drunk (missed the next day, back
    in a few, sometimes with a relic, one time in ten never), a stranger drawn by the music, a turned ankle, sore
    heads in the morning, or a groom or bride who fled a wedding nearly running again.
  - A trader offers 1 relic, 3 ore, 2 silver or 3 potions for 20 of the biggest pile (🛒).

## Dungeons

- Sites on the overworld: the old mill, a barrow, a mine, a thornwood and a shrine. Each has its
  own foes, loot and a named keeper. As the land grows, new sites turn up in it, about one per 200
  new tiles; the further out, the longer the walk.
- No site is ever cleared. The keeper returns every third floor, stronger each time.
- Beat a keeper on floor 3 or deeper and the party takes their crown (👑). Carried home, it widens
  the ward by a ring; the next crown has to come from 3 floors deeper (6, 9, 12…). A wipe loses it.
  One of the party carries it; fleeing a fight drops it half the time, and the rest blame the carrier.
- Foes grow steadily with depth until about floor 10, then compound: +15% a floor. The way-down
  button shows 💀 once the next floor is past that point, one more 💀 for each doubling.
- Heading home climbs back through every floor of the trip. Each one rolls once for an ambush,
  7% for every room left unexplored on it. A fight on the way up carries on home after.
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
- A settler's trade (their best skill) shows them some rooms from next door: woodcutters and
  fishers see fights, smiths and cooks treasure, healers and herbalists shrines, quarriers the way
  down, scholars and farmers events. Deep lanterns show every room next door.
- Survivors blame whoever stood in the dead's lane and walked out least hurt. The blame spreads as gossip at home: a gullible
  listener believes it from one telling, a sceptic needs two, nobody believes someone they blame,
  and each retelling can flip it or pin it on someone else. Holding a grudge against someone in
  the party sours the trip and shows on their face (😠); a third of the village blaming you (one,
  in a small village) wears you down (💬). A story fades from each person after 10–40 days. Burial ends the
  talk about that death.
- Tap a face to ask why. They answer with their own account, rumours as they believe them and who
  told them, so a story can be traced back through the village. Nothing says which version is true.
- Floors are random room maps. Fights are real-time auto-battles with pause, speed, potions and
  retreat. A hero under a quarter HP drinks a potion by themselves; tapping 🧪 still drinks one any time. Death is permanent.
- A won fight closes itself. The celebration scales with how lopsided the fight was against the
  party at the start, more for a keeper and for depth: a stomp gets a faint word, an upset fills
  the screen. It plays over the dungeon and doesn't block the next move.

## Saves

The save lives in the browser, which is asked to keep it (`navigator.storage.persist`) so Safari
doesn't clear it after a week away. 💾 beside the gear downloads it as a file; the gear menu
copies, opens and loads it as a code.

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
