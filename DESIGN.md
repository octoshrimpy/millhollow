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

- A new game opens on six people at the gate, one of each class and two more, each card with their past (green: where their trade came from, red: comes back badly); tap four to keep. Trades start at +1 to +5, each step four times rarer: +2 and +3 sometimes carry one red line, +4 and +5 always two.
  The town hall already stands on the meadow nearest the middle.
- The land is generated from the save's seed: hills, mountains, woods, meadow, water, a river
  and ruins, with fog beyond what's known. The land has no edge: it grows outward as more is
  seen, the same land for the same seed. The town hall's sight reveals it, and clearing or
  building reveals one ring around that tile.
- The town hall wards 3 rings around it. Land past the ward is greyed and contested: each night,
  a building out there may be raided, with odds rising 3% per ring past the ward (at most 50%).
  A worker on site is hurt and drives it off (👁); an unwatched building is wrecked, and the log
  says why.
- Work more than 4 tiles from any bed is a long walk (👣).
- Untouched land is flat ground. Buildings and sites are raised cards. Open meadow is a dashed
  slot, the only place to build. Woods, hills and ruins clear to meadow for their yield; water and
  mountains stay.
- Farms, fishing docks, lumber camps and quarries get +10% for each water, woods, hills or mountain tile touching a side (not corners). A dock's first water tile is its footing, not a bonus.
- Quarries turn up 0.15⛏️ a day, 0.5⛏️ beside mountains. Fishing docks only go on a side of water.
- Workplaces improve in place (+25%, +50%, +80%) instead of taking tools. An improved forge cuts
  crafting and brewing costs instead (−20%, −33%, −44%).
  A staffed improved workplace eats upkeep each day: 1 wood, 1 stone or 1 silver by level. Unpaid
  or unstaffed, it works as if never improved that day (red pips), the forge's cut included.
- Forging takes days at a staffed forge, one piece per forge: potions and wood 1, iron 2, silver 3,
  starmetal 4.
- Research is paid up front, then studied one at a time: a day per 4 research, each staffed
  library adding a day's progress.
- Settlers level up, gain skill by working, and carry thoughts that move morale.
- Everyone has their own patience for one job, 8–30 days back to back. Past it they're sick of it
  (😐, −3 morale a day) until they do something else: another job, a day off, or a trip below.
- Each person at home eats 1🍞 a day. A day without food costs 15% HP (never below 1) and halves
  their work, down to a tenth. From the third day without, they may leave for good: 5%, and 5% more each day after. Whoever has gone longest without eats first.
- Nights bring things, good and bad, grown from the village itself. Choices wait at the gate (a
  popup that says what's wanted and what each answer costs, then a button under the map). They reach a party below as well, on the dungeon screen.
  One person can be kept home on watch (👀), two after Night watch: they don't work, count double
  when the gate is fought for, and each halves the odds of bandits. Fortified walls halve them again,
  until bandits bring ladders: 10–30 days after the walls go up, and again 10–30 days after each
  siege, a bigger band comes whatever the odds and wants half the biggest pile.
  Taking a job or going below ends the watch.
  Left until the next End day, trouble goes the worse way and a chance goes by; one that turns up
  partway through days on the road waits to be answered.
  - Drives: everyone carries anger, fear, grief, restlessness, warmth and pride, 0–100. Every
    thought stirs some (hunger: anger and restlessness; a near death: fear; a feast eases anger,
    grief and restlessness and warms). Each night they ebb by a fifth; a grudge keeps stirring
    anger, morale under 30 keeps stirring restlessness, a spouse at home or morale 70+ warms, work
    stirs pride (twice over at skill 3+). A violent past stirs anger half again as hard. A drive at 40+ sets
    the face when no fresh thought does. The villager page shows each as pips (◆).
  - Past a drive's mark, people act on it, at most one act a night, likelier the further past and
    three times likelier when their past leans that way. Acting spends the drive:
    - anger 50+: goes for whoever they blame most, or anyone at 70+ (👊, both hurt; anyone left
      under half drinks a potion, the last two kept for the dungeon). The one hit holds it against
      them; everyone else is a little afraid. Leans: violent pasts.
    - anger 70+: wrecks their own workplace or their foe's; an arsonist burns it. Everyone home
      holds it against them. Leans: arson on purpose.
    - grief 55+: drinks 10🍞 or 5🥪. Leans: drank away a fortune.
    - restlessness 55+: walks off for a few days, back the same way as after a party. Leans: wanting
      to see the frontier.
    - restlessness 75+: leaves for good; anyone close to them grieves. Hungry ones go to find food.
      Leans: fled a wedding or debts, running from something, took the first road out.
    - warmth 40+: shows someone less skilled their trade.
    - warmth 45+: sits up with the worst hurt (+30% health; a bonesetter mends them whole). Leans:
      bones and nursing pasts.
    - warmth 45+: lets a grudge go. Leans: fed the poor, kept a chapel.
    - warmth 40+: wants to marry whoever they're closest to, tie 20+, if that one is warm too or a
      friend (💍). The widowed and the left-behind can marry again, unless they swore not to: a
      third of the widowed do. Some pairs are friends and nothing more: asking finds out, and
      neither asks the other again. Nobody has a sex; anyone can marry anyone. A wedding cools most others near courting a little; some it warms.
  - Ties: how two people stand with each other, −100 to 100. Evenings and talks together, lessons,
    mending, forgiving, a long table, fights won side by side raise it; brawls and jiltings sink it.
    Strong ties wear slowly unless kept up. Crossing 40 makes friends, −40 enemies. Small stuff (talks, walks, evenings out,
    retold tales, easy fights) is an aside: hidden from the log until a floating expand button shows them all in
    place, and still kept in people's own stories. The log is never cut short unless storage fills; then the oldest
    asides go first. The newest 2000 lines show, the rest behind a ▾. People spend evenings and talk mostly with whoever they're closest to. A death grieves the
    close, the spouse and the party; anyone else only sometimes.
    - pride 20+: means to outdo themselves; works half again as hard the next day.
    - pride 40+, idle: takes the gate unasked. Leans: guard pasts.
  - Full stores draw bandits (🗡): pay a third of the biggest pile, or fight at the odds shown.
    Ignored, they take twice that. Losing a fight hurts everyone at home and costs the same twice
    over. With water within 3 of the hall, a quarter of the time it's river pirates (🌊🗡) instead, whom
    walls don't halve.
  - Storage: food, wood, stone, ore, herbs and trail meals stop at 200 each (red in the bar); gains past it
    are lost, stock above it stays. Storehouse (📦, wood 14, stone 8): +200 each and raiders take 30% less.
    Rebuilt as a guarded storehouse (🔐, needs Fortified walls, stone 16, ore 3): +400 instead, and with
    someone working it raiders take 60% less. Several stack; the best shield applies.
  - Wonder (🗼, needs Architecture, wood 300, stone 300, ore 40): a 2×2 plot, no demolishing. The cost
    is past the base cap, so a storehouse comes first. Building it is the win: a banner and fireworks,
    then play goes on (S.won holds the day). Goals list storehouse and wonder.
  - The haunted, grieving at 30+, sometimes (no one twice in 20 days) shut the forge door and want relics and more. Given, they come out with
    gear named for their ghost (✨). Refused, they smash where they work.
  - Everyone has a pastime (whittling, baskets, the lute, dice, star-gazing, ~45 in all), mostly one
    their past leads to. Big moments (a death, a wedding, a near death, a win) sometimes turn them to
    another (after a death, they say whose). Most evenings someone spends time on theirs, sometimes with someone else: less
    restless and sad, a little warmer, and so are they.
  - Research builds places to spend evenings: Village green (park, playground, chapel, bandstand),
    Town square (fountain, archery range, workshop, stables), Games (axe yard, alehouse). Each makes
    evenings likelier; people mostly go to the one built for their pastime. Now and then someone
    asks for theirs (🙋 on the build menu, a count for each asker); building it gladdens them. Someone at anger 35+
    goes to the range or yard first, before it comes to blows, and leaves most of it there; with one
    built, blows are held against people half as long.
  - Pasts come back: debt collectors (pay or fight), a jilted ex who wants to join and holds a
    grudge, a mystic who burned down a library by accident burning down yours. Good ones too: a harvester brings in extra, a copyist finds research, a net-mender
    lands fish.
  - Plenty brings talk of a feast: 3🍞 a head (🍖); far likelier while anyone grieves, as a wake.
    Never while a party is below. A feast ends grief. Everyone sits at one long table in no order; a
    grudge is let go only by two who end up side by side. Village weddings seat the same way.
  - Courting ends in a wedding (💍). They marry either
    way; 3🍞 a head buys the whole village a wedding. Anyone may run from their own wedding and leave the
    village for good (2%; 30% for someone who fled one before; 10 points less for anyone happy). Four
    times in five they leave their gear, found by the road the next day. The one left at the altar is jilted (💔), and the story
    goes round.
  - Half of feasts and weddings bring something else: a brawl (an old grudge if there is one),
    loose tongues (two rounds of gossip), someone wandering off drunk (missed the next day, back
    in a few, sometimes with a relic, one time in ten never), a stranger drawn by the music, a turned ankle, sore
    heads in the morning, or a groom or bride who fled a wedding nearly running again.
  - A trader brings three offers (🛒), each 1 relic, 3 ore, 2 silver or 3 potions for 20 of one of the
    two biggest piles, that many times over for every 60 in it. Take one or none. Bigger piles bring
    traders sooner.
- Food beyond 20 a head spoils, a twentieth of the excess a day. Smoked meals keep.
- No day is empty. A day nothing else happens, someone tells their past by the fire (+2 morale
  for all), teaches someone their best trade (+0.5), talks late with someone, or brings back a few
  🍞, 🌿 or 🪵 from a walk. The day's line also shows research and forging still under way (⏳ ⚒).
- Fear 60+ won't go below (😔). The grieving may refuse too: 70% when the dead was their spouse or
  someone they think well of, 20% otherwise, decided once a day.
- The grieving with anger 35+ never refuse: from half HP up they join the next party and can't be
  taken off it (🔒). Below half, they wait. Everyone fed at home heals 3 HP a day, 9 with a staffed
  infirmary, working or not.
- A fire in someone's past was set on purpose or by accident. By accident, it can happen again where
  they work; on purpose counts as violent, and comes back through anger.

## Dungeons

- Sites on the overworld: the old mill, a barrow, a mine, a thornwood and a shrine. Each has its
  own foes, loot and a named keeper. As the land grows, new sites turn up in it, about one per 200
  new tiles; the further out, the longer the walk.
- Each site has a tier (0-4) by the order it was made: the mill is 0. Foes scale as if 2 floors
  deeper per tier, loot 1 floor per tier. The site picker shows the tier as ▪ pips.
- The 📖 beastiary (button by the site name) counts kills per foe, ❔ until first seen.
- No site is ever cleared. The keeper returns every third floor, stronger each time.
- Every loot roll brings at least 2. Most gear found suits a class in the party.
- The first clear of a floor at a site pays 1 + ⌈floor/2⌉🏺.
- Setting out with a weapon matched to their class makes someone well armed (+4 morale).
- Beat a keeper on floor 3 or deeper and the party takes their crown (👑). Carried home, it widens
  the ward by a ring; the next crown has to come from 3 floors deeper (6, 9, 12…), on the same trip or
  a later one, and each crown carried home counts. A wipe loses them.
  One of the party carries them; fleeing a fight drops one half the time, and the rest blame the carrier.
- Foes grow steadily with depth until about floor 10, then compound: +15% a floor. The way-down
  button shows 💀 once the next floor is past that point, one more 💀 for each doubling.
- Heading home climbs back through every floor of the trip. Each one rolls once for an ambush,
  7% for every room left unexplored on it. A fight on the way up carries on home after.
- Each floor cleared passes a day in town. Travel to a site and back costs days, by distance from the
  town hall, at least one. The walk home eats 1🍞 a
  day. The game asks once before a step that leaves only enough food for the walk home.
- Out of food below, every room costs 15% HP and the party fights at half attack.
- Packed food leaves the village counter as it's packed; what the walk home doesn't eat comes back.
- The party stands in two lanes under the foes. Walking foes hit the front lane. A melee fighter
  in the back lane can't reach and waits (⏸); each fall in the front lane, or an empty front lane,
  brings one up. Drag someone onto the other lane, or tap them and then the lane; tap them twice to
  open them. On touch, a drag scrolls the page.
- Back from a dungeon, a party goes back to their old jobs if they are still open.
- The dead stay on the floor they fell. Each haunts one living person, a witness if any survived:
  scared face, half work, −25% attack, −2 speed, −2 morale a day. The remains show as 🦴 on that
  floor, in the room they fell, on the next dive; carried home and put in a graveyard, they rest and the haunting ends.
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
- Tap a face to ask why. They answer with their own account (who died, who patched them up, who
  they came to blows with, their closest friend), rumours as they believe them and who
  told them, so a story can be traced back through the village. Nothing says which version is true.
- Floors are random room maps, kept once found: the same rooms on the next dive, looted stashes
  still empty, some cleared fights and spent shrines back. Fights are real-time auto-battles with pause, speed, potions and
  retreat. A hero under a quarter HP drinks a potion by themselves; tapping 🧪 still drinks one any time. Death is permanent.
- Magic: a rare enchanting room (🔮, about 4% of rooms) turns up on any floor. The first one sets `S.arcane`
  and unlocks the Arcanum (wood, stone, 3 relics). Later ones give 1 relic. With an Arcanum built, the library
  research list also offers spells, two per class (`RESEARCH` entries with `spell`, `cls`, `lvl`): warrior Bash/Bulwark,
  ranger Snare/Barrage, mystic Ember storm/Meteor, cleric Smite/Renew. A hero casts a learned spell once their level
  reaches `lvl` (3 and 6; the second needs the first). Spells run beside the class skill in combat.js with their own
  cooldowns in `h.cds`.
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

`assets/face-<id>-<age>-<mood>.avif`: 36 people, four ages (`child`, `young`, `mid`, `old`), five
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
