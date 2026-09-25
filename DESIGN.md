> **Superseded (2026-09-25).** `index.html` is now a Dungeon Settlers-style
> colony sim / dungeon crawler (`js/ds/`). The log-driven game this file
> describes still runs at `log-rebuild.html` (with `js/sim.js`, `js/app.js`),
> kept because there is no version control here. Its constitution is dropped.

# Millhollow — design

Supersedes the direction in `README.md`. That file documents the old
vertical slice; this one documents what Millhollow is being rebuilt into and
why. Stages 0 and 1 are built — `js/sim.js`, `transcript.js`, `index.html`.
Stages 2 and 3 are not.

## The pitch

You are the leader of the expedition that settled Millhollow. The village
sustains itself — it feeds and maintains and argues with itself without
you. What it cannot do alone is grow, and it cannot see past its own
treeline. That's your job.

It's a book you turn the pages of, where the book is generated, the pages
are different depending on who you are, and every so often it asks you
something.

## Constitution

Non-negotiable. Every design decision gets filtered through these.

1. **The world only moves when you tap.** No wall-clock timers, ever. No
   offline progress, no catch-up, no "while you were away." Close the tab
   mid-sentence and the sentence is still there.
2. **No dexterity, no alertness, no fail-state panic.** The target is
   playable one-thumbed, half-asleep, in the dark. Everything is a menu
   choice with visible odds.
3. **Failure is content, not punishment.** A bad roll produces a different
   page, never a blocked one.
4. **Decisions foreclose.** Things you choose permanently close off things
   you will now never see. This is what makes it a game and not a feed.
5. **No dark patterns.** No FOMO, no energy, no notifications, no daily
   obligation, no streaks. Carried forward from the current build
   unchanged.
6. **Nothing is simulated that the player can't read.** If a number moves,
   there's a way to find out why. Deep sim with an opaque surface is the
   failure mode of every game in this genre.

## The player

You have a portrait, an age, a rolled name, and a **background**. The
background is a build, not flavor — it filters what you perceive.

There are **many trades and few lenses**. The trade is who you were; the lens
is the part of that which still shows. Sixty-odd trades in `BACKGROUNDS` map
onto these nine lenses:

| Lens | Sees | Trades that grant it |
|---|---|---|
| `land` | what's under the hill, where water's going, where ground is wrong | Surveyor, Ploughman, Ditcher, Well-digger, Fen-drainer |
| `stores` | stores, health, who's eating badly, scarcity before it's reported | Cook, Baker, Miller, Brewer, Salter, Cheesemaker, Butcher |
| `body` | injury, exhaustion, fear, the state of a living thing | Soldier, Barber-surgeon, Midwife, Gravedigger, Watchman, Shepherd, Swineherd, Goatherd, Farrier, Falconer |
| `history` | the generated history — the past surfaces for you and not for others | Scribe, Clerk, Minstrel, Storyteller, Priest, Bookbinder |
| `labor` | how a thing was made: technique, wasted effort, what will fail first | Mason, Carpenter, Cooper, Blacksmith, Potter, Thatcher, Woodcarver, Weaver, Rope-maker, Tanner, Dyer, Wheelwright |
| `talk` | who is saying what about whom, who owes whom, how far it travelled | Pedlar, Innkeeper, Laundress, Town crier, Merchant, Mercer, Tax collector, Moneylender |
| `forest` | the woods — what's being taken faster than it comes back | Forester, Woodcutter, Charcoal burner, Hunter, Beekeeper |
| `river` | the water: level, current, where the fish actually are | Fisher, Ferryman, Reed-cutter, Bargeman |
| `underground` | rock, the state of a face, whether stone was cut right | Miner, Quarrier, Chalk cutter, Rat-catcher |

**Nine lenses, because each is paid off by hand in `renderEvent`.** A lens with
no render branch is a promise the log never keeps, so the list of lenses grows
only when the branches do. Adding a *trade* is one line; adding a *lens* is a
tag plus every branch that makes it visible.

Trades sharing a lens used to be forbidden — two backgrounds printing the same
bracketed line made the choice a lie. That held while the picker printed *what
you would notice* underneath the name. It no longer does: the background says
who you were and nothing else, and what it lets you see is found by reading the
log. A shared lens is only a lie when the screen has promised otherwise.

Work events carry their place's terrain tags (`tags: ["labor", "stores",
...p.tags]`), which is what lets Forester, Fisher and Miner exist without new
event kinds. Underground work is rare by design, so the Miner's line fires
every time rather than on a modulo, and also on any building raised from
quarried stone.

Same generated event, different visible detail, filtered by tag at render
time. Two players with different backgrounds read meaningfully different
books out of an identical village. That's the replay axis and it costs a
tag match in the renderer.

## The loop

```
go out  →  find something
        →  the village wants it / fears it / needs it
        →  you work it or you delegate it
        →  village and villagers change
        →  new things become findable
```

Every arrow is a tap. Each tap advances one turn. Most turns you read what
happened. Some turns the village asks you something.

## The three verbs

**Go out.** Only you leave. Villagers sustain the village; they don't
range. You survey, scout, follow the river, walk the ridge. This is the
sole entry point for new things — places, people, resources, buried
history. It's also the infinity axis: a village is bounded, a map isn't.

**Take the job.** Anything that needs doing, you can assign to a villager
or do yourself. Doing it yourself costs your presence, may be worse than
the specialist would be, and **the villagers form opinions about it**.

**Decide.** Approve or refuse what the village proposes. One verb of three,
not the whole game — which is what keeps it from feeling like a throne.

### The delegation tension

Working yourself must not be strictly better, or the game collapses to
"always work."

Counter: **villagers gain skill by doing.** Hoard the work and the village
stays incompetent. Delegate and they grow — slower now, better later,
eventually better than you at their specialty. A leader who does everything
themselves builds a village that can't function without them, and that
shows up in the numbers rather than in a lecture.

Skill gain is slow and visible. A number that moved is worth an event in
the log.

### Showing, not ordering

Stolen wholesale from *The Survivalists* (Team17, 2020), whose monkeys learn a
job by watching you do it and then keep doing it until dismissed. The same verb
with persistence attached is the difference between a toy and a game, and this
build had the verb without the persistence: `Work with` helped someone for one
day and evaporated.

So: **you pick a person and you pick what to do in front of them.** From the
next day that is what they turn up to, unprompted, until something they would
rather do wins.

It is shown, not ordered, and the difference is the whole mechanic:

- `holdOf` quotes the odds they stick — skill holds them, a liking holds them,
  a dislike pulls hard the other way. The number is on the button before you
  choose, in the only unit this game states odds in: *n* in 10.
- A failed roll is **a day off, not a resignation.** They wander, and drift
  back tomorrow. `— off the mending today`.
- Three misses running and the arrangement is over: `— gave up the foraging`.
  That is the odds becoming legible by being played rather than by being read.
- Only the news is marked. Carrying on shows up as the same job on the same
  line four days running, which the record format already renders plainly, and
  the roster is where you go to ask whether it is still holding.

The bet is on a person. Teaching somebody the work they are already best at is
the safe bet and often the wrong one, because what suits them may not be what
the village needs. Measured over 60 turns on five seeds:

| teaching | logs cut | buildings |
| --- | --- | --- |
| everyone their own best job | 1–10 | 0–1 |
| everyone timber | 170–229 | 2–3 |

Same seeds, same sim, same number of taps. That spread is the first thing in
this game that makes a choice matter, and it is a genuine tension rather than a
right answer: the safe bet compounds a person, the needed bet risks the
arrangement falling apart. One demonstration followed by thirty hands-off days
leaves a villager **+1.05 skill** in the shown trade against the same villager
never shown — so it compounds without anyone being ordered about.

`taught` lives on the villager and is rebuilt by replay like everything else.
The action grew two fields and the save got *smaller* per turn: 28 b/turn.

## Architecture: the event log is the game

One structure underneath everything:

```js
event = {
  id, turn,
  kind: "build_finished",
  actors: [villagerId, ...],
  subject: "smokehouse",
  place: "riverbank",
  witnessed: bool,        // was the player present
  tags: ["land", "labor"] // which backgrounds get extra detail
}
```

Everything the player reads is a rendering of an event.

- History = the log
- Legends / lookup = a query over the log
- Town notes = the log, filtered
- Save file = the log

Four features, one data structure. The log growing *is* the infinite book.

### Objects, not counters

No `wood: 7`. Resources are things with provenance:

```js
item = { type:"log", species:"cedar", quality:2, from:"flooded_grove", by:"tomas", turn:41 }
```

"The smokehouse was raised from cedar Tomas pulled out of the flooded
grove" then generates itself. That sentence is the entire argument for
dropping integer resources.

### Generated history

On new game, roll 30–50 years of Millhollow's past before the player
arrives: founders, failures, what's buried, who's descended from whom.
Events in the log, same as live play. Incidents reference it, the Scribe
surfaces it, the player can look any of it up.

Makes the book infinite on turn one instead of turn two hundred.

## Villagers

```js
villager = {
  id, name, portrait, age,
  prefs:   [ {like:"river"}, {dislike:"underground"} ],
  skills:  { fishing: 3, carpentry: 1 },
  rumors:  [ ... ],
  memory:  [eventId, ...],
  talkativeness, credulity,
}
```

Behavior stops being authored. Pike won't take the mine slot because he's
afraid of the dark, you route around it, and the reason is legible when you
tap him. Nobody wrote that situation — the combinatorics did.

Five villagers × four properties is enough to start. The interactions do
the work, not the count.

## Rumors

Villagers meet on their own and talk. Opinions propagate.

```js
rumor = { about, eventId, valence, hops, from }
```

A rumor **always carries its source event**. Without that it's invisible
numbers moving and violates constitution #6.

Per turn, a few pairs meet:

```js
hear(a, b, r) {
  if (Math.random() > a.talkativeness) return;
  if (b.knows(r.eventId)) return;
  const trust = affinity(b, r.from) * b.credulity;
  b.rumors.push({ ...r, valence: r.valence * trust, hops: r.hops + 1, from: a.id });
}
```

**Bonds are derived, not stored.** Opinion of someone = the sum of rumors
you hold about them, decayed by age and hops. One structure, no sync bugs.

### Why not Minecraft's version

Minecraft's gossip converges — everyone averages out to the same opinion
and the system reads flat. Three things prevent that here:

1. **Personality gates reception, not just transmission.** Talkativeness
   decides who spreads. The interesting knob is who *believes*. A skeptic
   discounts secondhand. Someone who dislikes the teller inverts it. A
   strong bond to the subject resists bad news about them.
2. **Decay.** Otherwise it calcifies into permanent grudges by turn four.
3. **Hop distortion.** At each hop, a small chance the valence flips or the
   subject swaps. Telephone game.

### Hop distortion is the point

The village comes to believe things that never happened. You — because you
were *there* — are the only one who knows it's wrong. You can correct it,
let it stand, or discover it's already three hops out and correcting it
costs more than living with it.

Three lines of code. Rewards presence, penalizes absence with no clock
involved, generates content nobody wrote.

## Presence

If you're on the ridge, you're not at the mill. Turns still only advance on
your tap, so the constitution holds — but events you weren't present for
arrive **secondhand**. Reported, partial, sometimes wrong, sometimes
corrected three turns later.

Same events, two textures, free. `witnessed: false` is the flag; the
renderer does the rest. It also makes presence a real cost you pay every
time you pick up a shovel.

## Generated vs authored

**Generated:** which events fire, who's involved, what's found, what's
propagated, how it distorts, all history before turn one.

**Authored:** the sentence templates, the event kinds, villager archetypes,
place types, backgrounds.

The prose target is **precise, not pretty**. Flat declarative reporting of
weirdly specific facts — the Dwarf Fortress register. "Urist McMiner has
been possessed" isn't literature and doesn't need to be; specificity
carries it. For a game read half-asleep this is better than literary prose,
which demands concentration.

Never assemble grammar. Interpolate proper nouns and numbers only — never a
verb, never an adjective, never clause structure.

### The record format

Stage 1 shipped prose and the prose was the problem: it read as a book, and a
passive, inoffensive one. Every line was a sentence, several kinds of line had
three or four authored phrasings rotated by `e.id % n`, and a bad day ended in
a tail that took the sting out of it — *"Good enough for now."*, *"It holds."*
Variation in the words made the log **harder** to read, not easier, because
nothing ever looked the same twice and so nothing ever looked wrong.

Every line is now one shape:

```
who - what where : what came of it

Nessa - fished at the shallows : 3 good fish, 2 bad fish
Nessa - fished at the shallows : nothing — lost the line on a snag
Tovar - hurt hauling at the ridge : laid up 2 days
Bellamy, Harlow - words : no blows
Orin - asks for smokehouse at the riverbank : 16 log — rules out the boathouse
```

The fields never reorder and never get rephrased. That is the whole trick: a
log you can scan is a log that says a thing exactly one way, so the line that
is shaped wrong is the line your eye stops on. This is the DF register taken
literally — it is scannable *because* it never varies.

What it deleted:

- **`vary()`** — the synonym rotator. Variation now lives in the numbers, which
  is where it was always doing real work.
- **`secondhand()`** — four ways of hedging a thing the leader did not witness.
  Now `(heard)`, one marker, always last.
- **`work_good` / `work_poor` as separate kinds.** A day is one `work` event
  carrying a list of units. A bad day is a short list; a blank day is `nothing`
  plus the authored reason, which is a fact about the day and not an apology
  for it.
- **`q()` as a day's adjective.** Quality still rides on each item, for
  provenance in `built`, but a day is reported in counts. You cannot write
  "good enough" in a field that only takes an integer.
- **`ord()`.** `skill : fishing 2` says it.

What it cost: a day of work is now a handful of tries rather than one pass/fail,
so it stocks roughly four times as much, and every building's `need` went up by
four to match (smokehouse 4 → 16 log). Skill no longer decides whether the day
happened — it moves the split between what came back worth keeping and what
came back anyway.

### Coming back

The leader is the player and the player has a life. On boot, the gap since the
last save buys **picks**: what you were doing while you were gone.

- Under 45 minutes: nothing. You never left.
- Otherwise `1 + floor(hours / 12)` picks, capped at **4**.
- Each pick offers three options, and the rarest one the absence unlocked is
  always among them.
- Options are gated by a minimum absence (`AWAY[].hrs`): walking the bounds and
  sitting with somebody are always there; going out a day needs 6 hours, the
  ridge 12, downriver 48, the old accounts 72.

**More picks, not more options per pick.** Four things you did reads as a month
away — an itinerary. One choice out of eight just reads as a bigger menu. What
a long absence actually buys is options a daily player never sees.

**Every payout is lateral.** A name, a place, something somebody said, a line
out of the pre-game history you had not read. Never stores, never skill. The
day an absence out-earns a turn is the day the game rewards not opening it.

**The village does not move while the tab is shut.** This looks like it breaks
Constitution #1 and does not. Nothing runs offline. Each pick *is* a turn,
generated on the tap that makes it — four picks generate four days of village
log at that moment. The wall clock buys the leader an itinerary; it never buys
the village time. Close the game mid-day and the day is exactly where you left
it. `S.seen` is the only wall-clock value stored and it never reaches the sim,
so replay from the input log stays deterministic: what gets logged is the
option id, not the hour.

## What dies

- **All three minigames.** Timing bars are the opposite of falling asleep.
  `js/minigames.js` goes entirely.
- **Integer resources.** wood/fish/ore as counters that only go up and down.
- **`PROJECTS` as the spine.** A finite hand-authored checklist.
- **Static villagers.** Vending machines with portraits.
- **`threadProgress()` / `checkEpilogue()`.** They announce a to-do list,
  then confirm it by ending.
- **`setInterval(renderAll, 1000)`.** Full DOM teardown every second.
  Render on state change.

## What survives

- **Foreclosure** (`excludes`). The one already-correct instinct in the
  current build. Decisions that permanently close content are what make a
  generated text game a game.
- **The charter**, reframed as the background/portrait pick.
- **The no-dark-patterns constitution**, unchanged.
- **No build step.** Iteration speed is why this got this far.
- **Aftermath-on-visit**: earning a scene by going to the thing rather than
  by reopening the app. Generalizes to the whole log.

## Build order

**Stage 0 — the transcript test.** No UI. A standalone script: roll 5
villagers, generate 50 years of history, run 100 turns, print the event log
as flat sentences. Then run the *same village* twice with two different
backgrounds and different choices, and diff the transcripts.

- If both reads are pleasant at 1am → the format works.
- If the two transcripts are meaningfully different books → it's a game.
- If they're the same book with different adjectives → it's a screensaver,
  and that's been learned for ~200 lines instead of after a full rewrite.

This is the only stage that can falsify the whole design. It ships first
and nothing else starts until it passes.

### Stage 0 result — passed

`transcript.js`, 100 turns, one world seed, two leaders.

- **~2.6% of lines identical.** Two different books out of one village.
- **The villages themselves diverge.** One run raised a smokehouse at the
  riverbank and permanently foreclosed the boathouse; the other never built
  on the river at all and put a stone path on the ridge instead.
- **Skills diverge from policy.** The leader who worked alongside people
  produced a visibly more skilled village than the one who ranged.
- **Rumours do not converge.** Opinions spread −1.8 to +4.7 at turn 100,
  with villagers actively disagreeing about the same people.
- **Provenance pays off.** "A stone path stands at the ridge, raised from
  good stone Bellamy brought up from the quarry cut and fair stone Tomas
  brought up from the quarry cut." Nobody wrote that sentence.

Still open: event volume is high for something read half-asleep, and
repetition is action-shaped rather than sentence-shaped — villagers loop on
work they like, so they need reasons to vary, not more phrasings.

**Stage 1 — playable.** Tap-to-advance UI over the Stage 0 sim. Three
verbs. Log view. Villager inspector. No buildings yet.

### Stage 1 result — built

`index.html` + `js/app.js` over `js/sim.js`. The sim moved out of
`transcript.js` so the game and the transcript test run the same code;
`transcript.js` is now the two-run harness and nothing else.

- **Three verbs on one bar.** Go out (pick a place), Work (pick who to work
  alongside), Another day. Each is one tap and advances exactly one turn.
- **Decide is inline.** Open proposals sit at the bottom of the log with
  Agree / Not yet. Answering never blocks the day — an unanswered proposal
  just waits, and a refused one comes back after twelve turns.
- **The save is the input log, not the world.** `{seed, leader, [turn
  inputs]}`, replayed through the seeded sim on load. Verified: replaying an
  input log reproduces the events, the buildings and every villager's skills
  exactly. About forty bytes a turn, and no serialisation of a world full of
  object references.
- **Agree-all and refuse-all build different villages** off one seed —
  four buildings against none.

Fixed in the sim while wiring it up: the leader's own work line duplicated
the villager's; villagers worked twice on a day the leader joined them;
villagers gossiped to someone about that same person.

#### Names

One pool in `js/sim.js`, drawn from by the leader and every villager alike.
It used to be two — a villager list in the sim and a leader list in the app,
kept disjoint so they could never collide. They are one list now because a name
has to suit a face, and the sim is what knows which face is which.

Names are filed under `f`, `m` and `any`. **`any` is the point of the
structure**, not a leftover bucket for the hard cases: a third of the pool sits
there, and those names are handed to a face of either kind. A village where
some names could belong to anyone is a village; a village partitioned cleanly
down the middle is a census form.

Faces carry a sex too, in `FACE_F` / `FACE_ANY`, listed by portrait id. Anything
unlisted reads male — that is the larger group, so the two short lists are the
cheaper thing to keep correct as sheets land. Face 9 is drawn ambiguously enough
to take anything, which is what `any` names are for.

The order matters in `makeVillager`: **the face is chosen first, then a name that
suits it.** A `taken` list carries the leader's name and everyone already made,
so no two people in a run answer to the same name, and nobody turns up wearing
the player's face or using their name.

On the start screen, stepping the portrait rerolls the leader's name when the
new face no longer suits it — unless the player typed one, which is theirs to
have not suit anything.

#### Portraits

`assets/face-<id>-<age>-<mood>.webp`. Thirty-six people, each drawn at four
ages (`child` `young` `mid` `old`) and five moods (`happy` `neutral` `sad`
`angry` `scared`) — 720 files at 192px. Generated ahead of time and committed;
no generation at runtime, no network call in the game. `FACES` in `js/sim.js`
is the count.

Thirty-six is far more than the six a run needs. That is the point: the pool is
what makes a second village look like different people, and it is sized for a
settlement that grows rather than for the five it starts with.

**Each person is one generation, not twenty.** A single 1536x1024 sheet holds a
strict 5x4 grid — moods across, ages down — and is sliced into panels
afterwards. This is the whole trick. Asking for twenty separate portraits of
"the same person" returns twenty different people; asking for one image
containing twenty panels holds the bone structure, the nose, the ears and the
distinguishing mark across every one of them, because the model is drawing them
in relation to each other rather than from a description each time.

**Most sheets are seeded from an image, not a description.** `image_gen` takes
`referenced_image_paths`, so ids 1–30 were grown from the old single portraits
(`portrait-1.webp` … `portrait-30.webp`) by handing the file back and asking for
that same person twenty times. This beats writing a brief on both axes at once:
the face comes back recognisably the same person, and the print style is copied
from the reference rather than re-derived from adjectives. Ids 31–36 are the
written-brief kind, kept because they came out well.

A written identity brief carries **no age**: only what persists — skull shape,
nose, ear shape, eye set, marks, hair texture. "An old man with a heavy beard"
cannot be drawn at eleven. The ages live in the shared row clause, the moods in
the shared column clause, and the per-person line describes a timeless face.

The child row is the one that fights back. Asked plainly for "about 11" it
returns a small adult or a teenager, so the clause spells out a child's
*proportions* — rounded skull wide against a small chin, cheeks full, eyes
large and set low, no jaw definition, no cheekbone shadow.

That clause is necessary and not sufficient. Nine of the thirty-six — 13, 16,
17, 18, 20, 23, 27, 30 and 36 — came back with a child row that still reads
adult, a quarter of the set, and they fail in four distinguishable ways.

**The identity brief can smuggle age in.** Faces 17, 27 and 30 are the
instructive ones. 17's child is gaunt and hollow-cheeked in all five moods,
reading about forty; 27's carries deep nasolabial folds and eye creases under a
broad grin; 30's carries an adult's mass — heavy jaw, brow ridge, a neck as
wide as the head. Hollows, creases and mass are not timeless features. Anything
made of *flesh lost, flesh gained or skin folded* is age, the same way a heavy
beard is, and a brief built on one overrides the row clause instead of
surviving it. Describe instead what the face keeps at every age — skull length,
nose bridge, eye set, ear shape, hairline — and let flesh come from the age row
alone.

**Seeding from an adult portrait anchors the whole sheet to that adult.** Faces
13, 16, 18 and 23 are seeded from `portrait-N.webp`, and their child panels are
the young panel shrunk: 13 keeps the adult mouth width and cheekbone shadow, 16
the full adult smile and nose, 18 a squared jaw, 23 the heavy brow and long
oval face. The reference is doing what it is for — holding the identity — so
the child clause has to be loud enough to outweigh it, stated as ratios rather
than adjectives: skull about one and a half times the width of the jaw, eyes
below the skull's midline, nose short with no defined bridge, no cheekbone
shadow, no visible jaw angle, neck narrower than the head.

**It is not only the reference's fault.** Face 36 is one of the written-brief
ids, with no portrait anchoring it, and its child is still the young panel in
softer ink. The clause loses on its own merits when the rest of the brief
describes an adult-shaped face, which is the argument for stating it as ratios:
a ratio contradicts a drawing, an adjective only competes with one.

**A mood can age a single panel.** Face 20's row is otherwise fine at about
eleven, but its `happy` panel carves jaw shading for the open-mouth laugh that
reads as stubble, and that panel alone reads as a grown man. The mood clause
has to say that no mood may add facial hair, jaw shadow or nasolabial lines in
the child row.

None of the nine is fixable by re-slicing: the child row is wrong on the sheet
itself. But the repair is a **row pass, not a whole sheet and not a column** —
one fresh 5x1 child strip per face, sliced into the five panels it replaces.

The defect is row-shaped. All four adult rows are right on all nine sheets, and
on 27 and 30 the adult rows are among the best in the set, so re-rolling twenty
panels to fix five gambles fifteen good ones for nothing. Panels are already
independent files, so a strip writes five of them and touches nothing else —
there is no compositing back into a sheet.

The deeper reason is that **a pass holds constant whatever it does not vary,
and fails on whatever it does.** A child strip varies mood at a fixed age, and
mood is the cheap axis — it has never been what broke. A column (one mood, four
ages) varies age inside one image, which makes the model draw the child in
relation to that person's adults: exactly the relation that produced "the young
panel shrunk" in seven of the nine. A column pass re-runs the bug's own
mechanism. A single-panel regen is worse still, having no siblings at all to
hold an identity against.

A strip also checks itself at a glance, because its two failure modes are
visible in the strip alone: five different people means the identity slipped,
one adult drawn five times means the age did. A column mixes both axes and you
cannot tell which one went.

What keeps identity through a separate generation is the reference image, not
the prose — so seed a child strip with **two**: the face's own `mid` panel for
identity, and a child panel from a face that came out right (24, 29, 31, 33)
for proportion. That splits the pair that were fighting, letting the adult
reference carry the bone structure while it is no longer also the only thing
telling the model what size a head is.

The sheets themselves are not in this repo — codex keeps them under
`~/.codex/generated_images/<session>/exec-*.png`, 1536x1024, and 83 survive for
36 faces, so re-rolls were already part of the process.

**Result: 9/9 fixed, 45 panels replaced.** Originals are in
`assets/.orig-child/`, so every one of them is revertible. Eight faces
(13, 16, 17, 18, 20, 27, 30, 36) came right on the first strip, at "a child of
about eleven".

Winifred (23) did not, and is the useful failure. Her identity is *built on*
the features the brief was told to keep — a heavy brow, a long nose, full lips
— so an honest identity transfer carried her age across with it, and all four
takes still read about thirteen. The fix was to overconstrain the axis the
identity was leaning on: **a child of about nine**, plus a short brow-to-chin
face, a snub nose with no bridge, a small mouth with thin lips, a flat brow,
and cheeks carrying baby fat past the eye line. The identity still held. The
rule that falls out of it: when a face's likeness lives in features that also
read as age, the ratios have to be stated hard enough to outvote the reference,
because the reference will win any argument the prose only hints at.

Two process notes worth keeping. Codex hung once — 17 minutes, zero CPU, no
session file ever opened — and the fix was to kill it and reissue the identical
command, which ran in two minutes. And four takes per sheet is the point of the
5x4 grid: take 4 was visibly the roundest of Winifred's four and cost nothing
extra to have.

One style string, reused verbatim for every sheet, which is what keeps the set
looking like one book:

> bold linocut relief print. Thick hand-carved lines, flat solid areas of
> ink, no gradients, no soft shading, no photographic texture. Only two
> colours: warm amber-cream ink on a very dark brown background. Visible
> gouge marks and chunky carved edges. No text, no labels, no numbers, no
> border, no signature.

An earlier set asked for "quiet and tired, not heroic" in the shared style
string and every face came back mournful in the same way — mood belongs in its
own clause, never the shared one.

**Nobody in a run wears the same face.** `genWorld` takes the leader's id, drops
it from the pool, and each villager splices one out, so a village of five plus
the player is six distinct people. Sixteen identities is well above the six a
run needs; the surplus is what makes two villages look different.

The palette was chosen to sit inside the night-reading theme already
(`#14110e` ground, `#c08a4e` accent), so the portraits do not glow next to
the text at 1am.

The save stores the portrait's *number*, not a filename, so the art can be
redone without breaking anyone's village.

#### Ages

Four brackets, because one sheet fits four rows.

| Bracket | Years | Weight |
|---|---|---|
| `child` | 10–12 | 2 |
| `young` | 27–34 | 5 |
| `mid` | 45–50 | 5 |
| `old` | 75–80 | 3 |

The player picks an age with the `−` / `+` buttons flanking the portrait, which
change the age and not the person — the face id is held. **The leader is never
a child**: `LEADER_AGES` drops the first bracket, since an expedition would not
have sent one. Villagers can be, but the weights keep them uncommon; flat
weights put a child in nearly every village of five and the sim would then send
them up the quarry face.

**Stage 2 — the village.** Buildings as objects, specialists, items with
provenance, delegation and skill growth.

**Stage 3 — the map.** Going out generates places. History gets deep enough
to be worth querying.

## Known risks

- **Generated text goes flat over 100 events.** The one that kills it.
  Stage 0 tests it directly.
- **The screensaver failure.** If 100 taps produce the same transcript
  regardless of choices, there's no agency. Stage 0's diff tests it.
- **Rumor convergence.** Mitigated above; verify in the transcript that
  villagers still disagree at turn 100.
- **Legibility.** A deep sim the player can't read is worse than a shallow
  one they can. Constitution #6 exists for this and it's the easiest one to
  violate by accident.
- **Repetition of event kinds.** Fewer kinds combining richly beats many
  kinds firing shallowly — but that's an assumption, and Stage 0 is where
  it gets checked.
