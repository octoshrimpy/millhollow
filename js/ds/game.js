// Millhollow — game state and rules. No DOM in here: ui.js reads and calls.

const SAVE_KEY = "millhollow-ds-v1";
const GRID_W = 6, GRID_H = 4;
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
  const pool = namesFor(sexOf(face)).filter((n) => !taken.has(n));
  const c = CLASSES[cls || pick(Object.keys(CLASSES))];
  const s = {
    id: nextId++, name: pick(pool.length ? pool : namesFor("any")), face, age: pick(AGES),
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
// The village starts as a 4×3 clearing; the rest is woods to clear as it grows.
const startWild = () => Array.from({ length: GRID_W * GRID_H }, (_, i) => {
  const x = i % GRID_W, y = Math.floor(i / GRID_W);
  return x < 1 || x > 4 || y > 2;
});

function newGame() {
  S = {
    day: 1, res: { food: 20, wood: 12, stone: 4, ore: 0, herbs: 0, relics: 0, research: 0, potions: 0 },
    carry: {}, grid: Array(GRID_W * GRID_H).fill(null), wild: startWild(), cleared: 0, settlers: [], research: [],
    deepest: 0, visitor: null, expedition: null, log: [],
  };
  nextId = 1;
  for (const c of ["warrior", "ranger", "cleric", "mystic"]) S.settlers.push(makeSettler(c));
  S.grid[7] = { type: "hut", worker: null };
  S.grid[8] = { type: "hut", worker: null };
  S.grid[13] = { type: "farm", worker: S.settlers[2].id };
  S.settlers[2].job = 13;
  log("Four settlers reach the old mill. A stair under it leads down.", "story", S.settlers);
  save();
}

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S, nextId })); } catch (e) { } }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    ({ S, nextId } = JSON.parse(raw));
    if (S.expedition && S.expedition.fight) S.expedition.fight = null; // a fight restarts on reload
    if (!S.wild) { S.wild = startWild().map((w, i) => w && !S.grid[i]); S.cleared = 0; }
    // People from older saves get a past, drawn from what they were best at.
    for (const s of [...S.settlers, S.visitor].filter(Boolean)) {
      if ((s.story || []).some((e) => e.kind === "past")) continue;
      const trade = Object.keys(s.skills).sort((a, b) => s.skills[b] - s.skills[a])[0] || pick(Object.keys(JOBS));
      s.story = [...pastOf(s, trade), ...(s.story || [])];
    }
    return true;
  } catch (e) { return false; }
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

// Clearing is labour, paid in food, and the felled trees come back as logs.
const clearCost = () => ({ food: 6 + 4 * S.cleared });
const CLEAR_WOOD = 5;

function clearLand(i) {
  const cost = clearCost();
  if (!S.wild[i] || !afford(cost)) return;
  pay(cost);
  S.wild[i] = false;
  S.cleared++;
  S.res.wood += CLEAR_WOOD;
  log(`Cleared land. +${CLEAR_WOOD}${RESOURCES.wood.icon}`);
  save();
}

function build(i, type) {
  const b = BUILDINGS[type];
  if (S.grid[i] || S.wild[i] || !afford(b.cost) || (b.needs && !has(b.needs))) return;
  pay(b.cost);
  S.grid[i] = { type, worker: null };
  log(`Built ${b.name.toLowerCase()}.`);
  living().filter((s) => !away(s)).forEach((s) => think(s, "built"));
  save();
}

function demolish(i) {
  const b = S.grid[i];
  if (!b) return;
  if (b.worker) byId(b.worker).job = null;
  S.grid[i] = null;
  log(`Demolished ${BUILDINGS[b.type].name.toLowerCase()}.`);
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
  S.grid.forEach((b, i) => {
    if (!b || !b.worker) return;
    const s = byId(b.worker), def = BUILDINGS[b.type];
    if (!available(s) || s.hp <= 0) return;
    const here = {};
    const take = (r, n) => { const w = add(r, n); got[r] = (got[r] || 0) + w; if (w) here[r] = w; };
    const skill = s.skills[def.job] || 0;
    const eff = (1 + skill * 0.1) * (s.morale < 30 ? 0.5 : 1);
    for (const [r, n] of Object.entries(def.yields || {})) take(r, n * eff);
    if (b.type === "library" && S.res.relics > 0) {
      S.res.relics--;
      spent.relics = (spent.relics || 0) + 1;
      take("research", 2 + skill * 0.5);
    }
    s.skills[def.job] = +(skill + 0.1).toFixed(1);
    if (Object.keys(here).length) lastYields.push({ i, got: here });
  });

  // Everyone at home eats; the expedition carries its own rations.
  const home = living().filter((s) => !away(s));
  const fed = Math.min(S.res.food, home.length);
  S.res.food -= fed;
  spent.food = fed;
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
  if (has(id) || S.res.research < r.cost) return;
  S.res.research -= r.cost;
  S.research.push(id);
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
const roomsPerRation = () => (has("field_rations") ? 2 : 1);

function genFloor(floor) {
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
    if (k === far) { r.type = bossFor(floor) ? "boss" : "stairs"; continue; }
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

function depart(partyIds, rations, startFloor) {
  const party = partyIds.map(byId).filter(available).slice(0, partyMax());
  if (!party.length || S.expedition) return;
  rations = Math.min(rations, S.res.food);
  S.res.food -= rations;
  // Nobody works at home while they're below.
  party.forEach((s) => { if (s.job != null && S.grid[s.job]) S.grid[s.job].worker = null; s.job = null; });
  S.expedition = {
    party: party.map((s) => s.id), rations, steps: 0, moves: 0,
    loot: {}, gear: [], map: genFloor(startFloor), fight: null, event: null,
  };
  log(`Set out: ${party.map((s) => s.name).join(", ")}, ${rations} rations.`, "story", party);
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
  if (++e.steps >= roomsPerRation()) {
    e.steps = 0;
    if (e.rations > 0) { if (--e.rations === 0) log("Out of rations. The party is starving.", "bad", partyAlive()); }
    else partyAlive().forEach((s) => {
      s.hp = Math.max(1, s.hp - 3);
      think(s, "starving");
    });
  }
  revealAround();
  enterRoom();
  save();
}

function enterRoom() {
  const e = S.expedition, r = e.map.rooms[e.map.at], f = e.map.floor;
  if (r.done) return;
  if (r.type === "fight") return startFight(rollEnemies(f));
  if (r.type === "boss") return startFight([scaleEnemy(bossFor(f), f, true)]);
  if (r.type === "event") { e.event = r.event; return; }
  r.done = true;
  if (r.type === "treasure") {
    const got = lootRoll(f, 2);
    log(`Floor ${f}: stash. ${got}`, "good", partyAlive());
  } else if (r.type === "shrine") {
    partyAlive().forEach((s) => (s.hp = Math.min(stats(s).hpMax, s.hp + Math.ceil(stats(s).hpMax * 0.4))));
    log(`Floor ${f}: shrine. Party healed.`, "good", partyAlive());
  } else if (r.type === "stairs") {
    S.deepest = Math.max(S.deepest, f);
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
  const pool = Object.values(ENEMIES).filter((e) => e.from <= floor);
  const n = Math.min(5, 1 + rand(2) + Math.floor(floor / 2));
  return Array.from({ length: n }, () => scaleEnemy(pick(pool), floor));
}

function lootRoll(floor, rolls) {
  const e = S.expedition, found = [];
  for (let i = 0; i < rolls; i++) {
    const r = pick(["ore", "ore", "herbs", "relics", "stone", "wood"]);
    const n = 1 + rand(1 + Math.ceil(floor / 2));
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
    const n = 2 + rand(3);
    e.loot.ore = (e.loot.ore || 0) + n;
    log(`Cart: +${n}⛏️.`, "good", party);
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
      S.deepest = Math.max(S.deepest, f);
      partyAlive().forEach((s) => think(s, "victory"));
      log(`Floor ${f}: boss down. Stairs open.`, "story", partyAlive());
    }
  }
  save();
}

function descend() {
  const e = S.expedition, r = e.map.rooms[e.map.at];
  if (!e || e.fight || !["stairs", "boss"].includes(r.type) || !r.done) return;
  e.map = genFloor(e.map.floor + 1);
  revealAround();
  log(`Down to floor ${e.map.floor}.`, "story", partyAlive());
  save();
}

function returnHome() {
  const e = S.expedition;
  if (!e || e.fight || e.event) return;
  const days = Math.max(1, Math.ceil(e.moves / 5)), party = partyAlive();
  const brought = Object.entries(e.loot).filter(([, n]) => n).map(([r, n]) => { S.res[r] += n; return `${n}${RESOURCES[r].icon}`; });
  S.stash = (S.stash || []).concat(e.gear);
  S.res.food += e.rations;
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
