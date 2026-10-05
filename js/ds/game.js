// Millhollow — game state and rules. No DOM in here: ui.js reads and calls.

const SAVE_KEY = "millhollow-ds-v1";
// The overworld is LAND×LAND, mostly unseen at first. It grows outward whenever the known land
// nears its edge, so it never runs out.
let LAND, MID;
const setLand = (n) => { LAND = n; MID = (n >> 1) * LAND + (n >> 1); };
setLand(17);
const MAP = 5; // dungeon floors are MAP×MAP

const rand = (n) => Math.floor(Math.random() * n);
const pick = (xs) => xs[rand(xs.length)];
const chance = (p) => Math.random() < p;

let S; // the whole game
let lastYields = []; // what each tile made on the most recent day, for ui.js to show

// ---------- log ----------
// `who` are the people it happened to or around; each keeps the line in their own story.
function gameLog(text, kind = "", who = []) {
  S.log.push({ day: S.day, text, kind, n: (S.logN = (S.logN || 0) + 1) });
  if (S.log.length > 300) S.log.shift();
  who.forEach((s) => note(s, { text, kind }));
}
// A person's own history. The same thought on consecutive days folds into one line with a count.
function note(s, entry) {
  s.story ||= [];
  const last = s.story[s.story.length - 1];
  if (entry.k && last && last.k === entry.k && S.day - last.to <= 1) { last.to = S.day; last.x = (last.x || 1) + 1; return; }
  s.story.push({ day: S.day, to: S.day, ...entry });
  if (s.story.length > 80) s.story.shift();
}

// ---------- settlers ----------
let nextId = 1;
function makeSettler(cls) {
  const face = 1 + rand(FACES);
  const taken = new Set(S ? S.settlers.map((s) => s.name) : []);
  const c = CLASSES[cls || pick(Object.keys(CLASSES))];
  const s = {
    id: nextId++, name: makeName(sexOf(face), taken), face, age: pick(AGES),
    cls: cls || Object.keys(CLASSES).find((k) => CLASSES[k] === c),
    level: 1, xp: 0, hpMax: c.hp, hp: c.hp, morale: 70,
    skills: {}, job: null, gear: { weapon: null, armor: null },
  };
  // everyone arrives good at one thing
  const trade = pick(Object.keys(JOBS));
  s.skills[trade] = 1 + rand(3);
  s.story = pastOf(s, trade);
  return s;
}
const pastOf = (s, trade) => [pick(PAST.born), PAST.trade[trade], pick(PAST.cls[s.cls]), pick(PAST.road)]
  .map((text) => ({ text, kind: "past" }));

function stats(s) {
  const c = CLASSES[s.cls];
  const g = [s.gear.weapon, s.gear.armor].filter(Boolean);
  const sum = (k) => g.reduce((a, it) => a + (it[k] || 0), 0);
  const atk = c.atk + Math.floor((s.level - 1) * 1.2) + sum("atk"), spd = c.spd + sum("spd");
  const h = haunted(s);
  return {
    hpMax: s.hpMax + sum("hp"),
    atk: h ? Math.ceil(atk * 0.75) : atk,
    def: c.def + Math.floor((s.level - 1) / 2) + sum("def"),
    spd: h ? Math.max(1, spd - 2) : spd,
  };
}

// Each unburied dead haunts one of the living until they're laid to rest.
const haunted = (s) => !s.dead && !!S.remains && S.remains.some((r) => r.haunts === s.id);

// ---------- talk ----------
// Survivors come home blaming someone for each death. The story spreads as gossip, and each
// telling can flip it or pin it on someone else. Burial ends the talk about that death.
// A story fades from someone after a while of its own; hearing it again brings it back.
const fades = () => S.day + 10 + rand(30);
const believes = (s, t) => (s.heard || []).filter((x) => x.about === t.id && !(x.until <= S.day)).reduce((a, x) => a + x.v, 0);
// What a story says someone did: a death, or the keeper's crown.
const deed = (x, v) => x.what ? x.what[v < 0 ? 0 : 1] : x.crown ? (v < 0 ? "lost the keeper's crown" : "tried to hold on to the crown")
  : v < 0 ? `got ${byId(x.death).name} killed` : `tried to save ${byId(x.death).name}`;
const grudge = (s, t) => s.id !== t.id && believes(s, t) <= -0.5;

// Whoever stood in the same lane and walked out least hurt takes the blame.
function blameDeath(dead, survivors, beside = () => true) {
  if (survivors.length < 2) return; // ponytail: a lone survivor blames nobody
  const frac = (s) => s.hp / stats(s).hpMax;
  const near = survivors.filter(beside);
  const about = (near.length ? near : survivors).slice().sort((a, b) => frac(b) - frac(a))[0];
  for (const w of survivors) if (w !== about) (w.heard ||= []).push({ about: about.id, death: dead.id, v: -1, hops: 0, until: fades() });
  const by = survivors.filter((w) => w !== about);
  gameLog(`${by.map((w) => w.name).join(", ")} blame${by.length > 1 ? "" : "s"} ${about.name} for ${dead.name}.`, "bad", survivors);
}

function gossip(home) {
  living().forEach((o) => o.heard && (o.heard = o.heard.filter((x) => (x.until ??= fades()) > S.day)));
  for (let n = 1 + rand(2); n > 0; n--) {
    const a = pick(home), b = pick(home);
    if (!a || a === b || grudge(b, a)) continue; // nobody believes someone they blame
    const told = (a.heard || []).filter((x) => x.hops < 4 && x.about !== b.id && !byId(x.about).dead
      && !(b.heard || []).some((y) => y.death === x.death));
    if (!told.length) continue;
    const x = pick(told);
    let about = x.about, v = x.v;
    if (chance(0.1 + 0.06 * x.hops)) {
      const other = home.filter((o) => o !== a && o !== b && o.id !== about);
      if (chance(0.5) || !other.length) v = -v; else about = pick(other).id;
    }
    b.credulity ??= Math.random();
    v *= 0.4 + 0.6 * b.credulity;
    (b.heard ||= []).push({ about, death: x.death, crown: x.crown, what: x.what, v, hops: x.hops + 1, from: a.id, until: fades() });
    gameLog(`${a.name} told ${b.name}: ${byId(about).name} ${deed(x, v)}.`, "story", [a, b]);
  }
  // A third of the village blaming you wears you down; in a small village one is enough.
  home.forEach((t) => { if (home.filter((o) => grudge(o, t)).length >= Math.max(1, Math.ceil((home.length - 1) / 3))) think(t, "blamed"); });
}

// What someone says when asked why they look the way they do: their own account, rumours as
// they believe them, true or not. Reasons for the face they're wearing come first.
function why(s) {
  const name = (id) => byId(id).name, has = (k) => fresh(s).some((x) => x.k === k);
  const told = (x) => (!x.hops ? "I was there." : x.from ? `${name(x.from)} told me.` : "I heard.");
  const said = [];
  const say = (m, text) => said.push([m, text]);
  const ghost = S.remains.find((r) => r.haunts === s.id);
  if (ghost) say("scared", `${name(ghost.id)} won't leave me be.`);
  if (s.hp < stats(s).hpMax * 0.3) say("scared", "I can barely stand.");
  if (has("neardeath")) say("scared", "I nearly died down there.");
  if (has("fled")) say("scared", "We ran.");
  for (const t of living()) {
    const xs = (s.heard || []).filter((x) => x.about === t.id).sort((a, b) => a.v - b.v);
    if (grudge(s, t)) say("angry", `${t.name} ${deed(xs[0], -1)}. ${told(xs[0])}`);
    else if (xs.length && xs[xs.length - 1].v > 0) say("happy", `${t.name} ${deed(xs[xs.length - 1], 1)}. ${told(xs[xs.length - 1])}`);
  }
  if (has("hungry") || has("starving")) say("angry", "I haven't eaten.");
  if (has("rough")) say("angry", "There's no bed for me.");
  if (s.morale < 30) say("angry", "I've had enough of this place.");
  const mine = S.settlers.flatMap((o) => (o.heard || []).filter((x) => x.about === s.id && x.v < 0 && !o.dead));
  if (has("blamed") && mine.length) say("sad", `They say I ${deed(mine[0], -1)}.`);
  const lost = S.settlers.filter((o) => o.dead && !o.buried).pop() || S.settlers.filter((o) => o.dead).pop();
  if (has("jilted")) say("sad", "I was left at the altar.");
  if (has("wed") && s.spouse) say("happy", `I married ${name(s.spouse)}.`);
  if (has("grief") && lost) say("sad", `${lost.name} is dead.`);
  if (s.hp < stats(s).hpMax * 0.7) say("sad", "Still hurting.");
  if (has("victory")) say("happy", "We killed the keeper.");
  if (has("levelup")) say("happy", "I'm getting stronger.");
  if (has("home")) say("happy", "Good to be home.");
  if (has("built")) say("happy", "The village is growing.");
  const m = mood(s);
  return [...said.filter(([x]) => x === m), ...said.filter(([x]) => x !== m)].slice(0, 2).map(([, t]) => t).join(" ") || "Nothing much.";
}

// ---------- thoughts ----------
// Things that just happened to someone. Each moves morale once, when it lands; while it's fresh
// it also sets the face, strongest feeling first and the newest breaking ties.
const THOUGHTS = {
  hungry:    { name: "Hungry", icon: "🍽", mood: "angry", morale: -12, days: 2 },
  haunted:   { name: "Haunted", icon: "👻", mood: "scared", morale: -2, days: 2 },
  starving:  { name: "Starving", icon: "🍽", mood: "angry", morale: -3, days: 1 },
  rough:     { name: "No bed", icon: "🛏", mood: "angry", morale: -4, days: 1 },
  grief:     { name: "Grieving", icon: "🪦", mood: "sad", morale: -10, days: 4 },
  neardeath: { name: "Nearly died", icon: "💔", mood: "scared", morale: -6, days: 2 },
  fled:      { name: "Fled", icon: "👣", mood: "scared", morale: -4, days: 1 },
  victory:   { name: "Slew a boss", icon: "🏆", mood: "happy", morale: 8, days: 3 },
  home:      { name: "Home again", icon: "🏘", mood: "happy", morale: 5, days: 2 },
  levelup:   { name: "Grew stronger", icon: "⭐", mood: "happy", morale: 5, days: 2 },
  built:     { name: "The village grows", icon: "🔨", mood: "happy", morale: 3, days: 1 },
  grudge:    { name: "Grudge", icon: "😠", mood: "angry", morale: -6, days: 3 },
  blamed:    { name: "Blamed", icon: "💬", mood: "sad", morale: -4, days: 2 },
  raided:    { name: "Raided", icon: "👁", mood: "scared", morale: -6, days: 2 },
  farwalk:   { name: "Long walk", icon: "👣", mood: "sad", morale: -2, days: 1 },
  brawl:     { name: "Brawl", icon: "👊", mood: "angry", morale: -4, days: 2 },
  made:      { name: "Made something", icon: "✨", mood: "happy", morale: 12, days: 5 },
  jilted:    { name: "Jilted", icon: "💔", mood: "sad", morale: -15, days: 6 },
  wed:       { name: "Married", icon: "💍", mood: "happy", morale: 15, days: 6 },
  hungover:  { name: "Sore head", icon: "🍖", mood: "sad", morale: -2, days: 1 },
  feast:     { name: "Feast", icon: "🍖", mood: "happy", morale: 10, days: 3 },
  mended:    { name: "Mended", icon: "🩹", mood: "happy", morale: 4, days: 2 },
  snapped:   { name: "Snapped", icon: "👻", mood: "scared", morale: -15, days: 4 },
};
const clampMorale = (n) => Math.max(0, Math.min(100, n));
function think(s, k) {
  const t = THOUGHTS[k];
  S.thoughtN = (S.thoughtN || 0) + 1;
  s.thoughts = (s.thoughts || []).filter((x) => x.k !== k && x.until > S.day);
  s.thoughts.push({ k, until: S.day + t.days, n: S.thoughtN });
  s.morale = clampMorale(s.morale + t.morale);
  note(s, { k });
}
const fresh = (s) => (s.thoughts || []).filter((x) => x.until > S.day);
function feeling(s) {
  return fresh(s).sort((a, b) => Math.abs(THOUGHTS[b.k].morale) - Math.abs(THOUGHTS[a.k].morale) || b.n - a.n)[0];
}

function mood(s) {
  const st = stats(s);
  // The dead rest easy once buried; left below, they're angry.
  if (s.dead) return s.buried ? "happy" : S.remains.some((r) => r.id === s.id) ? "angry" : "sad";
  if (haunted(s)) return "scared";
  if (s.hp < st.hpMax * 0.3) return "scared";
  const f = feeling(s);
  if (f) return THOUGHTS[f.k].mood;
  if (living().some((t) => grudge(s, t))) return "angry";
  if (s.morale < 30) return "angry";
  if (s.hp < st.hpMax * 0.7) return "sad";
  return s.morale >= 75 ? "happy" : "neutral";
}
const faceSrc = (s) => `assets/face-${s.face}-${s.age}-${mood(s)}.webp`;
const living = () => S.settlers.filter((s) => !s.dead);
// Those who left the village for good are still remembered, and talked about.
const byId = (id) => S.settlers.find((s) => s.id === id) || (S.gone || []).find((s) => s.id === id);

function gainXp(s, n) {
  s.xp += n;
  while (s.xp >= s.level * 15) {
    s.xp -= s.level * 15;
    s.level++;
    s.hpMax += 4;
    s.hp += 4;
    gameLog(`${s.name} is now level ${s.level}.`, "good", [s]);
    think(s, "levelup");
  }
}

// ---------- new game / save ----------
const xy = (i) => [i % LAND, Math.floor(i / LAND)];
const dist = (a, b) => { const [ax, ay] = xy(a), [bx, by] = xy(b); return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); };
const around = (i) => Array.from({ length: LAND * LAND }, (_, j) => j).filter((j) => j !== i && dist(i, j) === 1);
const wild = (i) => !!TERRAIN[S.land[i]].clear;

// A repeatable stream of numbers from one seed, so a world can be grown again from its seed.
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// One fixed number per spot and seed, so land beyond the edge is the same whenever it's grown.
const hash = (seed, x, y) => seeded(seed ^ Math.imul(x, 73856093) ^ Math.imul(y, 19349663))();

// Smooth noise over the land: random heights on a coarse lattice, eased between.
function noise(seed, step) {
  const ease = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const gx = x / step, gy = y / step, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = ease(gx - x0), ty = ease(gy - y0);
    const at = (a, b) => hash(seed, a, b);
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx, bot = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
    return top + (bot - top) * ty;
  };
}

// Hills and mountains where it's high, lakes where it's low, woods where it's wet, one river
// across, a few ruins, and open meadow around the middle where the settlers stop.
// Spots are counted from the middle, so a bigger land grown from the same seed only adds to the edges.
function genLand(seed) {
  const rng = seeded(seed);
  const h1 = noise(seed + 1, 6), h2 = noise(seed + 2, 3), m1 = noise(seed + 3, 5), m2 = noise(seed + 4, 2.5);
  const c = LAND >> 1;
  const land = Array.from({ length: LAND * LAND }, (_, i) => {
    const [x, y] = xy(i), d = dist(i, MID), X = x - c, Y = y - c;
    const h = 0.65 * h1(X, Y) + 0.35 * h2(X, Y), m = 0.6 * m1(X, Y) + 0.4 * m2(X, Y);
    if (d <= 1) return "meadow";
    if (h > 0.72 && d > 2) return "mountain";
    if (h > 0.62) return "hills";
    if (h < 0.21 && d > 2) return "water";
    if (d >= 3 && hash(seed + 5, X, Y) < 0.012) return "ruins";
    return m > 0.45 ? "forest" : "meadow";
  });
  // The river runs edge to edge, never through the clearing. It wanders out from the middle
  // both ways, each step its own, so it carries on the same when the land grows.
  const across = rng() < 0.5, side = rng() < 0.5 ? -1 : 1, r0 = side * (2 + Math.floor(rng() * 4));
  const put = (a, b) => {
    if (Math.abs(a) > c || Math.abs(b) > c) return;
    const i = across ? (b + c) * LAND + a + c : (a + c) * LAND + b + c;
    if (dist(i, MID) > 1) land[i] = "water";
  };
  for (const dir of [1, -1]) {
    let r = r0;
    for (let t = 0; Math.abs(t) <= c; t += dir) {
      put(r, t);
      const was = r;
      r += Math.floor(hash(seed + 6, t, dir) * 3) - 1;
      if (Math.abs(r) < 2 && Math.abs(t) < 3) r = was;
      if (r !== was) put(r, t);
    }
  }
  return land;
}

// Pads the land on every side, keeping what's there; everything that names a spot moves with it.
function grow(pad = 8) {
  const old = LAND, n = old + 2 * pad;
  const to = (i) => (Math.floor(i / old) + pad) * n + (i % old) + pad;
  const move = (xs, fill) => { const out = Array(n * n).fill(fill); xs.forEach((v, i) => (out[to(i)] = v)); return out; };
  const kept = move(S.land, null);
  S.grid = move(S.grid, null);
  S.seen = move(S.seen, false);
  if (S.hall != null) S.hall = to(S.hall);
  S.sites.forEach((x) => (x.i = to(x.i)));
  for (const s of [...S.settlers, S.visitor].filter(Boolean)) {
    if (s.job != null) s.job = to(s.job);
    if (s.was) s.was.i = to(s.was.i);
  }
  newLand = newLand.map(to);
  setLand(S.size = n);
  S.land = genLand(S.seed).map((t, i) => kept[i] ?? t);
  // New land brings new sites: about one per 200 new tiles, apart from the old ones.
  const rng = seeded(S.seed ^ n), fresh = S.land.map((_, j) => j).filter((j) => kept[j] == null);
  for (let k = Math.round(fresh.length / 200); k > 0; k--) {
    const kind = ["barrow", "mine", "thornwood", "shrine"][Math.floor(rng() * 4)];
    const i = siteSpot(kind, fresh, S.land, S.grid, S.sites, 4, rng);
    if (i != null) S.sites.push(makeSite(kind, i, rng));
  }
}
const siteSpot = (kind, from, land, grid, sites, gap, rng) => {
  const d = SITES[kind], free = from.filter((j) => !grid[j] && land[j] !== "water" && land[j] !== "mountain" && sites.every((s) => dist(s.i, j) >= gap));
  const fits = free.filter((j) => d.on.includes(land[j]) && (!d.by || around(j).some((k) => d.by.includes(land[k]))));
  const xs = fits.length ? fits : free;
  return xs.length ? xs[Math.floor(rng() * xs.length)] : null;
};
function makeSite(kind, i, rng) {
  const d = SITES[kind], pickR = (xs) => xs[Math.floor(rng() * xs.length)];
  const who = () => makeName(rng() < 0.5 ? "f" : "m", new Set(), rng);
  const name = rng() < 0.5 ? `${who()}'s ${pickR(d.nouns)}` : `The ${pickR(d.adj)} ${pickR(d.nouns)}`;
  return { kind, i, name, boss: `${who()} the ${pickR(d.epithet)}`, deepest: 0 };
}
// The mill sits by the clearing; the other sites lie further out, each on its own kind of land,
// named by the world's seed.
function genSites(seed, land, grid = []) {
  const rng = seeded(seed ^ 0x5173), pickR = (xs) => xs[Math.floor(rng() * xs.length)];
  const all = land.map((_, j) => j), sites = [];
  const millAt = all.filter((j) => !grid[j] && land[j] === "meadow" && dist(j, MID) >= 1 && dist(j, MID) <= 2).sort((a, b) => dist(a, MID) - dist(b, MID));
  sites.push({ kind: "mill", i: millAt.length ? pickR(millAt.filter((j) => dist(j, MID) === dist(millAt[0], MID))) : MID + 1, name: SITES.mill.name, deepest: 0 });
  const ring = all.filter((j) => dist(j, MID) >= 3 && dist(j, MID) <= 6);
  for (const kind of ["barrow", "mine", "thornwood", "shrine"]) sites.push(makeSite(kind, siteSpot(kind, ring, land, grid, sites, 3, rng), rng));
  return sites;
}
const siteAt = (i) => S.sites.find((s) => s.i === i);
// Walking out to a site and back takes days, a day for every three tiles each way.
const travelDays = (site) => (site.kind === "mill" ? 0 : 2 * Math.ceil(dist(site.i, S.hall ?? MID) / 3));

// How far from the town hall the land is known. Seen land stays seen.
const tech = (id) => S.research.filter((x) => x === id).length;
const sight = () => 2 + has("scouting") + tech("surveying") + 2 * tech("cartography");
let newLand = []; // tiles just revealed, for ui.js to fade in
function reveal(at, r) {
  const edge = () => { const [x, y] = xy(at); return Math.min(x, y, LAND - 1 - x, LAND - 1 - y) <= r; };
  while (edge()) { const pad = 8, k = LAND; grow(pad); at = (Math.floor(at / k) + pad) * LAND + (at % k) + pad; }
  S.seen.forEach((v, i) => { if (!v && dist(i, at) <= r) { S.seen[i] = true; newLand.push(i); } });
}

function newGame() {
  setLand(17);
  S = {
    day: 1, res: { food: 20, wood: 12, stone: 4, ore: 0, herbs: 0, relics: 0, research: 0, potions: 0, meals: 0, silver: 0, starmetal: 0 },
    seed: rand(2 ** 31), carry: {}, grid: Array(LAND * LAND).fill(null), seen: Array(LAND * LAND).fill(false), hall: null, cleared: 0, settlers: [], research: [],
    deepest: 0, visitor: null, expedition: null, log: [], remains: [], size: LAND, claim: 0,
  };
  S.land = genLand(S.seed);
  S.sites = genSites(S.seed, S.land);
  nextId = 1;
  for (const c of ["warrior", "ranger", "cleric", "mystic"]) S.settlers.push(makeSettler(c));
  reveal(MID, 2);
  newLand = [];
  gameLog(`Arrived: ${S.settlers.map((s) => s.name).join(", ")}.`, "story", S.settlers);
  save();
}

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S, nextId })); } catch (e) { } }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    ({ S, nextId } = JSON.parse(raw));
    setLand(S.size ||= 17);
    S.claim ??= 0;
    if (S.expedition && S.expedition.fight) S.expedition.fight = null; // a fight restarts on reload
    if (!S.seen) widenLand();
    if (!S.land) landFromWild();
    if (!S.sites) {
      S.sites = genSites(S.seed, S.land, S.grid);
      S.sites[0].deepest = S.deepest;
      if (S.expedition) S.expedition.site = 0;
    }
    unTool();
    for (const k of Object.keys(RESOURCES)) S.res[k] ??= 0;
    if (S.expedition) S.expedition.meals ??= 0;
    S.remains ??= [];
    for (const e of [...S.log, ...[...S.settlers, S.visitor].filter(Boolean).flatMap((s) => s.story || [])]) e.text = PAST_WAS[e.text] || e.text;
    // Cooks arrived with no trade line until cooking had one.
    for (const s of [...S.settlers, S.visitor].filter(Boolean)) for (const e of s.story || []) if (e.kind === "past" && !e.text) e.text = PAST.trade.cooking;
    // People from older saves get a past, drawn from what they were best at.
    for (const s of [...S.settlers, S.visitor].filter(Boolean)) {
      if ((s.story || []).some((e) => e.kind === "past")) continue;
      const trade = Object.keys(s.skills).sort((a, b) => s.skills[b] - s.skills[a])[0] || pick(Object.keys(JOBS));
      s.story = [...pastOf(s, trade), ...(s.story || [])];
    }
    return true;
  } catch (e) { return false; }
}

// Saves from before the overworld had a 6×4 grid. It moves to the middle of the land, and the
// town hall goes on the free spot nearest the middle, clearing woods for it if it has to.
function widenLand() {
  const ow = 6, ox = (LAND - ow) >> 1, oy = (LAND - 4) >> 1;
  const at = (i) => (oy + Math.floor(i / ow)) * LAND + ox + i % ow;
  const oldWild = S.wild || S.grid.map((b, i) => !b && (i % ow < 1 || i % ow > 4 || i >= 3 * ow));
  const grid = Array(LAND * LAND).fill(null), wild = Array(LAND * LAND).fill(true), seen = Array(LAND * LAND).fill(false);
  S.grid.forEach((b, i) => { grid[at(i)] = b; wild[at(i)] = !!oldWild[i]; seen[at(i)] = true; });
  for (const s of [...S.settlers, S.visitor].filter(Boolean)) if (s.job != null) s.job = at(s.job);
  Object.assign(S, { grid, wild, seen, cleared: S.cleared || 0 });
  const spot = grid.map((b, i) => i).filter((i) => seen[i] && !grid[i])
    .sort((a, b) => wild[a] - wild[b] || dist(a, MID) - dist(b, MID))[0];
  const k = spot ?? MID;
  grid[k] = { type: "townhall", worker: null, spent: {} };
  wild[k] = false;
  S.hall = k;
  reveal(k, sight());
  newLand = [];
}

// Saves from before the land had kinds only knew wooded or not. What they've seen stays as it
// was; the rest grows from a seed like any new world.
function landFromWild() {
  S.seed ??= rand(2 ** 31);
  S.land = genLand(S.seed).map((t, i) => !S.seen[i] ? t : S.grid[i] || !S.wild[i] ? "meadow" : TERRAIN[t].clear ? t : "forest");
  delete S.wild;
}

// Tools used to be items fitted to a workplace. A fitted one becomes that workplace's level; a
// spare one is melted back into what it cost.
function unTool() {
  const lvlOf = (t) => [0.25, 0.5, 0.8].indexOf(t.yield) + 1;
  const melt = { 1: { ore: 3, wood: 2 }, 2: { silver: 3, wood: 2 }, 3: { starmetal: 2, silver: 2, wood: 2 } };
  for (const b of S.grid) if (b && b.tool) { b.lvl = Math.max(b.lvl || 0, lvlOf(b.tool)); delete b.tool; }
  for (const t of (S.stash || []).filter((g) => g.slot === "tool")) addCost(S.res, melt[lvlOf(t)] || {});
  if (S.stash) S.stash = S.stash.filter((g) => g.slot !== "tool");
}

// A save as text: gzipped JSON in base64, tagged so a pasted code is recognisable. Plain JSON
// (a hand-edited save) is accepted back too.
const CODE_TAG = "mh1:";
const pipe = (bytes, stream) => new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
async function exportSave() {
  save();
  const zipped = new Uint8Array(await pipe(new TextEncoder().encode(localStorage.getItem(SAVE_KEY)), new CompressionStream("gzip")));
  let bin = "";
  for (let i = 0; i < zipped.length; i += 0x8000) bin += String.fromCharCode(...zipped.subarray(i, i + 0x8000));
  return CODE_TAG + btoa(bin);
}
async function importSave(text) {
  text = String(text).trim();
  let json = text;
  if (text.startsWith(CODE_TAG)) {
    const bytes = Uint8Array.from(atob(text.slice(CODE_TAG.length).replace(/\s/g, "")), (c) => c.charCodeAt(0));
    json = new TextDecoder().decode(await pipe(bytes, new DecompressionStream("gzip")));
  }
  const data = JSON.parse(json);
  if (!data.S || !Array.isArray(data.S.settlers) || !Array.isArray(data.S.grid)) throw new Error("not a save");
  const keep = localStorage.getItem(SAVE_KEY);
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  if (!load()) {
    if (keep == null) localStorage.removeItem(SAVE_KEY); else localStorage.setItem(SAVE_KEY, keep);
    load();
    throw new Error("bad save");
  }
}

// ---------- settlement ----------
const has = (tech) => S.research.includes(tech);
const beds = () => S.grid.reduce((a, b) => a + (b ? BUILDINGS[b.type].beds || 0 : 0), 0);
const afford = (cost) => Object.entries(cost).every(([k, v]) => S.res[k] >= v);
const pay = (cost) => Object.entries(cost).forEach(([k, v]) => (S.res[k] -= v));
// Short items read as have/need in red, e.g. "2/6🪵".
const costText = (cost) => Object.entries(cost).map(([k, v]) => S.res[k] >= v ? `${v}${RESOURCES[k].icon}`
  : `<span class="bad">${Math.floor(S.res[k])}/${v}${RESOURCES[k].icon}</span>`).join(" ");
const staffed = (type) => S.grid.some((b) => b && b.type === type && b.worker && available(byId(b.worker)));
const below = (s) => !!S.expedition && S.expedition.party.includes(s.id);
// Away is anywhere but home: down a dungeon, or wandered off after a party.
const away = (s) => below(s) || !!s.wander;
const available = (s) => s && !s.dead && !away(s);

// The keeper's crowns set in the hall ward the land around it. Past the ward, things come up from
// below at night: they hurt whoever's working there, and wreck what's left unwatched.
const claimR = () => 3 + S.claim;
const contested = (i) => dist(i, S.hall ?? MID) > claimR();
function raid() {
  S.grid.forEach((b, i) => {
    if (!b || !contested(i) || !chance(Math.min(0.5, 0.03 * (dist(i, S.hall ?? MID) - claimR())))) return;
    const w = b.worker && byId(b.worker), def = BUILDINGS[b.type];
    if (available(w)) {
      w.hp = Math.max(1, w.hp - Math.ceil(stats(w).hpMax * (0.3 + Math.random() * 0.3)));
      think(w, "raided");
      gameLog(`Something came up in the night at the ${def.name.toLowerCase()}. ${w.name} drove it off.`, "bad", [w]);
    } else {
      if (w) w.job = null;
      S.grid[i] = null;
      gameLog(`Something came up in the night and wrecked the ${def.name.toLowerCase()}.`, "bad", living());
    }
  });
}
// Nights aren't all quiet. What happens grows out of the village itself: grudges, ghosts, pasts,
// full stores. Some of it waits on a choice; left until the next End day, trouble goes the worse
// way and a chance goes by.
const pastHas = (s, text) => (s.story || []).some((e) => e.kind === "past" && e.text === text);
const stock = () => ["food", "wood", "stone", "ore", "herbs"].reduce((a, r) => a + S.res[r], 0);
const hurt = (s, lo, hi) => (s.hp = Math.max(1, s.hp - Math.ceil(stats(s).hpMax * (lo + Math.random() * (hi - lo)))));
// Odds that whoever's home holds the gate against n attackers.
const holds = (n) => {
  const p = living().filter((s) => !away(s)).reduce((a, s) => a + (stats(s).atk + stats(s).def) * s.hp / stats(s).hpMax, 0);
  return p / (p + n * 7 * (1 + S.day / 80));
};
function trouble(home) {
  const t = S.trouble;
  // Wandered off after a party: missed the next day, back a few days later, mostly.
  for (const s of living().filter((o) => o.wander)) {
    if (!s.wander.seen) { s.wander.seen = true; gameLog(`Nobody has seen ${s.name} since the party.`, "bad", [s]); continue; }
    if (S.day < s.wander.back) continue;
    s.wander = null;
    const r = Math.random();
    if (r < 0.1) { leave(s); gameLog(`${s.name} never came back.`, "bad", living()); }
    else if (r < 0.35) { add("relics", 1); gameLog(`${s.name} came back with a relic from who knows where. +1🏺`, "good", [s]); }
    else { hurt(s, 0.1, 0.3); think(s, "hungover"); gameLog(`${s.name} came back, muddy and sore.`, "story", [s]); }
  }
  if (t) settle(t.kind === "fey" ? "no" : "ignore");
  // A grudge comes to blows.
  for (const a of home) {
    const b = home.find((o) => grudge(a, o));
    if (!b || !chance(0.06)) continue;
    brawl(a, b);
    break;
  }
  // Pasts catch up, once each.
  for (const s of home) {
    if (s.caught || !chance(0.01)) continue;
    if (pastHas(s, "Burned down a library.") && S.grid[s.job]?.type === "library") {
      s.caught = true;
      S.grid[s.job] = null; s.job = null;
      S.res.research = Math.floor(S.res.research / 2);
      gameLog(`${s.name} burned down the library. Again.`, "bad", living());
    } else if (pastHas(s, "Fled a wedding.") && !S.visitor) {
      s.caught = true;
      S.visitor = makeSettler();
      S.visitor.heard = [{ about: s.id, death: `jilt${s.id}`, what: [`left ${S.visitor.name} at the altar`, `was right to leave ${S.visitor.name}`], v: -1, hops: 0, until: S.day + 999 }];
      gameLog(`${S.visitor.name} came looking for ${s.name}. Wants to join.`, "story", [s]);
    } else if (pastHas(s, "Fled debts.") && !S.trouble) {
      s.caught = true;
      S.trouble = { kind: "debt", who: s.id, n: 3, take: S.res.silver >= 3 ? { silver: 3 } : { food: 20 } };
      gameLog(`Collectors at the gate for ${s.name}'s debts.`, "bad", [s]);
    }
  }
  // Old trades turn up when they're needed.
  for (const s of home) {
    if (!chance(0.03)) continue;
    const job = S.grid[s.job]?.type, worst = home.filter((o) => o !== s).sort((a, b) => a.hp / stats(a).hpMax - b.hp / stats(b).hpMax)[0];
    if (pastHas(s, "Set bones.") && worst && worst.hp < stats(worst).hpMax * 0.6) {
      worst.hp = stats(worst).hpMax; think(worst, "mended");
      gameLog(`${s.name} set ${worst.name}'s bones.`, "good", [s, worst]);
    } else if (pastHas(s, "Worked harvests.") && job === "farm") { add("food", 10); gameLog(`${s.name} brought in a bumper harvest. +10🍞`, "good", [s]); }
    else if (pastHas(s, "Copied books at a monastery.") && job === "library") { add("research", 3); gameLog(`${s.name} copied out an old text. +3📜`, "good", [s]); }
    else if (pastHas(s, "Mended nets.") && job === "dock") { add("food", 8); gameLog(`${s.name} mended the nets. +8🍞`, "good", [s]); }
    else continue;
    break;
  }
  if (S.trouble) return;
  // Two who get on may want to marry; whether the village throws them a wedding is up to you.
  const free = home.filter((s) => !s.spouse && s.morale >= 60);
  const match = free.flatMap((a) => free.filter((b) => a.id < b.id && !grudge(a, b) && !grudge(b, a)).map((b) => [a, b]));
  if (match.length && chance(0.015)) {
    const [a, b] = pick(match);
    S.trouble = { kind: "wedding", pair: [a.id, b.id], take: { food: 3 * home.length } };
    return gameLog(`${a.name} and ${b.name} want to marry.`, "story", [a, b]);
  }
  // Plenty asks for a feast; a feast softens grudges.
  const plate = 3 * home.length;
  if (home.length > 2 && S.res.food > plate * 4 && chance(0.04)) {
    S.trouble = { kind: "feast", take: { food: plate } };
    return gameLog(`Talk of a feast.`, "story", home);
  }
  // A trader wants the village's biggest pile for something it lacks.
  if (S.day > 8 && chance(0.03)) {
    const big = ["food", "wood", "stone", "herbs"].sort((a, b) => S.res[b] - S.res[a])[0];
    const want = pick(["relics", "ore", "silver", "potions"]);
    if (S.res[big] >= 20) {
      S.trouble = { kind: "trader", take: { [big]: 20 }, give: { [want]: want === "silver" ? 2 : 3 } };
      return gameLog(`A trader at the gate.`, "story");
    }
  }
  // The haunted sometimes shut themselves in the forge and want things for whatever they're making.
  const fey = home.find((s) => haunted(s) && chance(0.03));
  if (fey && S.grid.some((b) => b && b.type === "forge")) {
    S.trouble = { kind: "fey", who: fey.id, take: { relics: 1 + rand(2), [pick(["ore", "herbs", "silver"])]: 3 + rand(3) } };
    return gameLog(`${fey.name} shut the forge door.`, "story", [fey]);
  }
  // Full stores draw bandits.
  if (S.day > 12 && chance(Math.min(0.06, (stock() - 120) / 2500))) {
    const r = ["food", "wood", "stone", "ore", "herbs"].sort((a, b) => S.res[b] - S.res[a])[0];
    S.trouble = { kind: "bandits", n: 2 + Math.floor(stock() / 150), take: { [r]: Math.ceil(S.res[r] / 3) } };
    gameLog(`Bandits at the gate.`, "bad", living());
  }
}
// Gone for good: off the books, out of work, and their ghosts find someone else.
function leave(s) {
  S.settlers = S.settlers.filter((o) => o !== s);
  (S.gone ||= []).push(s);
  S.grid.forEach((b) => { if (b && b.worker === s.id) b.worker = null; });
  s.job = null;
  S.remains.forEach((r) => { if (r.haunts === s.id) r.haunts = null; });
}
function brawl(a, b, lead = "") {
  hurt(a, 0.1, 0.3); hurt(b, 0.15, 0.35);
  think(a, "brawl"); think(b, "brawl");
  // Whoever came off worst after a brawl reaches for a potion, if the village has one.
  const sip = [a, b].filter((o) => o.hp < stats(o).hpMax * 0.5 && S.res.potions > 0 && S.res.potions--);
  sip.forEach((o) => (o.hp = Math.min(stats(o).hpMax, o.hp + 20)));
  gameLog(`${lead}${a.name} went for ${b.name}.${sip.length ? ` ${sip.map((o) => o.name).join(" and ")} drank a potion 🧪.` : ""}`, "bad", [a, b]);
}
// A party rarely goes exactly to plan.
function revel(home, couple = []) {
  if (!chance(0.5)) return;
  const ran = couple.find((s) => pastHas(s, "Fled a wedding."));
  const grudged = home.flatMap((a) => home.filter((b) => grudge(a, b)).map((b) => [a, b]));
  const pair = grudged.length ? pick(grudged) : home.length > 1 ? (() => { const a = pick(home); return [a, pick(home.filter((o) => o !== a))]; })() : null;
  const r = Math.random();
  if (ran && r < 0.3) { think(ran, "fled"); return gameLog(`${ran.name} nearly ran again.`, "story", couple); }
  if (pair && r < 0.45) return brawl(pair[0], pair[1], "Drink ran high. ");
  if (r < 0.65 && home.some((o) => o.heard?.length)) { gameLog(`Tongues loosened.`, "story", home); return gossip(home), gossip(home); }
  if (r < 0.72) { pick(home).wander = { back: S.day + 2 + rand(4) }; return; }
  if (r < 0.8 && !S.visitor) {
    S.visitor = makeSettler();
    return gameLog(`${S.visitor.name} heard the music and wants to join.`, "story");
  }
  if (r < 0.9) { const s = pick(home); hurt(s, 0.1, 0.2); return gameLog(`${s.name} turned an ankle dancing.`, "bad", [s]); }
  const sore = home.filter(() => chance(0.4));
  sore.forEach((s) => think(s, "hungover"));
  if (sore.length) gameLog(`${sore.map((s) => s.name).join(", ")} woke up sore-headed.`, "story", sore);
}
// How trouble ends: "yes" pays or gives, "no" refuses or fights, "ignore" lets it happen.
function settle(how) {
  const t = S.trouble;
  if (!t) return;
  const s = t.who && byId(t.who);
  S.trouble = null;
  const grab = (k) => Object.entries(t.take).forEach(([r, n]) => (S.res[r] = Math.max(0, S.res[r] - n * k)));
  const what = Object.entries(t.take).map(([r, n]) => `${n}${RESOURCES[r].icon}`).join(" ");
  if (t.kind === "wedding") {
    const [a, b] = t.pair.map(byId);
    if (a.dead || b.dead) return;
    // Anyone might run from their own wedding and keep going; someone who did it once, far likelier.
    const ran = [a, b].find((o) => !away(o) && chance(pastHas(o, "Fled a wedding.") ? 0.3 : 0.02));
    if (ran) {
      const left = ran === a ? b : a;
      leave(ran);
      think(left, "jilted");
      (left.heard ||= []).push({ about: ran.id, death: `jilt${ran.id}`, what: [`left ${left.name} at the altar`, `was right to leave ${left.name}`], v: -1, hops: 0, until: fades() });
      return gameLog(`${ran.name} ran from the wedding and didn't come back.`, "bad", [left]);
    }
    a.spouse = b.id; b.spouse = a.id;
    note(a, { text: `Married ${b.name}.` }); note(b, { text: `Married ${a.name}.` });
    think(a, "wed"); think(b, "wed");
    if (how !== "yes" || !afford(t.take)) return gameLog(`${a.name} and ${b.name} married quietly.`, "good", [a, b]);
    pay(t.take);
    const home = living().filter((o) => !away(o));
    home.forEach((o) => think(o, "feast"));
    gameLog(`${a.name} and ${b.name} married. The whole village came. −${what}`, "good", home);
    return revel(home, [a, b]);
  }
  if (t.kind === "feast" || t.kind === "trader") {
    if (how !== "yes" || !afford(t.take)) return t.kind === "trader" && gameLog(`The trader moved on.`);
    pay(t.take);
    if (t.kind === "trader") { addCost(S.res, t.give); return gameLog(`Traded ${what} for ${Object.entries(t.give).map(([r, n]) => `${n}${RESOURCES[r].icon}`).join(" ")}.`, "good"); }
    const home = living().filter((o) => !away(o));
    // Each person at the table lets go of one grudge.
    home.forEach((o) => { think(o, "feast"); const x = (o.heard || []).find((x) => x.v < 0 && !(x.until <= S.day)); if (x) x.until = S.day; });
    gameLog(`Feast. −${what}`, "good", home);
    return revel(home);
  }
  if (t.kind === "fey") {
    if (how === "yes" && afford(t.take) && !s.dead) {
      pay(t.take);
      const ghost = byId(S.remains.find((x) => x.haunts === s.id)?.id ?? s.id), slot = pick(["weapon", "armor"]);
      const k = 2 + Math.floor(S.day / 30);
      const g = slot === "weapon" ? { name: `${ghost.name}'s ${pick(["Lament", "Grief", "Due"])}`, slot, atk: 3 + k, spd: 1 }
        : { name: `${ghost.name}'s ${pick(["Shroud", "Vigil", "Keepsake"])}`, slot, def: 2 + k, hp: 4 * k };
      (S.stash ||= []).push({ ...g, uid: nextId++ });
      think(s, "made");
      return gameLog(`${s.name} came out of the forge with ${g.name}.`, "good", [s]);
    }
    think(s, "snapped");
    const b = S.grid[s.job];
    if (b) { gameLog(`${s.name} smashed the ${BUILDINGS[b.type].name.toLowerCase()}.`, "bad", living()); S.grid[s.job] = null; s.job = null; }
    else gameLog(`${s.name} came out of the forge with nothing.`, "bad", [s]);
    return;
  }
  const who = t.kind === "debt" ? "The collectors" : "The bandits";
  if (how === "yes") { grab(1); return gameLog(`Paid ${what}. ${who} left.`, "bad"); }
  if (how === "ignore") { grab(2); return gameLog(`Nobody went to the gate. ${who} took ${what} twice over.`, "bad", living()); }
  const guard = living().filter((o) => !away(o));
  if (chance(holds(t.n))) {
    guard.forEach((o) => { hurt(o, 0.05, 0.25); gainXp(o, t.n * 3); });
    gameLog(`Drove off ${who.toLowerCase()}.`, "good", guard);
  } else {
    guard.forEach((o) => { hurt(o, 0.3, 0.6); think(o, "neardeath"); });
    grab(2);
    gameLog(`${who} won at the gate and took ${what} twice over.`, "bad", guard);
  }
}
// Work far from any bed is a long walk each way.
const commute = (s) => Math.min(...S.grid.map((b, i) => (b && BUILDINGS[b.type].beds ? dist(i, s.job) : Infinity)));

// Clearing is labour, paid in food; what stood there comes back as materials.
const clearCost = () => ({ food: 6 + 4 * S.cleared });

function clearLand(i) {
  const cost = clearCost(), t = TERRAIN[S.land[i]];
  if (!t.clear || !S.seen[i] || siteAt(i) || !afford(cost)) return;
  pay(cost);
  S.land[i] = "meadow";
  S.cleared++;
  addCost(S.res, t.clear);
  reveal(i, 1);
  gameLog(`Cleared ${t.name.toLowerCase()}. ${gainText(t.clear)}`);
  save();
}
const gainText = (got) => Object.entries(got).map(([k, v]) => `+${v}${RESOURCES[k].icon}`).join(" ");

// Beside the right land a workplace does better, e.g. a farm by water.
const beside = (i, land) => around(i).some((j) => S.land[j] === land);
const besideYields = (i, type) => Object.entries(BESIDE_YIELDS[type] || {})
  .filter(([land]) => beside(i, land)).reduce((all, [, y]) => addCost(all, y), {});
const besideBoost = (i, type) => (BESIDE[type] && around(i).some((j) => BESIDE[type].includes(S.land[j])) ? BESIDE_BOOST : 0);

// Each building remembers what went into it, upgrades included, so demolishing can give some back.
const addCost = (into, cost) => { for (const [k, v] of Object.entries(cost)) into[k] = (into[k] || 0) + v; return into; };

function build(i, type) {
  const b = BUILDINGS[type];
  if (S.grid[i] || S.land[i] !== "meadow" || siteAt(i) || !S.seen[i] || !afford(b.cost) || (b.needs && !has(b.needs))) return;
  if (b.near && !beside(i, b.near)) return;
  // The town hall comes first, and only once.
  if ((S.hall == null) !== (type === "townhall")) return;
  pay(b.cost);
  S.grid[i] = { type, worker: null, spent: { ...b.cost } };
  if (type === "townhall") {
    S.hall = i;
    reveal(i, sight());
    gameLog("Built the town hall.", "story", living());
  } else {
    reveal(i, 1);
    gameLog(`Built ${b.name.toLowerCase()}.`);
  }
  if (type === "graveyard") bury();
  living().filter((s) => !away(s)).forEach((s) => think(s, "built"));
  save();
}

// Rebuild in place as the next tier; whoever works there stays.
function canUpgrade(i) {
  const b = S.grid[i], up = b && BUILDINGS[b.type].up;
  return !!up && (!BUILDINGS[up.to].needs || has(BUILDINGS[up.to].needs)) && afford(up.cost);
}
function upgrade(i) {
  if (!canUpgrade(i)) return;
  const b = S.grid[i], up = BUILDINGS[b.type].up;
  pay(up.cost);
  b.spent = addCost(b.spent || { ...BUILDINGS[b.type].cost }, up.cost);
  b.type = up.to;
  gameLog(`Rebuilt as ${BUILDINGS[b.type].name.toLowerCase()}.`, "good");
  living().filter((s) => !away(s)).forEach((s) => think(s, "built"));
  save();
}

const refundRate = () => (has("reclaim") ? 0.75 : has("salvage") ? 0.5 : 0);
function refundOf(i) {
  const b = S.grid[i], rate = refundRate(), out = {};
  for (const [k, v] of Object.entries(b.spent || BUILDINGS[b.type].cost)) if (Math.floor(v * rate)) out[k] = Math.floor(v * rate);
  return out;
}

function demolish(i) {
  const b = S.grid[i];
  if (!b || b.type === "townhall") return;
  if (b.worker) byId(b.worker).job = null;
  const back = refundOf(i);
  for (const [k, v] of Object.entries(back)) S.res[k] += v;
  S.grid[i] = null;
  const got = Object.entries(back).map(([k, v]) => `+${v}${RESOURCES[k].icon}`).join(" ");
  gameLog(`Demolished ${BUILDINGS[b.type].name.toLowerCase()}.${got ? ` ${got}` : ""}`);
  save();
}

// A workplace's level; what it cost goes into `spent`, so demolishing gives some of it back.
const boostOf = (b) => (b.lvl ? IMPROVE[b.lvl - 1].boost : 0);
function canImprove(i) {
  const b = S.grid[i], next = b && IMPROVABLE(b.type) && IMPROVE[b.lvl || 0];
  return !!next && has(next.needs) && afford(next.cost);
}
function improve(i) {
  if (!canImprove(i)) return;
  const b = S.grid[i], next = IMPROVE[b.lvl || 0];
  pay(next.cost);
  b.spent = addCost(b.spent || { ...BUILDINGS[b.type].cost }, next.cost);
  b.lvl = (b.lvl || 0) + 1;
  gameLog(`Improved the ${BUILDINGS[b.type].name.toLowerCase()}. +${Math.round(next.boost * 100)}%`, "good");
  save();
}

function assign(i, settlerId) {
  const b = S.grid[i];
  if (!b || !BUILDINGS[b.type].job) return;
  if (b.worker) byId(b.worker).job = null;
  b.worker = null;
  const s = settlerId && byId(settlerId);
  if (s) {
    if (s.job != null && S.grid[s.job]) S.grid[s.job].worker = null;
    s.job = i;
    b.worker = s.id;
  }
  save();
}

// Each day without food halves what someone gets done, down to a tenth.
const fedRate = (s) => Math.max(0.1, 0.5 ** (s.unfed || 0));

// Fractional yields bank in S.carry so 0.5 ore a day is really one every other day.
function add(res, n) {
  const t = (S.carry[res] || 0) + n;
  const whole = Math.floor(t);
  S.carry[res] = t - whole;
  S.res[res] += whole;
  return whole;
}

function endDay() {
  const got = {}, spent = {};
  lastYields = [];
  const eaters = living().filter((s) => !away(s)).length;
  S.grid.forEach((b, i) => {
    if (!b || !b.worker) return;
    const s = byId(b.worker), def = BUILDINGS[b.type];
    if (!available(s) || s.hp <= 0) return;
    const here = {};
    const take = (r, n) => { const w = add(r, n); got[r] = (got[r] || 0) + w; if (w) here[r] = w; };
    const skill = s.skills[def.job] || 0;
    const boost = 1 + boostOf(b) + besideBoost(i, b.type);
    const eff = (1 + skill * 0.1) * (s.morale < 30 ? 0.5 : 1) * (haunted(s) ? 0.5 : 1) * fedRate(s) * boost;
    for (const [r, n] of Object.entries(addCost({ ...def.yields }, besideYields(i, b.type)))) take(r, n * eff);
    if (b.type === "library" && S.res.relics > 0) {
      S.res.relics--;
      spent.relics = (spent.relics || 0) + 1;
      take("research", (2 + skill * 0.5) * fedRate(s) * boost);
    }
    if (b.type === "forge" && S.res.stone > 0) {
      S.res.stone--;
      spent.stone = (spent.stone || 0) + 1;
      const k = Math.min(0.85, 0.35 * eff);
      const ore = has("starforging") && chance(k / 8) ? "starmetal" : has("silverwork") && chance(k / 3) ? "silver" : chance(k) ? "ore" : null;
      if (ore) take(ore, 1);
    }
    // The smokehouse only cooks food nobody at home needs today.
    if (b.type === "smokehouse") {
      const spare = Math.floor((S.res.food - eaters) / 3);
      if (spare > 0) {
        let w = add("meals", eff);
        if (w > spare) { S.res.meals -= w - spare; w = spare; }
        S.res.food -= w * 3;
        spent.food = (spent.food || 0) + w * 3;
        got.meals = (got.meals || 0) + w;
        if (w) here.meals = w;
      }
    }
    s.skills[def.job] = +(skill + 0.1).toFixed(1);
    if (Object.keys(here).length) lastYields.push({ i, got: here });
  });

  // Everyone at home eats; the expedition carries its own rations.
  // When there isn't enough, whoever has gone longest without eats first.
  const home = living().filter((s) => !away(s)).sort((a, b) => (b.unfed || 0) - (a.unfed || 0));
  const fed = Math.min(S.res.food, home.length);
  S.res.food -= fed;
  spent.food = (spent.food || 0) + fed;
  const hungry = home.length - fed;
  home.forEach((s, i) => {
    const ate = i < fed;
    if (ate) {
      s.unfed = 0;
      s.morale = clampMorale(s.morale + 2);
      s.hp = Math.min(stats(s).hpMax, s.hp + (staffed("infirmary") ? 9 : 3));
    } else {
      // Hunger wears people down but never kills them.
      s.unfed = (s.unfed || 0) + 1;
      think(s, "hungry");
      s.hp = Math.max(1, s.hp - Math.ceil(stats(s).hpMax * 0.15));
    }
  });
  // The dead they saw fall stay with them until they're buried.
  // The dead with nobody left to haunt pick someone new.
  for (const r of S.remains) {
    if (r.haunts && !byId(r.haunts).dead) continue;
    const l = living();
    r.haunts = l.length ? pick(l).id : null;
    if (r.haunts) gameLog(`${byId(r.id).name} haunts ${byId(r.haunts).name}.`, "bad", [byId(r.haunts)]);
  }
  home.forEach((s) => { if (haunted(s)) think(s, "haunted"); });
  gossip(home);
  // Too many people for the beds wears everyone down.
  if (living().length > beds()) home.forEach((s) => think(s, "rough"));
  home.forEach((s) => { if (s.job != null && commute(s) > 4) think(s, "farwalk"); });
  raid();
  trouble(home);

  gameLog(`${tally(got, spent) || "No change."}${hungry ? ` ${hungry} went hungry.` : ""}`, hungry ? "bad" : "day");

  // A stranger turns up at the gate now and then: never two within a week, rarer when beds are full.
  const since = S.day - (S.lastVisitor ?? -99);
  if (!S.visitor && since >= 7 && chance(living().length < beds() ? 0.12 : 0.05)) {
    S.lastVisitor = S.day;
    S.visitor = makeSettler();
    gameLog(`${S.visitor.name} (${CLASSES[S.visitor.cls].name.toLowerCase()}) wants to join.`, "story");
  }
  S.day++;
}

// "🍞+7−10 (−3)": made, used, and the net when both happened.
const num = (n) => +n.toFixed(1);
function tally(got, spent) {
  return Object.keys(RESOURCES).map((r) => {
    const a = num(got[r] || 0), b = num(spent[r] || 0);
    if (!a && !b) return "";
    const net = num(a - b), sign = (n) => (n < 0 ? `−${-n}` : `+${n}`);
    return RESOURCES[r].icon + (a && b ? `+${a}−${b} (${sign(net)})` : a ? `+${a}` : `−${b}`);
  }).filter(Boolean).join(" ");
}

function passDays(n) { for (let i = 0; i < n; i++) endDay(); save(); }

function welcomeVisitor(yes) {
  const v = S.visitor;
  if (!v) return;
  S.visitor = null;
  if (yes) {
    S.settlers.push(v);
    gameLog(`${v.name} joined.`, "good", living());
  } else gameLog(`${v.name} left.`);
  save();
}

const REPEAT_RESEARCH = ["surveying", "cartography"];
const researchCost = (id) => Math.ceil(RESEARCH[id].cost * (1 + tech(id) * 0.75));
function doResearch(id) {
  const r = RESEARCH[id];
  if (!r || (!REPEAT_RESEARCH.includes(id) && has(id)) || S.res.research < researchCost(id) || (r.after && !has(r.after))) return;
  S.res.research -= researchCost(id);
  S.research.push(id);
  if (S.hall != null) reveal(S.hall, sight());
  gameLog(`Learned ${r.name}.`, "good");
  save();
}

// An improved forge wastes less: each level cuts what crafting and brewing cost.
function forgeCost(cost) {
  const f = S.grid.find((b) => b && b.type === "forge"), k = 1 + (f ? boostOf(f) : 0);
  return Object.fromEntries(Object.entries(cost).map(([r, v]) => [r, Math.max(1, Math.round(v / k))]));
}

function craft(recipeId) {
  const r = RECIPES.find((x) => x.id === recipeId);
  if (!r || !staffed("forge") || !afford(forgeCost(r.cost)) || (r.needs && !has(r.needs))) return;
  pay(forgeCost(r.cost));
  S.stash = S.stash || [];
  const { id, cost, needs, ...item } = r;
  S.stash.push({ ...item, uid: nextId++ });
  gameLog(`Forged: ${r.name}.`);
  save();
}

const POTION_COST = { herbs: 3 };
function brew() {
  if (!has("herbalism") || !staffed("forge") || !afford(forgeCost(POTION_COST))) return;
  pay(forgeCost(POTION_COST));
  S.res.potions++;
  save();
}

function equip(settlerId, uid) {
  const s = byId(settlerId);
  S.stash = S.stash || [];
  const k = S.stash.findIndex((it) => it.uid === uid);
  if (!s || k < 0) return;
  const item = S.stash.splice(k, 1)[0];
  if (s.gear[item.slot]) S.stash.push(s.gear[item.slot]);
  s.gear[item.slot] = item;
  s.hp = Math.min(s.hp, stats(s).hpMax);
  save();
}

function unequip(settlerId, slot) {
  const s = byId(settlerId);
  if (!s || !s.gear[slot]) return;
  (S.stash = S.stash || []).push(s.gear[slot]);
  s.gear[slot] = null;
  s.hp = Math.min(s.hp, stats(s).hpMax);
  save();
}

// ---------- dungeon ----------
const partyMax = () => (has("tactics") ? 4 : 3);
// How many rooms one of each lasts. Plain food goes first; meals are the reserve.
const roomsPer = (kind) => (kind === "meals" ? 3 : 1) + (has("field_rations") ? 1 : 0);
const MEAL_HEAL = 4;

// The site the party is in, and the one waiting for them every third floor.
const siteOf = () => S.sites[S.expedition.site || 0];
function keeper(site, floor) {
  if (site.kind === "mill") return bossFor(floor);
  if (floor % 3) return null;
  return { name: site.boss, icon: SITES[site.kind].boss, hp: 30 + 35 * floor, atk: Math.round(6 + 1.5 * floor), def: 3 + floor / 3, spd: 7, aoeEvery: floor >= 6 ? 3 : 4 };
}
function reached(f) {
  S.deepest = Math.max(S.deepest, f);
  siteOf().deepest = Math.max(siteOf().deepest || 0, f);
}

function genFloor(floor, site) {
  const rooms = {};
  const key = (x, y) => `${x},${y}`;
  let x = rand(MAP), y = MAP - 1;
  const start = key(x, y);
  rooms[start] = { x, y, type: "entrance", seen: true, done: true };
  const target = 10 + rand(4);
  while (Object.keys(rooms).length < target) {
    const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1], [0, -1]]); // leans upward
    x = Math.max(0, Math.min(MAP - 1, x + dx));
    y = Math.max(0, Math.min(MAP - 1, y + dy));
    if (!rooms[key(x, y)]) rooms[key(x, y)] = { x, y, type: null, seen: false, done: false };
  }
  // Stairs go in the room farthest from the entrance.
  const dist = { [start]: 0 }, q = [start];
  while (q.length) {
    const k = q.shift();
    for (const n of neighbours(rooms, k)) if (dist[n] == null) { dist[n] = dist[k] + 1; q.push(n); }
  }
  const far = Object.keys(dist).sort((a, b) => dist[b] - dist[a])[0];
  for (const [k, r] of Object.entries(rooms)) {
    if (r.type) continue;
    if (k === far) { r.type = keeper(site, floor) ? "boss" : "stairs"; continue; }
    const t = Math.random();
    r.type = t < 0.5 ? "fight" : t < 0.65 ? "treasure" : t < 0.8 ? "empty" : t < 0.88 ? "shrine" : "event";
    if (r.type === "event") r.event = pick(EVENTS).id;
  }
  // The dead lie where they fell, in any room but the way in or out.
  const here = S.remains.filter((x) => x.at === "below" && S.sites[x.site] === site && x.floor === floor);
  const spots = Object.keys(rooms).filter((k) => !["entrance", "stairs", "boss"].includes(rooms[k].type));
  for (const x of here) if (spots.length) rooms[spots.splice(rand(spots.length), 1)[0]].body = x.id;
  return { floor, rooms, at: start, from: start };
}

function neighbours(rooms, k) {
  const [x, y] = k.split(",").map(Number);
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => `${x + dx},${y + dy}`).filter((n) => rooms[n]);
}

function depart(partyIds, rations, startFloor, meals = 0, siteIdx = 0) {
  const site = S.sites[siteIdx];
  if (!site || !S.seen[site.i]) return;
  startFloor = Math.max(1, Math.min(startFloor, (site.deepest || 0) + 1));
  const party = partyIds.map(byId).filter(available).slice(0, partyMax());
  if (!party.length || S.expedition) return;
  rations = Math.min(rations, S.res.food);
  S.res.food -= rations;
  meals = Math.min(meals, S.res.meals);
  S.res.meals -= meals;
  // Nobody works at home while they're below.
  party.forEach((s) => {
    s.was = s.job != null && S.grid[s.job] ? { i: s.job, type: S.grid[s.job].type } : null;
    if (s.was) S.grid[s.job].worker = null;
    s.job = null;
  });
  S.expedition = {
    party: party.map((s) => s.id), rations, meals, steps: 0, moves: 0,
    loot: {}, gear: [], site: siteIdx, map: genFloor(startFloor, site), fight: null, event: null,
  };
  party.forEach((s) => { if (party.some((o) => grudge(s, o))) think(s, "grudge"); });
  gameLog(`Set out for ${site.name}: ${party.map((s) => s.name).join(", ")}, ${rations}🍞${meals ? ` ${meals}🥪` : ""}.`, "story", party);
  revealAround();
  save();
}

// A settler's trade is whatever they're best at; it sets what they notice below.
const tradeOf = (s) => Object.keys(s.skills).sort((a, b) => s.skills[b] - s.skills[a])[0];
const lensOf = (s) => LENS[tradeOf(s)] || [];
const partyReads = (type) => partyAlive().some((s) => lensOf(s).includes(type));

function revealAround() {
  const m = S.expedition.map;
  for (const n of neighbours(m.rooms, m.at)) m.rooms[n].seen = true;
}

const partyAlive = () => S.expedition.party.map(byId).filter((s) => !s.dead);

function canMove(k) {
  const e = S.expedition;
  return e && !e.fight && !e.event && neighbours(e.map.rooms, e.map.at).includes(k);
}

const starving = () => !!S.expedition && !S.expedition.rations && !S.expedition.meals;
const foodLeft = () => S.expedition.rations + (S.expedition.meals || 0);

// True when the next step leaves no more food than the walk home eats.
function onlyEnoughHome() {
  const e = S.expedition;
  const kind = e.rations > 0 ? "food" : e.meals > 0 ? "meals" : null;
  const after = foodLeft() - (kind && e.steps + 1 >= roomsPer(kind) ? 1 : 0);
  return after <= homeFood();
}

function move(k) {
  const e = S.expedition;
  if (!canMove(k)) return;
  e.homing = false; // a reloaded ambush left behind: walking on means not going home yet
  delete e.up;
  e.map.from = e.map.at;
  e.map.at = k;
  e.moves++;
  const kind = e.rations > 0 ? "food" : e.meals > 0 ? "meals" : null;
  if (++e.steps >= roomsPer(kind)) {
    e.steps = 0;
    if (kind === "food") e.rations--;
    else if (kind === "meals") {
      e.meals--;
      partyAlive().forEach((s) => (s.hp = Math.min(stats(s).hpMax, s.hp + MEAL_HEAL)));
    }
    if (kind && !e.rations && !e.meals) gameLog("Out of food. The party is starving.", "bad", partyAlive());
  }
  // With nothing to eat, every room costs blood, and they fight at half strength.
  if (!kind) partyAlive().forEach((s) => {
    s.hp = Math.max(1, s.hp - Math.ceil(stats(s).hpMax * 0.15));
    think(s, "starving");
  });
  revealAround();
  const r = e.map.rooms[k];
  if (r.body) {
    const x = S.remains.find((y) => y.id === r.body);
    if (x) x.at = "carried";
    gameLog(`Floor ${e.map.floor}: found ${byId(r.body).name}'s remains.`, "story", partyAlive());
    delete r.body;
  }
  enterRoom();
  save();
}

function enterRoom() {
  const e = S.expedition, r = e.map.rooms[e.map.at], f = e.map.floor;
  if (r.done) return;
  if (r.type === "fight") return startFight(rollEnemies(f));
  if (r.type === "boss") return startFight([scaleEnemy(keeper(siteOf(), f), f, true)]);
  if (r.type === "event") { e.event = r.event; return; }
  r.done = true;
  if (r.type === "treasure") {
    const got = lootRoll(f, 2);
    gameLog(`Floor ${f}: stash. ${got}`, "good", partyAlive());
  } else if (r.type === "shrine") {
    partyAlive().forEach((s) => (s.hp = Math.min(stats(s).hpMax, s.hp + Math.ceil(stats(s).hpMax * 0.4))));
    gameLog(`Floor ${f}: shrine. Party healed.`, "good", partyAlive());
  } else if (r.type === "stairs") {
    reached(f);
    gameLog(`Floor ${f}: stairs down.`, "story", partyAlive());
  }
}

// Danger climbs steadily, then past floor ten it compounds: there's always a floor too deep.
const grim = (floor) => Math.max(1, 1.15 ** (floor - 1) / (1 + 0.3 * (floor - 1)));
function scaleEnemy(base, floor, boss = false) {
  const k = (boss ? 1 : 1 + 0.3 * (floor - 1)) * grim(floor);
  const hp = Math.round(base.hp * k);
  return {
    name: base.name, icon: base.icon, flying: !!base.flying, ranged: !!base.ranged, aoeEvery: base.aoeEvery || 0, boss,
    hpMax: hp, hp,
    atk: Math.round(base.atk * k), def: Math.round(base.def + (boss ? 0 : (floor - 1) / 3)), spd: base.spd,
  };
}

function rollEnemies(floor) {
  const foes = SITES[siteOf().kind].foes;
  const pool = Object.entries(ENEMIES).filter(([k, e]) => e.from <= floor && foes.includes(k)).map(([, e]) => e);
  const n = Math.min(5, 1 + rand(2) + Math.floor(floor / 2));
  return Array.from({ length: n }, () => scaleEnemy(pick(pool), floor));
}

function lootRoll(floor, rolls) {
  const e = S.expedition, found = [];
  for (let i = 0; i < rolls; i++) {
    // Deeper floors add their own ores to the pool, and they turn up often once reached.
    const deep = Object.keys(ORE_FLOOR).filter((k) => floor >= ORE_FLOOR[k]);
    const r = pick(["ore", "ore", "herbs", "relics", "stone", "wood", ...deep, ...deep, ...SITES[siteOf().kind].loot]);
    const n = ORE_FLOOR[r] ? 1 + rand(1 + Math.floor((floor - ORE_FLOOR[r]) / 2)) : 1 + rand(1 + Math.ceil(floor / 2));
    e.loot[r] = (e.loot[r] || 0) + n;
    found.push(`+${n}${RESOURCES[r].icon}`);
  }
  if (chance(0.12 + floor * 0.03)) {
    const g = { ...pick(LOOT_GEAR), uid: nextId++ };
    const bump = Math.floor(floor / 3);
    if (g.atk) g.atk += bump;
    if (g.def) g.def += bump;
    if (bump) g.name += ` +${bump}`;
    e.gear.push(g);
    found.push(g.name);
  }
  return found.join(" ");
}

function resolveEvent(act) {
  const e = S.expedition, r = e.map.rooms[e.map.at], f = e.map.floor;
  e.event = null;
  r.done = true;
  const party = partyAlive();
  if (act === "recruit") {
    const s = makeSettler();
    s.hp = Math.ceil(s.hpMax / 2);
    S.settlers.push(s);
    gameLog(`${s.name} (${CLASSES[s.cls].name.toLowerCase()}) joined.`, "good", [s, ...party]);
  } else if (act === "altar") {
    party.forEach((s) => (s.hp = Math.max(1, s.hp - 5)));
    if (chance(0.6)) {
      const n = 2 + rand(2);
      e.loot.relics = (e.loot.relics || 0) + n;
      gameLog(`Altar: +${n}🏺.`, "good", party);
    } else gameLog("Altar: nothing.", "bad", party);
  } else if (act === "cart") {
    if (chance(0.35)) { gameLog("Cart: ambush!", "bad", party); return startFight(rollEnemies(f)); }
    const ore = f >= ORE_FLOOR.silver && chance(0.5) ? "silver" : "ore";
    const n = 2 + rand(3);
    e.loot[ore] = (e.loot[ore] || 0) + n;
    gameLog(`Cart: +${n}${RESOURCES[ore].icon}.`, "good", party);
  } else if (act === "mushrooms") {
    e.loot.herbs = (e.loot.herbs || 0) + 3;
    if (chance(0.3)) { const s = pick(party); s.hp = Math.max(1, s.hp - 6); gameLog(`Mushrooms: +3🌿. ${s.name} poisoned, −6 HP.`, "bad", party); }
    else gameLog("Mushrooms: +3🌿.", "good", party);
  } else if (act === "marker") {
    e.loot.relics = (e.loot.relics || 0) + 1;
    gameLog("Carving: +1🏺.", "story", party);
  }
  save();
}

// Fights live in combat.js; these are the hand-offs either side.
function startFight(enemies) {
  S.expedition.fight = newFight(partyAlive(), enemies);
}

function endFight(won) {
  const e = S.expedition, f = e.map.floor, r = e.map.rooms[e.map.at];
  const fight = e.fight;
  e.fight = null;
  const fell = [];
  for (const u of fight.heroes) {
    const s = byId(u.id);
    s.hp = Math.max(0, Math.round(u.hp));
    if (s.hp <= 0 && !s.dead) {
      s.dead = true;
      fell.push(s.id);
      S.remains.push({ id: s.id, site: e.site, floor: f, at: "below" });
      gameLog(`${s.name} died on floor ${f}.`, "bad", [s, ...living()]);
      living().forEach((o) => think(o, "grief"));
    }
  }
  // Each of the fallen picks one who watched to haunt until they're buried.
  for (const id of fell) {
    const r = S.remains.find((x) => x.id === id), seen = partyAlive();
    r.haunts = seen.length ? pick(seen).id : null;
    if (r.haunts) gameLog(`${byId(id).name} haunts ${byId(r.haunts).name}.`, "bad", [byId(r.haunts)]);
    const rowOf = (sid) => fight.heroes.find((u) => u.id === sid).row;
    blameDeath(byId(id), partyAlive(), (s) => rowOf(s.id) === rowOf(id));
  }
  if (!partyAlive().length) {
    S.remains.forEach((r) => { if (r.at === "carried") r.at = "below"; });
    gameLog("Party wiped out. All loot lost.", "bad", living());
    S.expedition = null;
    passDays(1);
    return;
  }
  // Walking out of a fight on almost nothing stays with you.
  partyAlive().forEach((s) => { if (s.hp < stats(s).hpMax * 0.3) think(s, "neardeath"); });
  // Running with the crown can drop it; whoever carried it takes the blame.
  if (won === "fled" && e.crown && chance(0.5)) {
    const by = partyAlive().find((s) => s.id === e.crownBy) || pick(partyAlive());
    e.crown = null;
    gameLog(`${by.name} dropped the keeper's crown 👑 running.`, "bad", partyAlive());
    for (const w of partyAlive()) if (w !== by) (w.heard ||= []).push({ about: by.id, death: `crown${S.day}`, crown: true, v: -1, hops: 0, until: fades() });
  }
  if (e.homing) {
    if (won === "fled") partyAlive().forEach((s) => think(s, "fled"));
    else partyAlive().forEach((s) => gainXp(s, fight.enemies.length * 3));
    return returnHome();
  }
  if (won === "fled") {
    partyAlive().forEach((s) => think(s, "fled"));
    e.map.at = e.map.from;
    gameLog("Party fled.", "bad", partyAlive());
  } else {
    r.done = true;
    const xp = fight.enemies.reduce((a, en) => a + (en.boss ? 20 : 3), 0) + f;
    partyAlive().forEach((s) => gainXp(s, xp));
    const got = lootRoll(f, fight.enemies.some((x) => x.boss) ? 5 : 1);
    gameLog(`Floor ${f}: won. ${got}`, "good", partyAlive());
    if (r.type === "boss") {
      reached(f);
      partyAlive().forEach((s) => think(s, "victory"));
      gameLog(`Floor ${f}: boss down. Stairs open.`, "story", partyAlive());
      if (f >= crownFloor() && !(e.crown >= f)) {
        e.crown = f;
        e.crownBy = pick(partyAlive()).id;
        gameLog(`Floor ${f}: took the keeper's crown 👑.`, "good", partyAlive());
      }
    }
  }
  save();
}

// Rooms left alone are where things wait for the way back up.
const untouched = (m) => Object.values(m.rooms).filter((r) => !r.done).length;
function descend() {
  const e = S.expedition, r = e.map.rooms[e.map.at];
  if (!e || e.fight || !["stairs", "boss"].includes(r.type) || !r.done) return;
  (e.left ||= {})[e.map.floor] = untouched(e.map);
  // Each floor cleared is a day in town.
  passDays(1);
  e.map = genFloor(e.map.floor + 1, siteOf());
  revealAround();
  gameLog(`Down to floor ${e.map.floor}.`, "story", partyAlive());
  save();
}

// Each crown carried home widens the ward by a ring; the next one has to come from three floors deeper.
const crownFloor = () => 3 * (S.claim + 1);

// Returning climbs back through the dungeon; fractional half-days do not tick town time.
const homeDays = () => Math.floor(travelDays(siteOf()) + S.expedition.map.floor * 0.5);
const homeFood = () => homeDays() * partyAlive().length;
function returnHome() {
  const e = S.expedition;
  if (!e || e.fight || e.event) return;
  // Climbing back, each floor rolls once for an ambush: more for every room left unexplored.
  e.up ??= Object.entries({ ...e.left, [e.map.floor]: untouched(e.map) });
  while (e.up.length) {
    const [f, n] = e.up.pop();
    if (!chance(1 - 0.93 ** n)) continue;
    e.homing = true;
    gameLog(`Floor ${f}: ambushed on the way up.`, "bad", partyAlive());
    return startFight(rollEnemies(+f));
  }
  const days = homeDays(), party = partyAlive();
  // The road home eats one packed ration per person per day; short days cost blood.
  const need = homeFood(), eat = Math.min(e.rations, need), eatMeals = Math.min(e.meals || 0, need - eat), short = need - eat - eatMeals;
  const foodBack = e.rations - eat, mealsBack = (e.meals || 0) - eatMeals;
  if (short) party.forEach((s) => (s.hp = Math.max(1, s.hp - Math.ceil(stats(s).hpMax * 0.15 * Math.ceil(short / Math.max(1, party.length))))));
  passDays(days);
  S.res.food += foodBack;
  S.res.meals += mealsBack;
  const brought = Object.entries(e.loot).filter(([, n]) => n).map(([r, n]) => { S.res[r] += n; return `${n}${RESOURCES[r].icon}`; });
  S.stash = (S.stash || []).concat(e.gear);
  if (foodBack) brought.push(`${foodBack}🍞`);
  if (mealsBack) brought.push(`${mealsBack}🥪`);
  S.expedition = null;
  if (e.crown) {
    S.claim++;
    gameLog(`Set the keeper's crown 👑 in the hall. The ward reaches further.`, "good", living());
  }
  living().forEach((s) => think(s, "home"));
  gameLog(`Home after ${days}d: ${[...brought, ...e.gear.map((g) => g.name)].join(" ") || "nothing"}.${short ? ` ${short} rations short.` : ""}`, short ? "bad" : "story", party);
  S.remains.forEach((r) => { if (r.at === "carried") r.at = "home"; });
  bury();
  if (has("rosters")) backToWork(party);
  save();
}

// Remains brought home go into the graveyard, if there is one, and stop haunting those who saw.
function bury() {
  if (!S.grid.some((b) => b && b.type === "graveyard")) return;
  const home = S.remains.filter((r) => r.at === "home");
  if (!home.length) return;
  S.remains = S.remains.filter((r) => r.at !== "home");
  const ids = home.map((r) => r.id);
  ids.forEach((id) => (byId(id).buried = true));
  S.settlers.forEach((s) => s.heard && (s.heard = s.heard.filter((x) => !ids.includes(x.death))));
  gameLog(`Buried ${ids.map((id) => byId(id).name).join(", ")}.`, "story", [...ids.map(byId), ...living()]);
}

// With rosters, people go back to the job they left if it's still there and still open.
function backToWork(party) {
  for (const s of party) {
    const w = s.was, b = w && S.grid[w.i];
    s.was = null;
    if (s.dead || s.job != null || !b || b.type !== w.type || b.worker) continue;
    s.job = w.i;
    b.worker = s.id;
  }
  save();
}

function usePotion(heroIdx) {
  const f = S.expedition && S.expedition.fight;
  const u = f && f.heroes[heroIdx];
  if (!u || u.hp <= 0 || S.res.potions <= 0) return;
  S.res.potions--;
  u.hp = Math.min(u.hpMax, u.hp + 20);
  f.fx.push({ t: "heal", to: u, n: 20 });
  fightLog(f, `${u.name} drinks a potion.`);
}
