// Static content: villagers + proposals. Pure data, no logic.

// relatesTo: villager id the `relates` line spoils — hidden until that
// villager has surfaced. updates: [{ after: projectId, blurb }], later
// entries whose project is approved override earlier ones, so flavor
// text tracks the story as proposals get built.
// favor: a one-off, never-expiring errand that unlocks once `after` is
// approved. cost is a small resource hand-in (not a minigame grind); scene
// is the town note it reveals. No trust stat, no repeatable payout.
const VILLAGERS = [
  {
    id: "mira", name: "Mira", portrait: "🎣", role: "Fisher",
    blurb: "Cheerful, up before dawn, talks to the herons.",
    relates: "Has a soft spot for Bellamy's burnt pastries.",
    relatesTo: "bellamy",
    updates: [
      { after: "repair_dock", blurb: "Cheerful, up before dawn, steadier now that the dock holds her weight." },
    ],
    favor: {
      after: "build_bakery",
      cost: { fish: 1 },
      task: "Bring Bellamy a fresh fish for her pie experiment.",
      scene: "Bellamy's pie actually rose this time. She won't say why she's smiling, but Mira's boat was out early that morning.",
      blurbAfter: "Cheerful, up before dawn — swears she has no idea why Bellamy's pies got better, grinning the whole time she says it.",
    },
  },
  {
    id: "tomas", name: "Old Tomas", portrait: "🪓", role: "Retired woodcutter",
    blurb: "Grumpy, precise, misses being useful.",
    relates: "Quietly mentoring Pike, whether Pike asked or not.",
    relatesTo: "pike",
    updates: [
      { after: "clear_woodpath", blurb: "Grumpy, precise, prouder than he'll admit that his old path got cleared." },
    ],
    favor: {
      after: "open_mineshaft",
      cost: { wood: 2 },
      task: "Bring Tomas wood for a gift he won't explain.",
      scene: "A whittled pickaxe handle turns up on Pike's doorstep overnight. Tomas denies everything.",
      blurbAfter: "Grumpy, precise — still denies leaving anything on anyone's doorstep, unconvincingly.",
    },
  },
  {
    id: "pike", name: "Pike", portrait: "⛏️", role: "Young miner",
    blurb: "Reckless, eager, chips his pickaxe on purpose for a reason to get a new one.",
    relates: "Agatha's grandchild. Idolizes Tomas.",
    relatesTo: "agatha",
    updates: [
      { after: "open_mineshaft", blurb: "Reckless, eager, finally has a real mine worth cracking his pickaxe in." },
    ],
  },
  {
    id: "bellamy", name: "Bellamy", portrait: "🥖", role: "Aspiring baker",
    blurb: "Warm, nervous, apologizes to bread that doesn't rise.",
    relates: "Too shy to tell Mira she's why the bread keeps burning.",
    updates: [
      { after: "build_bakery", blurb: "Warm, nervous, has a real oven now — the bread still argues with her." },
    ],
  },
  {
    id: "agatha", name: "Agatha", portrait: "🧶", role: "Well-keeper, elder",
    blurb: "Stern, traditional, remembers the town before the drought.",
    relates: "Raised Pike. Doesn't trust Finn's talk of leaving.",
    relatesTo: "finn",
    updates: [
      { after: "fix_well", blurb: "Stern, traditional, listens most mornings to water moving through her well again." },
    ],
    favor: {
      after: "repair_bridge",
      cost: { ore: 1 },
      task: "Bring Agatha ore for a repair she calls 'just precaution.'",
      scene: "Agatha quietly fixes the gate latch Finn always forgets to close. She still won't say she trusts him.",
      blurbAfter: "Stern, traditional — still won't say she trusts Finn, but the gate stays shut now.",
    },
  },
  {
    id: "finn", name: "Finn", portrait: "🎒", role: "Traveling tinker",
    blurb: "Restless, funny, half in love with the road out of town.",
    relates: "Keeps finding reasons to stay near Bellamy's bakery.",
    updates: [
      { after: "repair_bridge", blurb: "Restless, funny — fixed the bridge himself and still hasn't left." },
    ],
  },
  {
    id: "rowan", name: "Rowan", portrait: "🌿", role: "Hedge-witch, new in town",
    blurb: "Quiet, particular about soil, talks to plants more than people.",
    relates: "Owes Finn a favor for the introduction, whether Finn remembers asking for one or not.",
    relatesTo: "finn",
    newcomerProjectId: "welcome_rowan",
    deniedBlurb: "Quiet, particular about soil — packed up the cuttings and crossed back over the bridge without much fuss.",
    updates: [
      { after: "welcome_rowan", blurb: "Quiet, particular about soil — settling in, one crooked garden row at a time." },
    ],
  },
];

// cost: resources spent. wood/ore = building material, fish = feeding the
// people doing the work (only shows up on labor-heavy asks, not carpentry).
// prereq: project ids that must be approved first. unlockMinigame: makes a
// gather minigame available. yieldBonus: permanent multiplier on a
// minigame's resource reward.
const PROJECTS = [
  {
    id: "river_charter", name: "Follow the River", proposer: "mira",
    desc: "Mira's blunt: the river fed this town before anyone kept count. Fishing gets easier here.",
    cost: {}, prereq: [],
    slot: "charter_river", built: "🌊🏘️", locked: "🧭", charter: true,
    easeBonus: { minigame: "fishing", addZone: 20 },
    grant: { fish: 3 },
    excludes: ["forest_charter", "mine_charter"],
    instant: true,
    aftermath: ["The town turns toward the water. Fishing was always going to be easier here."],
  },
  {
    id: "forest_charter", name: "Head for the Trees", proposer: "tomas",
    desc: "Tomas points at the treeline: every wall here started as lumber. The axe feels lighter.",
    cost: {}, prereq: [],
    slot: "charter_forest", built: "🌲🏘️", locked: "🧭", charter: true,
    easeBonus: { minigame: "chopping", addZone: 20 },
    grant: { wood: 3 },
    excludes: ["river_charter", "mine_charter"],
    instant: true,
    aftermath: ["The town turns toward the treeline. The axe was always going to feel lighter here."],
  },
  {
    id: "mine_charter", name: "Answer the Mountain", proposer: "pike",
    desc: "Pike wants to know what's under the hill. The pick bites deeper.",
    cost: {}, prereq: [],
    slot: "charter_mine", built: "⛰️🏘️", locked: "🧭", charter: true,
    yieldBonus: { minigame: "mining", mult: 1.25 },
    grant: { ore: 3 },
    excludes: ["river_charter", "forest_charter"],
    instant: true,
    aftermath: ["The town turns toward the mountain. Whatever's under that hill is Millhollow's problem now."],
  },
  {
    id: "repair_dock", name: "Repair the Dock", proposer: "mira",
    desc: "Mira's dock is one plank from the river. Steady footing means an easier cast.",
    cost: { wood: 5 }, prereq: [],
    slot: "dock", built: "🛠️🎣", locked: "🌊",
    easeBonus: { minigame: "fishing", addZone: 16 },
    aftermath: [
      "Mira tests the new planks with both feet, grinning like it's Christmas.",
      "A week on, she's stopped checking the boards for give. Says it feels like it was always solid.",
    ],
  },
  {
    id: "clear_woodpath", name: "Clear the Old Path", proposer: "tomas",
    desc: "Tomas knows a stand of good timber, if someone clears the bramble path to it. Whoever does it will need feeding. Clear ground underfoot means a cleaner swing, too.",
    cost: { fish: 5 }, prereq: [],
    slot: "woodpath", built: "🌲🪓", locked: "🌿",
    unlockMinigame: "chopping",
    easeBonus: { minigame: "chopping", addZone: 14 },
    aftermath: [
      "Tomas walks the cleared path twice, hands behind his back, saying nothing.",
      "He's taken to sweeping stray twigs off it every morning, whether they're there or not.",
    ],
  },
  {
    id: "open_mineshaft", name: "Open the Mineshaft", proposer: "pike",
    desc: "Pike found an old shaft under the hill. Digging it out means support beams and a few days' meals for the crew.",
    cost: { wood: 5, fish: 3 }, prereq: ["clear_woodpath"],
    slot: "mineshaft", built: "⛏️🕳️", locked: "🗻",
    unlockMinigame: "mining",
    aftermath: [
      "Pike disappears into the shaft before the support beams have even finished curing.",
      "He's chipped his pickaxe on purpose exactly once, out of old habit, then looked embarrassed about it.",
    ],
  },
  {
    id: "fix_well", name: "Fix Agatha's Well", proposer: "agatha",
    desc: "The well's been half-dry for a season. Agatha wants stone brought up to line it, with a wooden frame on top.",
    cost: { ore: 5, wood: 3 }, prereq: ["open_mineshaft"],
    slot: "well", built: "⛲", locked: "🕳️",
    aftermath: [
      "Agatha stands at the well for a long moment before drawing the first bucket.",
      "She's started leaving a tin cup on the rim, for whoever's thirsty.",
    ],
  },
  {
    id: "build_bakery", name: "Build Bellamy's Bakery", proposer: "bellamy",
    desc: "Now that decent lumber's coming in, Bellamy wants a real oven built to replace the shed.",
    cost: { wood: 8, ore: 3 }, prereq: ["clear_woodpath"],
    slot: "bakery", built: "🥖🏠", locked: "🍂",
    aftermath: [
      "The first loaf out of the new oven still burns. Bellamy declares it 'rustic.'",
      "The second loaf doesn't burn. She looks almost disappointed.",
    ],
  },
  {
    id: "repair_bridge", name: "Repair the Bridge", proposer: "finn",
    desc: "Finn says he needs the bridge fixed to leave. Everyone suspects that's not really why.",
    cost: { wood: 10, ore: 6 }, prereq: ["build_bakery"],
    slot: "bridge", built: "🌉", locked: "🪵",
    aftermath: [
      "Finn crosses the bridge once, slowly, like he's testing whether he actually wants to.",
      "He's still here. Nobody mentions it, including him.",
      "By the second week, someone else has crossed it too — a hedge-witch with a satchel of cuttings, unpacking like she means to stay.",
    ],
  },
  {
    id: "expand_cottage", name: "Expand Tomas's Cottage", proposer: "tomas",
    desc: "One more room, Tomas says. Just for a reading chair. Nothing sentimental.",
    cost: { wood: 6 }, prereq: ["clear_woodpath"],
    slot: "cottage", built: "🏡📚", locked: "🛖",
    aftermath: ["Tomas moves one chair into the new room, and nothing else, for weeks."],
  },
  {
    id: "plant_orchard", name: "Plant the Orchard", proposer: "agatha",
    desc: "With water running again, Agatha wants stakes and fencing up for an orchard where the old one used to be.",
    cost: { wood: 4 }, prereq: ["fix_well"],
    slot: "orchard", built: "🌳🍎", locked: "🪨",
    aftermath: ["Agatha marks the first blossom on a little calendar only she keeps."],
  },
  {
    id: "new_pickaxe", name: "Pike's New Pickaxe", proposer: "pike",
    desc: "Pike's pickaxe is more chip than blade. Good ore, properly forged, means faster and better digging.",
    cost: { ore: 8 }, prereq: ["open_mineshaft", "mine_charter"],
    slot: "pickaxe", built: "⛏️✨", locked: "🔨",
    yieldBonus: { minigame: "mining", mult: 1.5 },
    instant: true,
    aftermath: ["Pike immediately tests the new pickaxe on the hardest rock he can find, on purpose this time."],
  },
  {
    id: "better_nets", name: "Mira's Better Nets", proposer: "mira",
    desc: "New nets, woven from rope. Cast them out and every hit banks automatically, no risk of losing a haul — a slower, safer way to fish than standing at the dock working the boat by hand. She only has hands for one boat project this season, though — this or the paint job, not both.",
    cost: { wood: 6, ore: 2 }, prereq: ["repair_dock", "river_charter"],
    slot: "nets", built: "🥅✨", locked: "🕸️",
    excludes: ["repaint_boat"],
    instant: true,
    aftermath: ["The new nets come up heavier on the first pull. Mira actually yells."],
  },
  {
    id: "old_millwheel", name: "Turn the Old Millwheel", proposer: "mira",
    desc: "Mira's blunt about it: get the old wheel turning and fishing won't be one clean beat anymore. You'll have to watch two currents at once and reel when both line up.",
    cost: { wood: 4, ore: 2 }, prereq: ["river_charter"],
    slot: "millwheel", built: "⚙️🌊", locked: "🪵",
    aftermath: [
      "The old wheel catches, groans, and starts turning with the river.",
      "By morning its steady clatter has become part of the town's weather.",
    ],
  },
  {
    id: "harvest_festival", name: "Hold the Harvest Festival", proposer: "bellamy",
    desc: "Bellamy and Agatha want one night of lanterns, bread, and orchard fruit for everyone. Mostly it means feeding the whole town at once.",
    cost: { fish: 6, wood: 3 }, prereq: ["build_bakery", "plant_orchard"],
    slot: "festival", built: "🏮🎉", locked: "🍁",
    instant: true,
    aftermath: ["Half the town falls asleep in the square afterward. Nobody minds."],
  },
  {
    id: "library_shelf", name: "Tomas's Library Shelf", proposer: "tomas",
    desc: "Tomas wants somewhere to put the town's old logs and his own dog-eared books. Wood for the shelf, a little ore for hinges.",
    cost: { wood: 7, ore: 2 }, prereq: ["expand_cottage", "forest_charter"],
    slot: "library", built: "📖🕯️", locked: "📦",
    instant: true,
    aftermath: ["Tomas alphabetizes nothing. He just likes that there's finally a shelf."],
  },
  {
    id: "finns_workshop", name: "Finn's Workshop", proposer: "finn",
    desc: "If Finn's staying a while, he wants a proper bench and tools for fixing whatever the town breaks next.",
    cost: { wood: 9, ore: 5 }, prereq: ["repair_bridge"],
    slot: "workshop", built: "🧰🔧", locked: "🚧",
    aftermath: ["Finn fixes something in the workshop that wasn't actually broken, just to have used it."],
  },
  {
    id: "repaint_boat", name: "Repaint Mira's Boat", proposer: "mira",
    desc: "Not just paint — a proper boat means working it by hand, chaining bite after bite for a bigger haul, and losing the streak if you get greedy. It's this or the passive nets, not both.",
    cost: { wood: 2, ore: 1 }, prereq: ["repair_dock"],
    slot: "boat", built: "🛶💙", locked: "🛶",
    excludes: ["better_nets"],
    instant: true,
    aftermath: ["The boat dries a deep, stubborn blue. Mira sits and just looks at it for a while."],
  },
  {
    id: "memorial_bench", name: "Agatha's Memorial Bench", proposer: "agatha",
    desc: "A quiet bench under the orchard, for Agatha to sit and watch the well she fixed.",
    cost: { wood: 4 }, prereq: ["fix_well", "plant_orchard"],
    slot: "bench", built: "🪑🌸", locked: "🍂",
    instant: true,
    aftermath: ["Agatha sits on the new bench facing the well, and doesn't get up for a long time."],
  },
  {
    id: "welcome_rowan", name: "Rowan Wants to Stay", proposer: "finn",
    subject: "rowan", newcomer: true,
    desc: "Finn met them crossing the new bridge — a hedge-witch with a satchel of cuttings, in no hurry to leave. She's offering a bit of scavenged ore as thanks, if the town will take her in.",
    cost: { fish: 2 }, prereq: ["repair_bridge"],
    grant: { ore: 2 },
    slot: "newcomer_rowan", built: "🌿🧺", locked: "🎒",
    instant: true,
    aftermath: [
      "Rowan sets up a little cutting garden behind the bakery before anyone's properly said yes.",
      "The garden's still crooked, three weeks on. Rowan says crooked rows catch more bees.",
    ],
    declineAftermath: "Rowan nods like they expected it, shoulders the satchel, and heads back over the bridge before dusk. The crooked garden never gets planted.",
  },
  {
    id: "terrace_garden", name: "Terrace Rowan's Garden", proposer: "rowan",
    desc: "Rowan wants proper terracing for the cutting garden before the rain undoes all that crooked charm.",
    cost: { wood: 3 }, prereq: ["welcome_rowan"],
    slot: "garden", built: "🪴🌱", locked: "🕳️",
    instant: true,
    aftermath: ["The terracing holds through the first real storm. Rowan says the plants like the sound of it."],
  },
];
