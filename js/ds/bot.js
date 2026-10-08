// The autoplayer: builds, staffs, researches, forges, answers trouble, and goes below.
// Plays like a careful friend: rests the bored, sends only the hale, one floor at a time, and
// picks its own research and build order each village. Used by tools/sim and the secret settings.
const Bot = (() => {
let tick = () => {};
const home = () => living().filter((s) => !away(s));
const spot = (type) => S.grid.map((_, i) => i)
  .filter((i) => !S.grid[i] && S.land[i] === "meadow" && S.seen[i] && !siteAt(i) && (!BUILDINGS[type].near || beside(i, BUILDINGS[type].near)) && (BUILDINGS[type].job || !contested(i)))
  .sort((a, b) => dist(a, S.hall) - dist(b, S.hall))[0];
const count = (t) => S.grid.filter((b) => b && b.type === t).length;
// Out of meadow: clear the nearest woods or hills inside the ward, if food allows.
const clearOne = () => { const i = S.grid.map((_, i) => i).filter((i) => TERRAIN[S.land[i]].clear && S.seen[i] && !siteAt(i) && !contested(i)).sort((a, b) => dist(a, S.hall) - dist(b, S.hall))[0];
  if (i != null && S.res.food - clearCost().food > 2 * living().length) { clearLand(i); return true; } };
const tryBuild = (t) => { const i = spot(t) ?? (clearOne() ? spot(t) : null); if (i != null && afford(BUILDINGS[t].cost) && (!BUILDINGS[t].needs || has(BUILDINGS[t].needs))) { build(i, t); return S.grid[i]?.type === t; } };

function manage() {
  // answer whatever is at the gate
  const t = S.trouble;
  if (t) {
    if (["feast", "wedding", "fey"].includes(t.kind)) settle(afford(t.take) && chance(0.8) ? "yes" : "no");
    else if (t.kind === "trader") {
      // trade a plenty for a little: pay only from a pile that stays big, and only for something nearly out
      const k = t.offers.findIndex((o) => afford(o.take) && Object.entries(o.take).every(([r, n]) => S.res[r] - n >= (r === "food" ? 40 : 20)) && Object.keys(o.give).every((r) => S.res[r] < 6));
      settle(k >= 0 ? String(k) : "none");
    }
    else settle(holds(t.n) >= 0.6 ? "fight" : afford(t.take) ? "yes" : "fight");
  }
  if (S.visitor) welcomeVisitor(living().length < beds() + 2 && S.res.food > 10);
  // houses, then enough food, then the rest one of each
  const eat = living().length, grow = count("farm") * 3 + count("dock") * 2.5;
  // open with farm, lumber, farm, farm; houses wait a day past that, since the hall has beds
  const food = count("farm") + count("dock"), open = ["farm", "lumber", "farm", "farm"];
  const next = open.find((x, i) => (x === "lumber" ? count("lumber") : food) < open.slice(0, i + 1).filter((y) => y === (x === "lumber" ? x : "farm")).length);
  if (next) tryBuild(next) || (next === "farm" && tryBuild("dock"));
  else S.bot.ready ??= S.day;
  if (!next && S.day > S.bot.ready && living().length >= beds()) has("masonry") ? tryBuild("stonehouse") : tryBuild("hut");
  if (!next && grow < eat + 2) tryBuild("dock") || tryBuild("farm");
  if (!next) for (const t of S.bot.rest)
    if (count(t) < (t === "lumber" || t === "quarry" ? 1 + (S.day > 60) : 1) && (t !== "graveyard" || S.remains.length) && (!BUILDINGS[t].needs || has(BUILDINGS[t].needs)) && tryBuild(t)) break;
  // idle hands to empty work, food first
  const empty = S.grid.map((b, i) => [b, i]).filter(([b]) => b && BUILDINGS[b.type].job && !b.worker)
    .sort(([a], [b]) => (["farm", "dock"].includes(b.type) - ["farm", "dock"].includes(a.type)));
  // a bored worker gets a day or two off, noticed most days
  for (const s of home()) if (s.job != null && s.same && s.same.n > s.patience && chance(0.7)) { assign(s.job, null); s.off = S.day + 1 + rand(2); }
  // and comes back to something else if there's a choice
  for (const [b, i] of empty) { const ok = home().filter((o) => o.job == null && !isGuard(o) && !o.guest && !(o.off >= S.day)), s = ok.find((o) => o.same?.type !== b.type) || ok[0]; if (s) assign(i, s.id); }
  for (const id of S.bot.order) doResearch(id);
  // the forge: potions, then the best thing someone needs
  if (S.res.potions < 4) brew();
  for (const r of [...RECIPES].reverse()) {
    const want = living().some((s) => r.slot === "weapon" ? r.cls === s.cls && (s.gear.weapon?.atk || 0) < r.atk : (s.gear.armor?.def || 0) < r.def);
    if (want) craft(r.id);
  }
  for (const g of [...(S.stash || [])]) {
    const val = (x) => (x?.atk || 0) + (x?.def || 0) * 2;
    const s = living().filter((o) => (g.slot !== "weapon" || !g.cls || g.cls === o.cls) && val(o.gear[g.slot]) < val(g)).sort((a, b) => (b.cls === g.cls) - (a.cls === g.cls) || val(a.gear[g.slot]) - val(b.gear[g.slot]))[0];
    if (s) equip(s.id, g.uid);
  }
}

function fight() {
  const f = S.expedition.fight;
  for (let n = 0; n < 2e5 && !f.over; n++) {
    if (f.paused) { if (f.odds >= 1 && f.heroes.some((h) => h.hp > 0 && h.hp < h.hpMax * 0.4)) flee(f); else f.paused = false; }
    step(f, 0.1);
  }
  endFight(f.over);
}
// shortest way to room k through rooms already seen
function toward(k) {
  const m = S.expedition.map, back = { [m.at]: null }, q = [m.at];
  while (q.length) { const c = q.shift(); for (const n of neighbours(m.rooms, c)) if (!(n in back) && m.rooms[n].seen) { back[n] = c; q.push(n); } }
  if (!(k in back)) return null;
  let s = k; while (back[s] !== m.at) s = back[s]; return s;
}
function trip() {
  const party = home().filter((s) => !refuses(s) && !s.guest && s.hp >= stats(s).hpMax * 0.75 && !s.wander)
    .sort((a, b) => b.lvl - a.lvl || stats(b).atk - stats(a).atk).slice(0, partyMax());
  if (party.length < 2) return;
  const site = S.sites.map((x, i) => [x, i]).filter(([x]) => S.seen[x.i])[0];
  if (!site) return;
  const scav = has("smelting") && (S.res.ore < 6 || S.res.herbs < 3) && chance(0.6);
  const start = scav ? 1 : Math.max(1, (site[0].deepest || 0) + +chance(0.4)), food = Math.min(30, Math.max(0, S.res.food - 4 * home().length));
  if (food < 6) return;
  depart(party.map((s) => s.id), food, start, Math.min(6, S.res.meals), site[1], scav);
  if (!S.expedition) return;
  const goal = scav ? SCAV_CAP : start;
  for (let guard = 0; S.expedition && guard < 500; guard++) {
    tick();
    const e = S.expedition;
    if (e.fight) { fight(); continue; }
    if (e.event) { resolveEvent(EVENTS.find((x) => x.id === e.event).choices[0].act); continue; }
    if (canCamp() && hurting() && e.rations > partyAlive().length + homeFood()) { camp(); continue; }
    const r = e.map.rooms[e.map.at];
    const weak = partyAlive().some((s) => s.hp < stats(s).hpMax * 0.5) || partyAlive().length < 2;
    if (weak || onlyEnoughHome()) { returnHome(); continue; }
    if (["stairs", "boss"].includes(r.type) && r.done) { if (e.map.floor < goal && !hurting()) { descend(); continue; } returnHome(); continue; }
    const next = nextStep();
    if (next) { move(next); continue; }
    const exit = Object.keys(e.map.rooms).find((k) => ["stairs", "boss"].includes(e.map.rooms[k].type) && e.map.rooms[k].seen);
    const way = exit && toward(exit);
    if (way && !(e.map.rooms[exit].type === "boss" && hurting())) { move(way); continue; }
    returnHome();
  }
}

// One day of play. Keeps its research and build order on S.bot so a save picks up where it left.
function day() {
  const mix = (xs) => xs.map((x) => [x, Math.random()]).sort((a, b) => a[1] - b[1]).map(([x]) => x);
  // food and the forge first, mostly; the rest however this player fancies
  S.bot ||= { ready: null, trip: S.day + 6, order: [...mix(["herbalism", "smelting", "smoking", "rope"]), ...mix(Object.keys(RESEARCH))],
    rest: mix(["lumber", "quarry", "library", "forge", "garden", "graveyard", "infirmary", "smokehouse", "park", "playground", "fountain", "range", "axeyard"]).concat("lumber", "quarry") };
  manage();
  if (!S.expedition && S.day >= S.bot.trip && !S.trouble) { trip(); S.bot.trip = S.day + 4 + rand(5); manage(); }
  endDay();
}
return { day, onTick: (f) => (tick = f) };
})();
