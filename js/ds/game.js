// Millhollow — game state and rules. No DOM in here: ui.js reads and calls.

const SAVE_KEY = "millhollow-ds-v1";
const LAND = 17; // the overworld is LAND×LAND, mostly unseen at first
const MID = (LAND >> 1) * LAND + (LAND >> 1);
const MAP = 5; // dungeon floors are MAP×MAP

const rand = (n) => Math.floor(Math.random() * n);
const pick = (xs) => xs[rand(xs.length)];
const chance = (p) => Math.random() < p;

let S; // the whole game
let lastYields = []; // what each tile made on the most recent day, for ui.js to show

// ---------- log ----------
// `who` are the people it happened to or around; each keeps the line in their own story.
function log(text, kind = "", who = []) {
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
  return {
    hpMax: s.hpMax + sum("hp"),
    atk: c.atk + Math.floor((s.level - 1) * 1.2) + sum("atk"),
    def: c.def + Math.floor((s.level - 1) / 2) + sum("def"),
    spd: c.spd + sum("spd"),
  };
}

// ---------- thoughts ----------
// Things that just happened to someone. Each moves morale once, when it lands; while it's fresh
// it also sets the face, strongest feeling first and the newest breaking ties.
const THOUGHTS = {
  hungry:    { name: "Hungry", icon: "🍽", mood: "angry", morale: -12, days: 2 },
  starving:  { name: "Starving", icon: "🍽", mood: "angry", morale: -3, days: 1 },
  rough:     { name: "No bed", icon: "🛏", mood: "angry", morale: -4, days: 1 },
  grief:     { name: "Grieving", icon: "🪦", mood: "sad", morale: -10, days: 4 },
  neardeath: { name: "Nearly died", icon: "💔", mood: "scared", morale: -6, days: 2 },
  fled:      { name: "Fled", icon: "👣", mood: "scared", morale: -4, days: 1 },
  victory:   { name: "Slew a boss", icon: "🏆", mood: "happy", morale: 8, days: 3 },
  home:      { name: "Home again", icon: "🏘", mood: "happy", morale: 5, days: 2 },
  levelup:   { name: "Grew stronger", icon: "⭐", mood: "happy", morale: 5, days: 2 },
  built:     { name: "The village grows", icon: "🔨", mood: "happy", morale: 3, days: 1 },
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
  if (s.dead) return "sad";
  if (s.hp < st.hpMax * 0.3) return "scared";
  const f = feeling(s);
  if (f) return THOUGHTS[f.k].mood;
  if (s.morale < 30) return "angry";
  if (s.hp < st.hpMax * 0.7) return "sad";
  return s.morale >= 75 ? "happy" : "neutral";
}
const faceSrc = (s) => `assets/face-${s.face}-${s.age}-${mood(s)}.webp`;
const living = () => S.settlers.filter((s) => !s.dead);
const byId = (id) => S.settlers.find((s) => s.id === id);

function gainXp(s, n) {
  s.xp += n;
  while (s.xp >= s.level * 15) {
    s.xp -= s.level * 15;
    s.level++;
    s.hpMax += 4;
    s.hp += 4;
    log(`${s.name} is now level ${s.level}.`, "good", [s]);
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

// Smooth noise over the land: random heights on a coarse lattice, eased between.
function noise(rng, step) {
  const n = Math.ceil(LAND / step) + 2, lat = Array.from({ length: n * n }, rng);
  const ease = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const gx = x / step, gy = y / step, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = ease(gx - x0), ty = ease(gy - y0);
    const at = (a, b) => lat[b * n + a];
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx, bot = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
    return top + (bot - top) * ty;
  };
}

// Hills and mountains where it's high, lakes where it's low, woods where it's wet, one river
// across, a few ruins, and open meadow around the middle where the settlers stop.
function genLand(seed) {
  const rng = seeded(seed);
  const h1 = noise(rng, 6), h2 = noise(rng, 3), m1 = noise(rng, 5), m2 = noise(rng, 2.5);
  const [cx, cy] = xy(MID);
  const land = Array.from({ length: LAND * LAND }, (_, i) => {
    const [x, y] = xy(i), d = dist(i, MID);
    const h = 0.65 * h1(x, y) + 0.35 * h2(x, y), m = 0.6 * m1(x, y) + 0.4 * m2(x, y);
    if (d <= 1) return "meadow";
    if (h > 0.72 && d > 2) return "mountain";
    if (h > 0.62) return "hills";
    if (h < 0.21 && d > 2) return "water";
    return m > 0.45 ? "forest" : "meadow";
  });
  // The river runs edge to edge, never through the clearing.
  const across = rng() < 0.5, side = rng() < 0.5 ? -1 : 1;
  let r = (across ? cx : cy) + side * (2 + Math.floor(rng() * 4));
  const put = (a, b) => { const i = across ? b * LAND + a : a * LAND + b; if (dist(i, MID) > 1) land[i] = "water"; };
  for (let t = 0; t < LAND; t++) {
    put(r, t);
    const was = r;
    r += Math.floor(rng() * 3) - 1;
    r = Math.max(0, Math.min(LAND - 1, r));
    if (Math.abs(r - (across ? cx : cy)) < 2 && Math.abs(t - (across ? cy : cx)) < 3) r = was;
    if (r !== was) put(r, t);
  }
  for (let k = 0; k < 3; k++) {
    const spots = land.map((_, i) => i).filter((i) => dist(i, MID) >= 3 && ["meadow", "forest", "hills"].includes(land[i]));
    land[spots[Math.floor(rng() * spots.length)]] = "ruins";
  }
  return land;
}
// The mill sits by the clearing; the other sites lie further out, each on its own kind of land,
// named by the world's seed.
function genSites(seed, land, grid = []) {
  const rng = seeded(seed ^ 0x5173), pickR = (xs) => xs[Math.floor(rng() * xs.length)];
  const all = land.map((_, j) => j), sites = [];
  const free = (j) => !grid[j] && land[j] !== "water" && land[j] !== "mountain" && sites.every((s) => dist(s.i, j) >= 3);
  const millAt = all.filter((j) => !grid[j] && land[j] === "meadow" && dist(j, MID) >= 1 && dist(j, MID) <= 2).sort((a, b) => dist(a, MID) - dist(b, MID));
  sites.push({ kind: "mill", i: millAt.length ? pickR(millAt.filter((j) => dist(j, MID) === dist(millAt[0], MID))) : MID + 1, name: SITES.mill.name, deepest: 0 });
  for (const kind of ["barrow", "mine", "thornwood", "shrine"]) {
    const d = SITES[kind], out = (j) => dist(j, MID) >= 3 && dist(j, MID) <= 6 && free(j);
    const fits = all.filter((j) => out(j) && d.on.includes(land[j]) && (!d.by || around(j).some((k) => d.by.includes(land[k]))));
    const i = pickR(fits.length ? fits : all.filter(out));
    const who = () => makeName(rng() < 0.5 ? "f" : "m", new Set(), rng);
    const name = rng() < 0.5 ? `${who()}'s ${pickR(d.nouns)}` : `The ${pickR(d.adj)} ${pickR(d.nouns)}`;
    sites.push({ kind, i, name, boss: `${who()} the ${pickR(d.epithet)}`, deepest: 0 });
  }
  return sites;
}
const siteAt = (i) => S.sites.find((s) => s.i === i);
// Walking out to a site and back takes days, a day for every three tiles each way.
const travelDays = (site) => (site.kind === "mill" ? 0 : 2 * Math.ceil(dist(site.i, S.hall ?? MID) / 3));

// How far from the town hall the land is known. Seen land stays seen.
const sight = () => 2 + has("scouting") + has("surveying") + 2 * has("cartography");
let newLand = []; // tiles just revealed, for ui.js to fade in
function reveal(at, r) {
  S.seen.forEach((v, i) => { if (!v && dist(i, at) <= r) { S.seen[i] = true; newLand.push(i); } });
}

function newGame() {
  S = {
    day: 1, res: { food: 20, wood: 12, stone: 4, ore: 0, herbs: 0, relics: 0, research: 0, potions: 0, meals: 0, silver: 0, starmetal: 0 },
    seed: rand(2 ** 31), carry: {}, grid: Array(LAND * LAND).fill(null), seen: Array(LAND * LAND).fill(false), hall: null, cleared: 0, settlers: [], research: [],
    deepest: 0, visitor: null, expedition: null, log: [],
  };
  S.land = genLand(S.seed);
  S.sites = genSites(S.seed, S.land);
  nextId = 1;
  for (const c of ["warrior", "ranger", "cleric", "mystic"]) S.settlers.push(makeSettler(c));
  reveal(MID, 2);
  newLand = [];
  log(`Arrived: ${S.settlers.map((s) => s.name).join(", ")}.`, "story", S.settlers);
  save();
}

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S, nextId })); } catch (e) { } }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    ({ S, nextId } = JSON.parse(raw));
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
const away = (s) => S.expedition && S.expedition.party.includes(s.id);
const available = (s) => s && !s.dead && !away(s);

// Clearing is labour, paid in food; what stood there comes back as materials.
const clearCost = () => ({ food: 6 + 4 * S.cleared });

function clearLand(i) {
  const cost = clearCost(), t = TERRAIN[S.land[i]];
  if (!t.clear || !S.seen[i] || siteAt(i) || !afford(cost)) return;
  pay(cost);
  S.land[i] = "meadow";
  S.cleared++;
  addCost(S.res, t.clear);
  log(`Cleared ${t.name.toLowerCase()}. ${gainText(t.clear)}`);
  save();
}
const gainText = (got) => Object.entries(got).map(([k, v]) => `+${v}${RESOURCES[k].icon}`).join(" ");

// Beside the right land a workplace does better, e.g. a farm by water.
const besideBoost = (i, type) => (BESIDE[type] && around(i).some((j) => BESIDE[type].includes(S.land[j])) ? BESIDE_BOOST : 0);

// Each building remembers what went into it, upgrades included, so demolishing can give some back.
const addCost = (into, cost) => { for (const [k, v] of Object.entries(cost)) into[k] = (into[k] || 0) + v; return into; };

function build(i, type) {
  const b = BUILDINGS[type];
  if (S.grid[i] || S.land[i] !== "meadow" || siteAt(i) || !S.seen[i] || !afford(b.cost) || (b.needs && !has(b.needs))) return;
  // The town hall comes first, and only once.
  if ((S.hall == null) !== (type === "townhall")) return;
  pay(b.cost);
  S.grid[i] = { type, worker: null, spent: { ...b.cost } };
  if (type === "townhall") {
    S.hall = i;
    reveal(i, sight());
    log("Built the town hall.", "story", living());
  } else log(`Built ${b.name.toLowerCase()}.`);
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
  log(`Rebuilt as ${BUILDINGS[b.type].name.toLowerCase()}.`, "good");
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
  log(`Demolished ${BUILDINGS[b.type].name.toLowerCase()}.${got ? ` ${got}` : ""}`);
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
  log(`Improved the ${BUILDINGS[b.type].name.toLowerCase()}. +${Math.round(next.boost * 100)}%`, "good");
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
    const eff = (1 + skill * 0.1) * (s.morale < 30 ? 0.5 : 1) * boost;
    for (const [r, n] of Object.entries(def.yields || {})) take(r, n * eff);
    if (b.type === "library" && S.res.relics > 0) {
      S.res.relics--;
      spent.relics = (spent.relics || 0) + 1;
      take("research", (2 + skill * 0.5) * boost);
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
  const home = living().filter((s) => !away(s));
  const fed = Math.min(S.res.food, home.length);
  S.res.food -= fed;
  spent.food = (spent.food || 0) + fed;
  const hungry = home.length - fed;
  home.forEach((s, i) => {
    const ate = i < fed;
    if (ate) s.morale = clampMorale(s.morale + 2);
    else think(s, "hungry");
    const heal = !ate ? 0 : staffed("infirmary") ? 9 : 3;
    s.hp = Math.min(stats(s).hpMax, s.hp + heal);
  });
  // Too many people for the beds wears everyone down.
  if (living().length > beds()) home.forEach((s) => think(s, "rough"));

  log(`${tally(got, spent) || "No change."}${hungry ? ` ${hungry} went hungry.` : ""}`, hungry ? "bad" : "day");

  // A stranger turns up at the gate now and then: never two within a week, rarer when beds are full.
  const since = S.day - (S.lastVisitor ?? -99);
  if (!S.visitor && since >= 7 && chance(living().length < beds() ? 0.12 : 0.05)) {
    S.lastVisitor = S.day;
    S.visitor = makeSettler();
    log(`${S.visitor.name} (${CLASSES[S.visitor.cls].name.toLowerCase()}) wants to join.`, "story");
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
    log(`${v.name} joined.`, "good", living());
  } else log(`${v.name} left.`);
  save();
}

function doResearch(id) {
  const r = RESEARCH[id];
  if (has(id) || S.res.research < r.cost || (r.after && !has(r.after))) return;
  S.res.research -= r.cost;
  S.research.push(id);
  if (S.hall != null) reveal(S.hall, sight());
  log(`Learned ${r.name}.`, "good");
  save();
}

function craft(recipeId) {
  const r = RECIPES.find((x) => x.id === recipeId);
  if (!r || !staffed("forge") || !afford(r.cost) || (r.needs && !has(r.needs))) return;
  pay(r.cost);
  S.stash = S.stash || [];
  const { id, cost, needs, ...item } = r;
  S.stash.push({ ...item, uid: nextId++ });
  log(`Forged: ${r.name}.`);
  save();
}

function brew() {
  if (!has("herbalism") || !staffed("forge") || S.res.herbs < 3) return;
  S.res.herbs -= 3;
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
  party.forEach((s) => { if (s.job != null && S.grid[s.job]) S.grid[s.job].worker = null; s.job = null; });
  S.expedition = {
    party: party.map((s) => s.id), rations, meals, steps: 0, moves: 0,
    loot: {}, gear: [], site: siteIdx, map: genFloor(startFloor, site), fight: null, event: null,
  };
  log(`Set out for ${site.name}: ${party.map((s) => s.name).join(", ")}, ${rations}🍞${meals ? ` ${meals}🥪` : ""}.`, "story", party);
  revealAround();
  save();
}

function revealAround() {
  const m = S.expedition.map;
  for (const n of neighbours(m.rooms, m.at)) m.rooms[n].seen = true;
}

const partyAlive = () => S.expedition.party.map(byId).filter((s) => !s.dead);

function canMove(k) {
  const e = S.expedition;
  return e && !e.fight && !e.event && neighbours(e.map.rooms, e.map.at).includes(k);
}

function move(k) {
  const e = S.expedition;
  if (!canMove(k)) return;
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
    } else partyAlive().forEach((s) => {
      s.hp = Math.max(1, s.hp - 3);
      think(s, "starving");
    });
    if (kind && !e.rations && !e.meals) log("Out of food. The party is starving.", "bad", partyAlive());
  }
  revealAround();
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
    log(`Floor ${f}: stash. ${got}`, "good", partyAlive());
  } else if (r.type === "shrine") {
    partyAlive().forEach((s) => (s.hp = Math.min(stats(s).hpMax, s.hp + Math.ceil(stats(s).hpMax * 0.4))));
    log(`Floor ${f}: shrine. Party healed.`, "good", partyAlive());
  } else if (r.type === "stairs") {
    reached(f);
    log(`Floor ${f}: stairs down.`, "story", partyAlive());
  }
}

function scaleEnemy(base, floor, boss = false) {
  const k = boss ? 1 : 1 + 0.3 * (floor - 1);
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
    log(`${s.name} (${CLASSES[s.cls].name.toLowerCase()}) joined.`, "good", [s, ...party]);
  } else if (act === "altar") {
    party.forEach((s) => (s.hp = Math.max(1, s.hp - 5)));
    if (chance(0.6)) {
      const n = 2 + rand(2);
      e.loot.relics = (e.loot.relics || 0) + n;
      log(`Altar: +${n}🏺.`, "good", party);
    } else log("Altar: nothing.", "bad", party);
  } else if (act === "cart") {
    if (chance(0.35)) { log("Cart: ambush!", "bad", party); return startFight(rollEnemies(f)); }
    const ore = f >= ORE_FLOOR.silver && chance(0.5) ? "silver" : "ore";
    const n = 2 + rand(3);
    e.loot[ore] = (e.loot[ore] || 0) + n;
    log(`Cart: +${n}${RESOURCES[ore].icon}.`, "good", party);
  } else if (act === "mushrooms") {
    e.loot.herbs = (e.loot.herbs || 0) + 3;
    if (chance(0.3)) { const s = pick(party); s.hp = Math.max(1, s.hp - 6); log(`Mushrooms: +3🌿. ${s.name} poisoned, −6 HP.`, "bad", party); }
    else log("Mushrooms: +3🌿.", "good", party);
  } else if (act === "marker") {
    e.loot.relics = (e.loot.relics || 0) + 1;
    log("Carving: +1🏺.", "story", party);
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
  for (const u of fight.heroes) {
    const s = byId(u.id);
    s.hp = Math.max(0, Math.round(u.hp));
    if (s.hp <= 0 && !s.dead) {
      s.dead = true;
      log(`${s.name} died on floor ${f}.`, "bad", [s, ...living()]);
      living().forEach((o) => think(o, "grief"));
    }
  }
  if (!partyAlive().length) {
    log("Party wiped out. All loot lost.", "bad", living());
    S.expedition = null;
    passDays(1);
    return;
  }
  // Walking out of a fight on almost nothing stays with you.
  partyAlive().forEach((s) => { if (s.hp < stats(s).hpMax * 0.3) think(s, "neardeath"); });
  if (won === "fled") {
    partyAlive().forEach((s) => think(s, "fled"));
    e.map.at = e.map.from;
    log("Party fled.", "bad", partyAlive());
  } else {
    r.done = true;
    const xp = fight.enemies.reduce((a, en) => a + (en.boss ? 20 : 3), 0) + f;
    partyAlive().forEach((s) => gainXp(s, xp));
    const got = lootRoll(f, fight.enemies.some((x) => x.boss) ? 5 : 1);
    log(`Floor ${f}: won. ${got}`, "good", partyAlive());
    if (r.type === "boss") {
      reached(f);
      partyAlive().forEach((s) => think(s, "victory"));
      log(`Floor ${f}: boss down. Stairs open.`, "story", partyAlive());
    }
  }
  save();
}

function descend() {
  const e = S.expedition, r = e.map.rooms[e.map.at];
  if (!e || e.fight || !["stairs", "boss"].includes(r.type) || !r.done) return;
  e.map = genFloor(e.map.floor + 1, siteOf());
  revealAround();
  log(`Down to floor ${e.map.floor}.`, "story", partyAlive());
  save();
}

const homeDays = () => Math.max(1, Math.ceil(S.expedition.moves / 5)) + travelDays(siteOf());
function returnHome() {
  const e = S.expedition;
  if (!e || e.fight || e.event) return;
  const days = homeDays(), party = partyAlive();
  const brought = Object.entries(e.loot).filter(([, n]) => n).map(([r, n]) => { S.res[r] += n; return `${n}${RESOURCES[r].icon}`; });
  S.stash = (S.stash || []).concat(e.gear);
  S.res.food += e.rations;
  S.res.meals += e.meals || 0;
  S.expedition = null;
  living().forEach((s) => think(s, "home"));
  log(`Home after ${days}d: ${[...brought, ...e.gear.map((g) => g.name)].join(" ") || "nothing"}.`, "story", party);
  passDays(days);
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
