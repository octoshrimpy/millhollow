// ---------- rng ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, xs) => xs[Math.floor(r() * xs.length)];
const chance = (r, p) => r() < p;
const roll = (r, n) => Math.floor(r() * n);

// ---------- tables ----------
// One pool for everyone — the leader draws from it too. A name carries a sex
// because a face does, and a name that fights its portrait is the one thing a
// reader notices before anything the log says.
//
// `any` is the interesting list: names that sit on either face. It is deliberately
// long. Most of these were androgynous before they were anything else — a trade
// (Pike, Fletcher-ish), a bird, a tree, a place — and a village where a third of
// the names could belong to anyone is a village, not a census form.
const NAMES = {
  f: ["Agatha", "Bridie", "Calla", "Dagny", "Freya", "Gerta", "Ilse", "Jorunn",
    "Linnet", "Lisbet", "Mira", "Orla", "Ottoline", "Quenna", "Rhoswen", "Sela",
    "Tamsin", "Thea", "Ulla", "Valla", "Verity", "Vesna", "Ysolde", "Zora"],
  m: ["Anselm", "Bevan", "Brann", "Clement", "Corvin", "Dorn", "Elric", "Finn",
    "Halvard", "Imre", "Jarl", "Kirwin", "Marek", "Merrick", "Norvel", "Nyle",
    "Odo", "Osric", "Piet", "Rafe", "Tomas", "Tovar", "Wendel", "Yannick"],
  any: ["Adrel", "Alder", "Bellamy", "Cass", "Delwyn", "Edrie", "Fenn", "Harlow",
    "Hesper", "Hollis", "Kestrel", "Mabry", "Perrin", "Pike", "Rowan", "Sorrel",
    "Wren", "Wyn"],
};
const ALL_NAMES = [...NAMES.f, ...NAMES.m, ...NAMES.any];
// What a face of this sex may be called. An ambiguous face takes anything.
const namesFor = (sex) => (sex === "any" ? ALL_NAMES : NAMES[sex].concat(NAMES.any));

// How each drawn face reads, by portrait id. Everything not listed reads male —
// that is the larger group, so listing the other two is the shorter list to keep
// correct when new sheets land. Face 9 is drawn ambiguously enough to go either
// way, which is what the `any` names are for.
const FACE_F = [1, 4, 6, 8, 13, 14, 16, 23, 24, 25, 26, 29, 31, 33, 35];
const FACE_ANY = [9];
const sexOf = (id) =>
  FACE_F.includes(id) ? "f" : FACE_ANY.includes(id) ? "any" : "m";
const SURNAMES = ["Ashdown", "Quill", "Fennimore", "Bray", "Holloway", "Stint",
  "Marrow", "Vane"];

// `bare` is the name a record uses: no article, because every line reads
// "<verb> at <place>" and "at the the shallows" is how a log stops scanning.
const PLACES = [
  { id: "riverbank", name: "the riverbank", bare: "the riverbank", tags: ["river", "open"] },
  { id: "flooded_grove", name: "the flooded grove", bare: "the grove", tags: ["forest", "river", "cold"] },
  { id: "old_mill", name: "the old mill", bare: "the mill", tags: ["village"] },
  { id: "the_ridge", name: "the ridge", bare: "the ridge", tags: ["heights", "open", "cold"] },
  { id: "cairn_field", name: "the cairn field", bare: "the cairns", tags: ["open", "quiet"] },
  { id: "birch_stand", name: "the birch stand", bare: "the birches", tags: ["forest"] },
  { id: "the_shallows", name: "the shallows", bare: "the shallows", tags: ["river"] },
  { id: "quarry_cut", name: "the quarry cut", bare: "the cut", tags: ["underground", "dark"] },
  { id: "the_fen", name: "the fen", bare: "the fen", tags: ["cold", "quiet"] },
];

// `verb` is bare past tense — the record supplies the "at". `unit` is what a
// day of it is counted in, including for the two tasks that stock nothing:
// boards and loads are still things you either got or did not.
const TASKS = [
  { id: "fishing", verb: "fished", skill: "fishing", tags: ["river"], yields: "fish", unit: "fish", plur: "fish" },
  { id: "felling", verb: "felled", skill: "carpentry", tags: ["forest"], yields: "log", unit: "log", plur: "logs" },
  { id: "foraging", verb: "foraged", skill: "foraging", tags: ["forest", "quiet"], yields: "roots", unit: "root", plur: "roots" },
  { id: "digging", verb: "dug", skill: "digging", tags: ["underground"], yields: "stone", unit: "stone", plur: "stone" },
  { id: "mending", verb: "mended", skill: "carpentry", tags: ["village"], yields: null, unit: "board", plur: "boards" },
  { id: "hauling", verb: "hauled", skill: "hauling", tags: ["heights", "village"], yields: null, unit: "load", plur: "loads" },
];

const PREF_TAGS = ["river", "forest", "underground", "dark", "cold", "heights", "quiet", "village"];

// authored, specific, per task — never assembled
const REASONS = {
  fishing: ["The water was running too quick.", "Nothing was moving all morning.",
    "Lost the line on a snag.", "The shallows had been fished out days ago."],
  felling: ["The saw bound up twice and that was that.", "Rot all the way through the first two.",
    "Wind came up and it was not worth the risk.", "Picked wrong; the whole stand is green yet."],
  foraging: ["Picked over already.", "Too early in the season for any of it.",
    "Found plenty and none of it worth eating.", "Deer had been through ahead."],
  digging: ["Hit shale and stopped.", "The face came down and the day went to clearing it.",
    "Water in the cut up to the ankle.", "Nothing in it but more of the same."],
  mending: ["Ran out of pitch halfway.", "Frost got in before the work could set.",
    "The old timber would not hold a nail.", "Pulled one board and found four worse."],
  hauling: ["The path was washed out.", "The sled broke a runner.",
    "Took three trips to do one trip's worth.", "Load shifted and went down the bank."],
};

// what the village can be talked into. Two at the riverbank rule each other out.
const BUILDINGS = [
  { id: "smokehouse", name: "a smokehouse", bare: "smokehouse", place: "riverbank", res: "log", need: 16,
    task: "fishing", bonus: 2, excludes: "boathouse",
    line: "The racks take the whole morning catch now." },
  { id: "boathouse", name: "a boathouse", bare: "boathouse", place: "riverbank", res: "log", need: 20,
    task: "fishing", bonus: 3, excludes: "smokehouse",
    line: "There is a flat-bottomed thing in it that almost floats." },
  { id: "drying_shed", name: "a drying shed", bare: "drying shed", place: "birch_stand", res: "log", need: 12,
    task: "foraging", bonus: 2, line: "Roots keep a month longer than they did." },
  { id: "cut_props", name: "props for the cut", bare: "props in the cut", place: "quarry_cut", res: "log", need: 20,
    task: "digging", bonus: 3, line: "The face has not come down since." },
  { id: "stone_path", name: "a stone path", bare: "stone path", place: "the_ridge", res: "stone", need: 16,
    task: "hauling", bonus: 2, line: "The climb is an hour shorter in the wet." },
];

const SPECIES = ["cedar", "birch", "black alder", "river oak"];
const QUALITY = ["poor", "fair", "sound", "good", "fine"];

// A lens is what a past life left you able to notice. There are nine because
// each one is paid off by hand in renderEvent — a lens with no render branch is
// a promise the log never keeps, so the list grows only when the branches do.
//
// Trades are many and lenses are few on purpose. The trade is who you were; the
// lens is the part of that which still shows. Several trades share a lens and
// that is not a cheat, because the screen no longer prints what you will see —
// you find out by reading the log.
const BACKGROUNDS = {
  // land — the ground, the water table, where a site is wrong
  surveyor: { name: "Surveyor", sees: ["land"] },
  ploughman: { name: "Ploughman", sees: ["land"] },
  ditcher: { name: "Ditcher", sees: ["land"] },
  welldigger: { name: "Well-digger", sees: ["land"] },
  drainer: { name: "Fen-drainer", sees: ["land"] },

  // stores — what is running short, and who is eating badly
  cook: { name: "Cook", sees: ["stores"] },
  baker: { name: "Baker", sees: ["stores"] },
  miller: { name: "Miller", sees: ["stores"] },
  brewer: { name: "Brewer", sees: ["stores"] },
  salter: { name: "Salter", sees: ["stores"] },
  cheesemaker: { name: "Cheesemaker", sees: ["stores"] },
  butcher: { name: "Butcher", sees: ["stores"] },

  // body — injury, exhaustion, fear, the state of a living thing
  soldier: { name: "Soldier", sees: ["body"] },
  surgeon: { name: "Barber-surgeon", sees: ["body"] },
  midwife: { name: "Midwife", sees: ["body"] },
  gravedigger: { name: "Gravedigger", sees: ["body"] },
  watchman: { name: "Watchman", sees: ["body"] },
  shepherd: { name: "Shepherd", sees: ["body"] },
  swineherd: { name: "Swineherd", sees: ["body"] },
  goatherd: { name: "Goatherd", sees: ["body"] },
  farrier: { name: "Farrier", sees: ["body"] },
  falconer: { name: "Falconer", sees: ["body"] },

  // history — the village's own past, surfacing for you and nobody else
  scribe: { name: "Scribe", sees: ["history"] },
  clerk: { name: "Clerk", sees: ["history"] },
  minstrel: { name: "Minstrel", sees: ["history"] },
  storyteller: { name: "Storyteller", sees: ["history"] },
  priest: { name: "Priest", sees: ["history"] },
  bookbinder: { name: "Bookbinder", sees: ["history"] },

  // labor — how a thing was made, and what will fail first
  mason: { name: "Mason", sees: ["labor"] },
  carpenter: { name: "Carpenter", sees: ["labor"] },
  cooper: { name: "Cooper", sees: ["labor"] },
  smith: { name: "Blacksmith", sees: ["labor"] },
  potter: { name: "Potter", sees: ["labor"] },
  thatcher: { name: "Thatcher", sees: ["labor"] },
  woodcarver: { name: "Woodcarver", sees: ["labor"] },
  weaver: { name: "Weaver", sees: ["labor"] },
  ropemaker: { name: "Rope-maker", sees: ["labor"] },
  tanner: { name: "Tanner", sees: ["labor"] },
  dyer: { name: "Dyer", sees: ["labor"] },
  wheelwright: { name: "Wheelwright", sees: ["labor"] },

  // talk — who is saying what about whom, who owes whom
  pedlar: { name: "Pedlar", sees: ["talk"] },
  innkeeper: { name: "Innkeeper", sees: ["talk"] },
  laundress: { name: "Laundress", sees: ["talk"] },
  crier: { name: "Town crier", sees: ["talk"] },
  merchant: { name: "Merchant", sees: ["talk"] },
  mercer: { name: "Mercer", sees: ["talk"] },
  taxman: { name: "Tax collector", sees: ["talk"] },
  moneylender: { name: "Moneylender", sees: ["talk"] },

  // forest — what is being taken faster than it comes back
  forester: { name: "Forester", sees: ["forest"] },
  woodcutter: { name: "Woodcutter", sees: ["forest"] },
  charcoaler: { name: "Charcoal burner", sees: ["forest"] },
  hunter: { name: "Hunter", sees: ["forest"] },
  beekeeper: { name: "Beekeeper", sees: ["forest"] },

  // river — level, current, where the fish actually are
  fisher: { name: "Fisher", sees: ["river"] },
  ferryman: { name: "Ferryman", sees: ["river"] },
  reedcutter: { name: "Reed-cutter", sees: ["river"] },
  bargeman: { name: "Bargeman", sees: ["river"] },

  // underground — rock, and what the dark is like
  miner: { name: "Miner", sees: ["underground"] },
  quarrier: { name: "Quarrier", sees: ["underground"] },
  chalkcutter: { name: "Chalk cutter", sees: ["underground"] },
  ratcatcher: { name: "Rat-catcher", sees: ["underground"] },
};
const BG_IDS = Object.keys(BACKGROUNDS);

// Four brackets, because a portrait sheet is generated per bracket and four is
// what fits one image. A leader is never a child — the expedition would not
// have sent one — so the leader picker starts at "young".
// `w` is how often a bracket is rolled for a villager. Flat weights put a child
// in nearly every village of five, and the sim would then send them up the
// quarry face — children are here, but they are not the common case.
const AGES = [
  { id: "child", label: "child", lo: 10, hi: 12, w: 2 },
  { id: "young", label: "young", lo: 27, hi: 34, w: 5 },
  { id: "mid", label: "middle-aged", lo: 45, hi: 50, w: 5 },
  { id: "old", label: "old", lo: 75, hi: 80, w: 3 },
];
const AGE_BAG = AGES.flatMap((a) => Array(a.w).fill(a));
const AGE_IDS = AGES.map((a) => a.id);
const ageOf = (n) => (AGES.find((a) => n <= a.hi) || AGES[AGES.length - 1]).id;

// One person per id, drawn once as a 5x4 sheet and sliced: four ages down,
// five moods across. Everyone in a run wears a different id.
const FACES = 36; // sheets drawn so far — raise as assets/face-N-*.webp land
const FACE_IDS = Array.from({ length: FACES }, (_, i) => i + 1);
const MOODS = ["happy", "neutral", "sad", "angry", "scared"];
const portrait = (id, age = "young", mood = "neutral") =>
  `assets/face-${FACE_IDS.includes(id) ? id : 1}-${age}-${mood}.webp`;

// ---------- world gen ----------
// Villagers are rolled the same way the leader is: a face, a name, a past life,
// a thing they like and a thing they do not. `faces` is the pool of portrait
// ids still free — the leader's is already out of it, and each villager takes
// one, so no two people in a run wear the same face.
function makeVillager(r, id, faces, taken) {
  const likes = pick(r, PREF_TAGS);
  let dislikes = pick(r, PREF_TAGS);
  while (dislikes === likes) dislikes = pick(r, PREF_TAGS);
  const bracket = pick(r, AGE_BAG);
  // a used face is spliced out so nobody repeats. If the pool ever runs dry
  // (fewer drawn people than villagers) repeat rather than hand back undefined
  const face = faces.length
    ? faces.splice(roll(r, faces.length), 1)[0]
    : pick(r, FACE_IDS);
  // the face is chosen first because the name has to suit it. `taken` holds the
  // leader's name and everyone already made, so no two people answer to one name
  const fits = namesFor(sexOf(face)).filter((n) => !taken.includes(n));
  const name = pick(r, fits.length ? fits : namesFor(sexOf(face)));
  taken.push(name);
  return {
    id,
    name,
    full: `${name} ${pick(r, SURNAMES)}`,
    sex: sexOf(face),
    age: bracket.lo + roll(r, bracket.hi - bracket.lo + 1),
    bracket: bracket.id,
    bg: pick(r, BG_IDS),
    face,
    likes, dislikes,
    skills: {},
    rumors: [],
    talkativeness: 0.2 + r() * 0.7,
    credulity: 0.3 + r() * 0.7,
    injured: 0,
    // what the leader last put their hands to alongside this person. Not an
    // order and not a job title — a thing they were shown, which they keep
    // doing until something they'd rather do wins.
    taught: null,
    broke: null,
  };
}

// `mine` is the leader's portrait id and `myName` their first name, both held
// out so nobody in the village turns up wearing the player's face or answering
// to their name.
function genWorld(seed, count = 5, mine = null, myName = null) {
  const r = mulberry32(seed);
  const faces = FACE_IDS.filter((f) => f !== mine);
  const taken = myName ? [myName] : [];
  const w = {
    r, seed, turn: 0, events: [], items: [], nextEv: 0,
    open: [], built: [], foreclosed: [], bonuses: {}, refused: {},
    villagers: Array.from({ length: count }, (_, i) => makeVillager(r, i, faces, taken)),
    places: PLACES.slice(),
    founded: 30 + roll(r, 20),
  };
  genHistory(w);
  return w;
}

// 30-50 years before the player arrives. Same log, negative turns.
function genHistory(w) {
  const r = w.r;
  const founders = [pick(r, ALL_NAMES), pick(r, ALL_NAMES)];
  ev(w, { kind: "founded", year: w.founded, actors: [], who: founders, tags: ["history"] });
  for (let year = w.founded - 1; year > 0; year--) {
    if (!chance(r, 0.55)) continue;
    const k = pick(r, ["flood", "raised", "death", "birth", "left", "hard_winter", "found"]);
    ev(w, {
      kind: "hist_" + k, year,
      place: pick(r, w.places),
      who: [pick(r, ALL_NAMES)],
      other: pick(r, ALL_NAMES),
      n: 1 + roll(r, 4),
      thing: pick(r, ["a wall under the turf", "bones, not ours", "a coin nobody could read",
        "a step cut into the rock", "a ring of stakes", "iron, rusted to a shell"]),
      tags: ["history"],
    });
  }
}

function ev(w, e) {
  e.id = w.nextEv++;
  e.turn = e.year != null ? -e.year : w.turn;
  w.events.push(e);
  return e;
}

// ---------- opinion / rumors ----------
function opinion(v, targetId, turn) {
  let s = 0;
  for (const r of v.rumors) {
    if (r.about !== targetId) continue;
    const age = turn - r.turn;
    s += r.valence * Math.pow(0.97, age); // decay
  }
  return s;
}

// the leader sits in the rumor graph too, as id -1
const person = (w, id) => (id === -1 ? w.leader : w.villagers[id]);

function affinity(a, bId, turn) {
  const o = opinion(a, bId, turn);
  return Math.max(-1, Math.min(1, o / 3));
}

function seed_rumor(w, about, valence, eventId, witnesses) {
  for (const v of witnesses) {
    if (v.id === about) continue;
    v.rumors.push({ about, valence, eventId, hops: 0, from: null, turn: w.turn });
  }
}

function gossipRound(w) {
  const r = w.r;
  const vs = w.villagers;
  const pairs = 1 + roll(r, 2);
  for (let i = 0; i < pairs; i++) {
    const a = pick(r, vs);
    const b = pick(r, vs);
    if (a.id === b.id) continue;
    if (!chance(r, a.talkativeness)) continue;
    const spreadable = a.rumors.filter((x) => x.hops < 4);
    if (!spreadable.length) continue;
    const src = pick(r, spreadable);
    if (b.rumors.some((x) => x.eventId === src.eventId)) continue;
    if (src.about === b.id) continue; // nobody gossips to you about you

    const trust = 0.4 + 0.6 * ((1 + affinity(b, a.id, w.turn)) / 2) * b.credulity;
    let valence = src.valence * trust;
    let about = src.about;
    let distorted = false;

    // hop distortion — telephone game
    if (chance(r, 0.10 + 0.06 * src.hops)) {
      distorted = true;
      if (chance(r, 0.5)) valence = -valence;
      else { const t = pick(r, vs); if (t.id !== b.id) about = t.id; }
    }

    b.rumors.push({ about, valence, eventId: src.eventId, hops: src.hops + 1, from: a.id, turn: w.turn, distorted });
    ev(w, { kind: "gossip", teller: a, hearer: b, about: person(w, about), src: src.eventId, distorted, neg: valence < 0, tags: ["talk"] });
  }
}

// ---------- sim ----------
// Every {task, place} this villager could plausibly do today, heaviest first.
// The UI offers the top of this list, so what the player is shown to demonstrate
// is work this person would actually have considered.
function jobsFor(w, v) {
  const opts = [];
  for (const t of TASKS) {
    for (const p of w.places) {
      if (!t.tags.some((tag) => p.tags.includes(tag))) continue;
      let weight = 1;
      if (p.tags.includes(v.likes) || t.tags.includes(v.likes)) weight += 3;
      if (p.tags.includes(v.dislikes) || t.tags.includes(v.dislikes)) weight -= 0.85;
      weight += (v.skills[t.skill] || 0) * 0.4;
      if (weight > 0) opts.push({ t, p, weight });
    }
  }
  return opts.sort((a, b) => b.weight - a.weight);
}

// How likely someone is to turn up tomorrow at the work you showed them. Skill
// holds them (competence is its own reason), a liking holds them, a dislike
// pulls hard the other way. Never certain in either direction — the whole point
// is that they are deciding, so a taught job is a bet on a person, not an order.
function holdOf(w, v) {
  if (!v.taught) return 0;
  const t = TASKS.find((x) => x.id === v.taught.t), p = placeById(w, v.taught.p);
  if (!t || !p) return 0;
  let hold = 0.68 + (v.skills[t.skill] || 0) * 0.06;
  if (p.tags.includes(v.likes) || t.tags.includes(v.likes)) hold += 0.18;
  if (p.tags.includes(v.dislikes) || t.tags.includes(v.dislikes)) hold -= 0.42;
  return Math.max(0.08, Math.min(0.94, hold));
}

function taskFor(w, v) {
  const r = w.r;
  // What they were shown gets first refusal. Failing that roll is not a random
  // wobble — it is the person choosing otherwise for the day. Three such days
  // running and the arrangement is done: a rule you can state in a sentence,
  // and a reason to come back and look before the third one lands.
  if (v.taught) {
    const t = TASKS.find((x) => x.id === v.taught.t), p = placeById(w, v.taught.p);
    if (t && p) {
      if (chance(r, holdOf(w, v))) {
        // Only coming back is news. Carrying on is visible in the log already,
        // as the same job on the same line four days running, and the roster is
        // where you go to ask whether it is still holding.
        const resumed = (v.taught.missed || 0) > 0;
        v.taught.missed = 0;
        return { t, p, kept: true, resumed };
      }
      // A day off is not a resignation. They wander, and if the work suits them
      // they drift back tomorrow. Three in a row is the arrangement telling you
      // it was the wrong bet — which is how the odds become legible by playing
      // rather than by being quoted.
      v.taught.missed = (v.taught.missed || 0) + 1;
      const done = v.taught.missed >= 3;
      v.broke = { t, p, done };
      if (done) v.taught = null;
    }
  }
  // preference-weighted: villagers pick work they like, avoid what they don't
  const opts = [];
  for (const t of TASKS) {
    for (const p of w.places) {
      if (!t.tags.some((tag) => p.tags.includes(tag))) continue;
      let weight = 1;
      if (p.tags.includes(v.likes) || t.tags.includes(v.likes)) weight += 3;
      if (p.tags.includes(v.dislikes) || t.tags.includes(v.dislikes)) weight -= 0.85;
      weight += (v.skills[t.skill] || 0) * 0.4;
      if (weight > 0) opts.push({ t, p, weight });
    }
  }
  const total = opts.reduce((s, o) => s + o.weight, 0);
  let x = r() * total;
  for (const o of opts) { x -= o.weight; if (x <= 0) return o; }
  return opts[0];
}

function doWork(w, v, leaderHelping, forced) {
  const r = w.r;
  // `forced` is the leader standing in front of them doing a specific thing.
  const { t, p, kept, resumed } = forced || taskFor(w, v);
  // taskFor sets `broke` on the way past when someone walked off what they were
  // shown. Read it here and clear it, so it is reported once, on the day it
  // happened, attached to the work they did instead.
  const broke = v.broke;
  v.broke = null;
  const skill = v.skills[t.skill] || 0;
  const effective = skill + (leaderHelping ? 1 : 0) + (w.bonuses[p.id + ":" + t.id] || 0);
  // present at the same place, or just around the village that day
  const witnessed = leaderHelping || w.leaderAt === p.id ||
    (!w.leaderAway && chance(r, 0.7));

  // A day is a handful of tries, not one pass/fail. Skill does not decide
  // whether the day happened — it moves the split between what came back worth
  // keeping and what came back anyway. That is what makes the record countable.
  const blank = chance(r, Math.max(0.05, 0.22 - effective * 0.05));
  const pGood = Math.min(0.9, 0.42 + effective * 0.1);
  // one stand, one day: the species is the place, not the tree
  const species = t.yields === "log" ? pick(r, SPECIES) : null;
  const noun = species || t.unit, many = species || t.plur;
  const units = [];
  if (!blank) {
    const n = 1 + roll(r, 4);
    for (let i = 0; i < n; i++) units.push({ good: chance(r, pGood), noun, many, quality: 1 });
    units.sort((a, b) => b.good - a.good); // good first: the order the eye wants
    for (const u of units)
      if (u.good) u.quality = Math.min(4, 2 + skill + (chance(r, 0.3) ? 1 : 0));
  }
  const got = units.filter((u) => u.good).length;

  // every unit is a real item, bad ones included — a poor log is still a log,
  // and it is what a building gets made of when nothing better is in the pile
  if (t.yields) for (const u of units) w.items.push({
    type: t.yields, species, quality: u.quality, from: p.id, by: v.id, turn: w.turn,
  });

  const e = ev(w, {
    kind: "work",
    v, task: t, place: p, units, species, leaderHelping, witnessed, kept, resumed, broke,
    why: units.length ? null : pick(r, REASONS[t.id]),
    tags: ["labor", "stores", ...p.tags],
  });

  // skill growth from doing — diminishing, so it doesn't run away
  if (got && chance(r, 0.25 / (1 + skill * 0.5))) {
    v.skills[t.skill] = skill + 1;
    ev(w, { kind: "skill_up", v, skill: t.skill, level: skill + 1, witnessed, tags: ["labor"] });
  }

  // setback — content, not punishment
  if (!got && chance(r, 0.08)) {
    v.injured = 2;
    const se = ev(w, { kind: "setback", v, place: p, task: t, leaderHelping, witnessed, tags: ["body"] });
    seed_rumor(w, v.id, -1.2, se.id, witnesses(w, p, v));
  }

  const witn = witnesses(w, p, v);
  // only a day worth talking about gets talked about, either way
  if (got >= 3 && chance(r, 0.4)) seed_rumor(w, v.id, 0.9, e.id, witn);
  if (!got && chance(r, 0.3)) seed_rumor(w, v.id, -0.7, e.id, witn);

  return { t, p, good: got > 0 };
}

function witnesses(w, place, subject) {
  return w.villagers.filter((x) => x.id !== subject.id && chance(w.r, 0.4));
}

// ---------- proposals ----------
const placeById = (w, id) => w.places.find((p) => p.id === id);
const live = (w, id) => !w.built.some((x) => x.id === id) && !w.foreclosed.includes(id);

function raiseProposal(w) {
  const r = w.r;
  if (w.open.length >= 3) return;
  const opts = BUILDINGS.filter((b) => live(w, b.id) &&
    !w.open.some((o) => o.b.id === b.id) &&
    w.turn - (w.refused[b.id] || -99) > 12 &&
    w.items.filter((i) => i.type === b.res).length >= b.need);
  if (!opts.length) return;
  const b = pick(r, opts);
  const by = pick(r, w.villagers);
  const rival = b.excludes && live(w, b.excludes) ? BUILDINGS.find((x) => x.id === b.excludes) : null;
  const p = { b, by, rival };
  w.open.push(p);
  ev(w, { kind: "proposal", b, by, rival, place: placeById(w, b.place), witnessed: true, tags: ["land"] });
}

function decide(w, leader) {
  if (!w.open.length) return;
  const r = w.r;
  const p = w.open[0];
  // ranger reaches outward; worker keeps to the village and the river
  const outward = ["quarry_cut", "the_ridge", "birch_stand"].includes(p.b.place);
  const want = leader.policy === "ranger" ? (outward ? 0.85 : 0.35) : (outward ? 0.3 : 0.85);
  resolve(w, leader, p.b.id, chance(r, want));
}

// the effect of an answer, whoever gave it
function resolve(w, leader, buildingId, yes) {
  const i = w.open.findIndex((o) => o.b.id === buildingId);
  if (i < 0) return;
  const p = w.open.splice(i, 1)[0];
  ev(w, { kind: "decided", yes, leader, b: p.b, by: p.by, rival: p.rival, witnessed: true, tags: [] });
  if (!yes) { w.refused[p.b.id] = w.turn; return; }

  // the stock may have gone into something else since it was asked for
  const stock = w.items.filter((i) => i.type === p.b.res).length;
  if (stock < p.b.need) {
    ev(w, { kind: "short", b: p.b, have: stock, witnessed: true, tags: ["stores"] });
    w.refused[p.b.id] = w.turn;
    return;
  }

  // consume real items — provenance carries into the building
  const used = [];
  for (let i = w.items.length - 1; i >= 0 && used.length < p.b.need; i--) {
    if (w.items[i].type === p.b.res) used.push(w.items.splice(i, 1)[0]);
  }
  w.built.push(p.b);
  if (p.rival) w.foreclosed.push(p.rival.id);
  w.bonuses[p.b.place + ":" + p.b.task] = p.b.bonus;
  ev(w, { kind: "built", b: p.b, used, place: placeById(w, p.b.place), rival: p.rival, witnessed: true, tags: ["land", "stores"] });
}

// ---------- leader ----------
const outside = (w) => w.places.filter((x) => !x.tags.includes("village"));

// What the leader was doing while the tab was shut. These are the only actions
// the wall clock can buy, and every one of them pays sideways — a name, a
// place, a thing somebody said — never in stores and never in skill. The day
// an absence out-earns a turn is the day the game rewards not opening it.
//
// `hrs` is the least time away that puts an option on the table, so a long
// absence is not a bigger pile of the same choices — it is choices a daily
// player never sees. Nothing here runs while the tab is closed: each pick the
// player makes IS a turn, generated on the tap that makes it.
const AWAY = [
  { id: "bounds", hrs: 0, label: "Walked the bounds", det: "the village and its edges" },
  { id: "sat", hrs: 0, label: "Sat with somebody", det: "nothing asked for, nothing owed" },
  { id: "listened", hrs: 0, label: "Listened at the mill", det: "whatever was being said" },
  { id: "hand", hrs: 0, label: "Put a hand to the work", det: "whoever was short one" },
  { id: "ranged", hrs: 6, label: "Went out a day", det: "there and back before dark" },
  { id: "ridge", hrs: 12, label: "Climbed the ridge", det: "to see where the work is going" },
  { id: "downriver", hrs: 48, label: "Went downriver", det: "a fortnight's business, at least" },
  { id: "accounts", hrs: 72, label: "Sat in the old accounts", det: "the hollow before it was ours" },
];

// how many picks an absence is worth, and which ones it unlocks
const awayPicks = (hours) => hours < 0.75 ? 0 : Math.min(4, 1 + Math.floor(hours / 12));
const awayOpts = (hours) => AWAY.filter((o) => o.hrs <= hours);

function awayTurn(w, leader, o) {
  const r = w.r;
  let did = o.label.toLowerCase(), place = null, got = "nothing", away = false;
  const rec = (tags) => ev(w, { kind: "away", leader, opt: o, did, place, got, witnessed: true, tags: tags || [] });

  switch (o.id) {
    case "sat": {
      const v = pick(r, w.villagers);
      did = `sat with ${v.name}`;
      got = "nothing either of you had to say";
      seed_rumor(w, -1, 0.9, rec(["talk"]).id, [v]);
      return { away: false };
    }
    case "listened": {
      // the loudest thing anyone currently believes about anyone else
      let worst = null;
      for (const a of w.villagers) for (const b of w.villagers) {
        if (a.id === b.id) continue;
        const n = opinion(a, b.id, w.turn);
        if (!worst || Math.abs(n) > Math.abs(worst[2])) worst = [a, b, n];
      }
      got = worst && Math.abs(worst[2]) > 0.4
        ? `${worst[0].name} is ${worst[2] > 0 ? "warm to" : "sour on"} ${worst[1].name}`
        : "nothing anyone would repeat";
      rec(["talk"]);
      return { away: false };
    }
    case "hand": {
      const able = w.villagers.filter((x) => !x.injured);
      const v = pick(r, able.length ? able : w.villagers);
      doWork(w, v, true);
      // the villager's own record already names the leader and carries the haul
      ev(w, { kind: "leader_worked", leader, v, witnessed: true, tags: ["labor"] });
      return { away: false, worked: v.id };
    }
    case "ranged": {
      const p = pick(r, outside(w));
      w.leaderAt = p.id; away = true;
      place = p;
      got = chance(r, 0.45)
        ? pick(r, ["a cairn nobody has kept up", "old stakes driven in a line",
            "a bend where the water runs wrong", "a hearth-stone under moss",
            "boot-prints that aren't ours", "a birch scarred with a mark"])
        : "nothing";
      rec(["land", "history"]);
      break;
    }
    case "ridge": {
      const p = placeById(w, "the_ridge");
      w.leaderAt = p.id; away = true;
      // where the hollow is actually being worked — map knowledge, not stores
      const from = {};
      for (const i of w.items) if (w.turn - i.turn <= 12) from[i.from] = (from[i.from] || 0) + 1;
      const best = Object.entries(from).sort((a, b) => b[1] - a[1])[0];
      got = best
        ? `most of it comes out of ${placeById(w, best[0]).bare} — ${best[1]} in twelve days`
        : "nothing is coming out of anywhere";
      rec(["land"]);
      break;
    }
    case "downriver": {
      away = true;
      const v = pick(r, w.villagers);
      const neg = chance(r, 0.5);
      got = `word of ${v.name} has gone downriver, and it is ${neg ? "not kind" : "kind enough"}`;
      seed_rumor(w, v.id, neg ? -1.0 : 1.0, rec(["talk", "history"]).id, w.villagers);
      break;
    }
    case "accounts": {
      w.read = w.read || [];
      const past = w.events.filter((e) => e.turn < 0 && !w.read.includes(e.id) && renderHist(e));
      if (past.length) {
        const h = pick(r, past);
        w.read.push(h.id);
        got = renderHist(h);
      } else got = "nothing in it you had not already read";
      rec(["history"]);
      break;
    }
    default: { // bounds
      got = `${w.villagers.length} here, ${w.built.length} ${w.built.length === 1 ? "thing" : "things"} standing`;
      rec(["land"]);
    }
  }
  w.leaderAway = away;
  return { away };
}


// what the leader does with their own day, when nobody is choosing for them
function policyAction(w, leader) {
  const r = w.r;
  const policy = leader.policy;
  const wantOut = policy === "ranger" ? 0.5 : policy === "worker" ? 0.15 : 0.3;
  if (chance(r, wantOut)) return { kind: "range", place: pick(r, outside(w)).id };
  if (policy === "worker" && chance(r, 0.65)) return { kind: "work", v: pick(r, w.villagers).id };
  return { kind: "stay" };
}

function leaderTurn(w, leader, action) {
  const r = w.r;
  if (!action) action = policyAction(w, leader);

  if (action.kind === "away") {
    w.leaderAt = "old_mill";
    w.leaderAway = false;
    return awayTurn(w, leader, AWAY.find((x) => x.id === action.id) || AWAY[0]);
  }

  if (action.kind === "range") {
    const p = placeById(w, action.place) || pick(r, outside(w));
    w.leaderAt = p.id;
    w.leaderAway = true;
    const found = chance(r, 0.35);
    ev(w, {
      kind: found ? "ranged_found" : "ranged",
      place: p, leader,
      thing: pick(r, ["a cairn nobody has kept up", "old stakes driven in a line",
        "a bend where the water runs wrong", "a hearth-stone under moss",
        "boot-prints that aren't ours", "a birch scarred with a mark"]),
      tags: ["land", "history"], witnessed: true,
    });
    return { away: true };
  }

  w.leaderAt = "old_mill";
  w.leaderAway = false;
  if (action.kind === "work") {
    const v = w.villagers[action.v] || pick(r, w.villagers);
    // the leader chose what to put their hands to, not just who to stand next to
    const t = TASKS.find((x) => x.id === action.task);
    const p = placeById(w, action.place);
    v.broke = null; // showing them something new supersedes the old arrangement
    const res = doWork(w, v, true, t && p ? { t, p } : null);
    // Shown, not ordered. From tomorrow this is what they turn up to, until
    // they would rather do something else.
    v.taught = { t: res.t.id, p: res.p.id, turn: w.turn, missed: 0 };
    const e = ev(w, { kind: "leader_worked", leader, v, task: res.t, place: res.p, witnessed: true, tags: ["labor"] });
    seed_rumor(w, -1, 0.8, e.id, w.villagers.filter(() => chance(r, 0.6)));
    return { away: false, worked: v.id };
  }
  return { away: false };
}

// `decisions` is [[buildingId, yes], ...] when a player is answering. Absent,
// the leader answers what was put to them according to their policy.
function advance(w, leader, action, decisions) {
  w.turn++;
  if (decisions) for (const [id, yes] of decisions) resolve(w, leader, id, yes);
  else if (!w.leaderAway) decide(w, leader);
  const lt = leaderTurn(w, leader, action);
  for (const v of w.villagers) {
    if (v.id === lt.worked) continue; // already had their day, with the leader in it
    if (v.injured > 0) { v.injured--; ev(w, { kind: "resting", v, witnessed: !lt.away, tags: ["body"] }); continue; }
    if (chance(w.r, 0.5)) doWork(w, v, false);
  }
  gossipRound(w);
  if (chance(w.r, 0.3)) raiseProposal(w);

  // disputes surface from accumulated negative opinion
  if (chance(w.r, 0.18)) {
    const a = pick(w.r, w.villagers);
    const b = pick(w.r, w.villagers);
    if (a.id !== b.id && opinion(a, b.id, w.turn) < -1.2) {
      const e = ev(w, { kind: "dispute", a, b, witnessed: !lt.away, tags: ["talk"] });
      seed_rumor(w, b.id, -0.8, e.id, [a]);
    }
  }
}

// ---------- render ----------
// Every line is a record and every record is the same shape:
//
//     who - what where : what came of it
//
// The fields never reorder, never get rephrased and never soften. That is the
// whole trick: a log you can scan is a log that says a thing exactly one way,
// so the line that is shaped wrong is the line your eye stops on. There is no
// sentence-variation layer here any more — variation lives in the numbers.
const q = (n) => QUALITY[Math.min(4, Math.max(0, n))];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// A day's haul, counted. "3 good fish, 2 bad fish" — good first, then bad,
// because that is the order the eye wants them in. An empty day is `nothing`.
function tally(units) {
  if (!units || !units.length) return "nothing";
  const out = [];
  for (const u of units) {
    const key = u.good ? "good" : "bad";
    const hit = out.find((o) => o.key === key && o.one === u.noun);
    if (hit) hit.n++; else out.push({ key, one: u.noun, many: u.many || u.noun, n: 1 });
  }
  return out.map((o) => `${o.n} ${o.key} ${o.n === 1 ? o.one : o.many}`).join(", ");
}

// REASONS are authored sentences. As a record field they are a trailing fact
// about a blank day, not an apology for it — so no full stop, no capital.
const because = (s) => s.replace(/\.$/, "").replace(/^./, (c) => c.toLowerCase());

function renderHist(e) {
  const y = `Year ${e.year}`;
  const at = e.place ? e.place.bare : "the hollow";
  switch (e.kind) {
    case "founded": return `${y} - ${e.who[0]}, ${e.who[1]} raised the first roof at ${at} : Millhollow`;
    case "hist_flood": return `${y} - flood at ${at} : ${e.n} week${e.n === 1 ? "" : "s"} under`;
    case "hist_raised": return `${y} - ${e.who[0]} raised a shed at ${at} : still standing`;
    case "hist_death": return `${y} - ${e.who[0]} died at ${at} : ${e.other} keeps the marker`;
    case "hist_birth": return `${y} - ${e.who[0]} born : ${e.other} carried the water`;
    case "hist_left": return `${y} - ${e.who[0]} left : no word since`;
    case "hist_hard_winter": return `${y} - hard winter : ${e.n} head of stock lost`;
    case "hist_found": return `${y} - dug up at ${at} : ${e.thing}`;
    default: return null;
  }
}

function renderEvent(e, leader, w) {
  const sees = (tag) => BACKGROUNDS[leader.bg].sees.includes(tag);
  // first names in the column, the leader included — the surname is for the
  // header, not for a field the eye has to run past forty times
  const me = leader.name.split(" ")[0];
  // Not having been there is a fact about the record, not a hedge on the prose.
  // One marker, always in the same place, instead of four ways of shrugging.
  const heard = (s) => e.witnessed === false ? `${s} (heard)` : s;

  switch (e.kind) {
    case "work": {
      let s = `${e.v.name} - ${e.task.verb} at ${e.place.bare} : ${tally(e.units)}`;
      if (!e.units.length && e.why) s += ` — ${because(e.why)}`;
      // The break is the line worth reading in the whole log: the day somebody
      // decided otherwise. It names the abandoned work, not this one, because
      // what the player needs to know is which bet just came apart.
      if (e.broke) s += e.broke.done
        ? ` — gave up the ${e.broke.t.id}`
        : ` — off the ${e.broke.t.id} today`;
      if (e.leaderHelping) s += ` (with ${me})`;
      else if (e.resumed) s += ` (back on it)`;
      const got = e.units.filter((u) => u.good).length;
      if (sees("stores") && got >= 3 && e.id % 11 === 0) s += ` [that will keep through winter]`;
      if (sees("land") && e.place.tags.includes("river") && e.id % 13 === 0)
        s += ` [water lower there than last month]`;
      if (sees("labor") && e.id % 17 === 0) s += ` [done the long way round]`;
      if (sees("forest") && e.place.tags.includes("forest") && e.id % 8 === 0)
        s += ` [stand is going faster than it comes back]`;
      if (sees("river") && e.place.tags.includes("river") && e.id % 8 === 0)
        s += ` [gravel has shifted; good water is twenty yards down]`;
      if (sees("underground") && e.place.tags.includes("underground"))
        s += ` [dry rock, rings solid]`;
      if (!got && sees("stores") && e.id % 9 === 0) s += ` [second lean day this week]`;
      if (!got && sees("labor") && e.id % 13 === 0) s += ` [wrong day for it, not wrong hands]`;
      return heard(s);
    }
    case "skill_up": {
      let s = `${e.v.name} - skill : ${e.skill} ${e.level}`;
      if (sees("labor")) s += ` [stopped thinking about it, which is when it goes right]`;
      return heard(s);
    }
    case "setback": {
      let s = `${e.v.name} - hurt ${e.task.id} at ${e.place.bare} : laid up 2 days`;
      if (e.leaderHelping) s += ` (${me} carried them back)`;
      if (sees("body")) s += ` [favouring the left side; a week, not a day]`;
      return heard(s);
    }
    case "resting":
      return heard(`${e.v.name} - kept in : nothing`);
    case "leader_worked":
      // the villager's own record already names the leader and carries the haul
      return null;
    case "ranged":
      return `${me} - walked to ${e.place.bare} : nothing`;
    case "ranged_found": {
      let s = `${me} - walked to ${e.place.bare} : ${e.thing}`;
      if (sees("land")) s += ` [this ground was worked once, not recently]`;
      if (sees("history")) s += ` [matches something in the old accounts]`;
      return s;
    }
    case "away": {
      let s = `${me} - ${e.did}${e.place ? ` at ${e.place.bare}` : ""} : ${e.got}`;
      // a lens reads what is there — it does not manufacture something to read
      if (sees("land") && e.opt.id === "ranged" && e.got !== "nothing")
        s += ` [worked ground, and not recently]`;
      if (sees("talk") && e.opt.id === "listened" && e.got !== "nothing anyone would repeat")
        s += ` [it has been coming a while]`;
      return s;
    }
    case "gossip": {
      let s = `${e.teller.name} - spoke of ${e.about.name} to ${e.hearer.name} : ${e.neg ? "poorly" : "well"}`;
      if (e.distorted) s += ` — not what happened`;
      if (sees("talk")) s += e.distorted
        ? ` [changed hands ${e.hops || 2} times; it will change again]`
        : ` [${e.hearer.name} believed it already]`;
      return s;
    }
    case "dispute": {
      let s = `${e.a.name}, ${e.b.name} - words : no blows`;
      if (sees("talk")) s += ` [not about today; it has been coming for weeks]`;
      return heard(s);
    }
    case "proposal": {
      let s = `${e.by.name} - asks for ${e.b.bare} at ${e.place.bare} : ${e.b.need} ${e.b.res}`;
      if (e.rival) s += ` — rules out the ${e.rival.bare}`;
      if (sees("land")) s += ` [the ground will take it]`;
      return s;
    }
    case "decided":
      return `${me} - ${e.yes ? "agreed" : "refused"} : ${e.b.bare}`;
    case "short":
      return `${e.b.bare} - short : ${e.have} of ${e.b.need} ${e.b.res}`;
    case "built": {
      const seen = new Set();
      const shown = e.used.filter((i) => !seen.has(i.by) && seen.add(i.by)).slice(0, 2);
      const desc = shown.map((i) => {
        const from = placeById(w, i.from);
        const by = w.villagers[i.by];
        return `${q(i.quality)} ${i.species || i.type} from ${by.name} out of ${from.bare}`;
      });
      const n = e.used.length - shown.length;
      const rest = n > 0 ? `, +${n} more` : "";
      let s = `${cap(e.b.bare)} - stands at ${e.place.bare} : ${desc.join("; ")}${rest} — ${because(e.b.line)}`;
      if (e.rival) s += ` — no ${e.rival.bare} here now`;
      if (sees("underground") && e.used.some((i) => i.type === "stone"))
        s += ` [quarry stone, cut with the grain]`;
      if (sees("labor")) s += ` [square enough; the joints will open in the first winter]`;
      return s;
    }
    default:
      return null;
  }
}

// ---------- exports ----------
// ponytail: no module system. browser reads the globals, node reads this.
if (typeof module !== "undefined") {
  module.exports = {
    mulberry32, pick, chance, roll,
    NAMES, ALL_NAMES, namesFor, sexOf, PLACES, TASKS, BUILDINGS, BACKGROUNDS,
    genWorld, ev, opinion, person, affinity, gossipRound, jobsFor, holdOf,
    taskFor, doWork, placeById, live, outside,
    AWAY, awayPicks, awayOpts, awayTurn,
    raiseProposal, decide, resolve, policyAction, leaderTurn, advance,
    renderHist, renderEvent, tally, q, cap,
  };
}
