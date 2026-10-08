// Headless run of the ds game: N villages, D days each, tallies what the drives made people do.
const fs = require("fs"), vm = require("vm"), R = require("path").join(__dirname, "../../js/ds/");
const ctx = { console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
const src = ["data.js", "names.js", "game.js", "combat.js"].map((f) => fs.readFileSync(R + f, "utf8")).join("\n");
const run = (days, fed, show) => {
  const tally = {}, lines = [];
  for (let n = 0; n < 30; n++) {
    newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
    for (let k = 0; k < 4; k++) S.settlers.push(makeSettler());
    S.res.food = fed ? 999 : 0; S.res.meals = 0;
    S.grid[S.grid.findIndex((g, i) => !g && i > S.hall)] = { type: "stonehouse", worker: null, spent: {} };
    S.settlers.slice(0, 3).forEach((o, k) => { const at = S.grid.findIndex((g, i) => !g && i > S.hall + 2 + k); S.grid[at] = { type: "farm", worker: o.id, spent: {} }; o.job = at; });
    const [a, b, c] = S.settlers;
    a.heard = [{ about: b.id, death: c.id, v: -1, hops: 0, until: 9999 }];
    const from = S.logN;
    for (let d = 0; d < days; d++) { if (fed) S.res.food = 999; else S.res.food = 0; endDay(); }
    for (const e of S.log.filter((e) => e.n > from)) {
      const k = /went for/.test(e.text) ? "brawl" : /smashed|set fire/.test(e.text) ? "smash" : /drank the stores/.test(e.text) ? "drink"
        : /walked off/.test(e.text) ? "wander" : /left in the night|left to find food/.test(e.text) ? "leave"
        : /showed/.test(e.text) ? "teach" : /bones|dressed the wounds/.test(e.text) ? "mend" : /let it go/.test(e.text) ? "forgive"
        : /want to marry/.test(e.text) ? "court" : /outdo/.test(e.text) ? "graft" : /took the gate/.test(e.text) ? "watch"        : /pirates/.test(e.text) ? "pirates" : /Bandits/.test(e.text) ? "bandits" : null;
      if (k) { tally[k] = (tally[k] || 0) + 1; if (n === 0 && show) lines.push(`d${e.day} ${e.text}`); }
    }
    tally.left_alive = (tally.left_alive || 0) + living().length;
  }
  return JSON.stringify(tally) + (show ? "\n  " + lines.join("\n  ") : "");
};
vm.runInContext(src + `;this.go = ${run.toString()};`, ctx);
console.log("fed 60d:", ctx.go(60, true, true));
console.log("starving 20d:", ctx.go(20, false, false));
vm.runInContext(`
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
const [a, b] = S.settlers, at = S.grid.findIndex((g, i) => !g && i > S.hall);
S.grid[at] = { type: "farm", worker: a.id, spent: {} }; a.job = at;
a.drive = { anger: 100 }; for (let k = 0; k < 200 && S.grid[at]; k++) { a.drive.anger = 100; URGES.smash.does(a, S.settlers); }
if (S.grid[at] !== null) throw "smash";
if (!S.settlers.filter((o) => o !== a).every((o) => grudge(o, a))) throw "witness";
S.res.food = 50; b.drive = { grief: 100 }; URGES.drink.does(b); if (S.res.food !== 40) throw "drink";
b.drive = { fear: 70 }; if (refuses(b) !== true) throw "fear";
console.log("forced acts ok:", S.log.slice(-2).map((e) => e.text).join(" | "), "|", why(a));
`, ctx);
vm.runInContext(`
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
const w = S.settlers[3]; w.job = null; w.drive = { pride: 90 };
if (!URGES.watch.can(w)) throw "watch can"; URGES.watch.does(w); if (!isGuard(w)) throw "watch";
console.log("watch ok:", S.log.at(-1).text);
`, ctx);
vm.runInContext(`{
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
const [h] = S.settlers, at = S.grid.findIndex((g, i) => !g && i > S.hall);
S.grid[at] = { type: "axeyard", worker: null, spent: {} };
h.drive = { anger: 60 };
for (let k = 0; k < 200 && drive(h, "anger") >= 35; k++) leisure(S.settlers);
if (drive(h, "anger") >= 35) throw "vent";
if (!S.settlers.every((s) => PASTIMES[s.pastime])) throw "pastime";
console.log("vent ok:", h.story.at(-1).text);
}`, ctx);
vm.runInContext(`{
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
const [a, b, c] = S.settlers;
tie(a, b, 45); if (!close(a, b) || tieOf(b, a) !== 45 || !/friends now/.test(S.log.at(-1).text)) throw "tie";
a.drive = { warmth: 50 }; b.drive = { warmth: 50 }; c.drive = { warmth: 50 };
if (sweetheart(a, S.settlers) !== b) throw "court needs a tie";
a.vow = true; if (sweetheart(b, S.settlers)) throw "vow";
const site = S.sites[0], m = genFloor(1, site), k = Object.keys(m.rooms).find((k) => m.rooms[k].type === "fight");
S.remains.push({ id: c.id, site: 0, floor: 1, at: "below", room: k });
if (genFloor(1, site).rooms !== m.rooms || m.rooms[k].body !== c.id) throw "floor";
S.asks = {}; a.pastime = "prayer"; for (let n = 0; n < 500 && !S.asks.chapel; n++) wish([a]);
if (!S.asks.chapel) throw "wish";
console.log("ties ok:", S.log.at(-1).text);
}`, ctx);
vm.runInContext(`{
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
while (!S.settlers.some((x) => S.settlers.some((y) => y !== x && !spark(x, y)))) S.settlers.push(makeSettler());
const [a, b] = S.settlers.filter((x, _, xs) => xs.some((y) => y !== x && !spark(x, y))).slice(0, 1).flatMap((x) => [x, S.settlers.find((y) => y !== x && !spark(x, y))]);
tie(a, b, 45); a.drive = { warmth: 90 }; b.drive = { warmth: 90 };
S.settlers.filter((x) => x !== a && x !== b).forEach((x) => (x.vow = true));
URGES.court.does(a, S.settlers);
if (a.sweet?.o !== b.id || !/sweet on/.test(S.log.at(-1).text)) throw "sweet";
if (S.day - a.sweet.day >= 14) throw "court too fast"; a.sweet.day -= 21; a.drive.warmth = 90; URGES.court.does(a, S.settlers);
if (S.trouble || !/stay friends/.test(S.log.at(-1).text) || sweetheart(a, S.settlers)) throw "friendzone";
const n = (a.story || []).length; gameLog("x", "", [a], true);
if (!S.log.at(-1).aside || a.story.length !== n + 1) throw "aside";
console.log("friendzone ok:", S.log.at(-2).text);
}`, ctx);
vm.runInContext(`{
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id)); S.log = []; for (let k = 0; k < 400; k++) gameLog("x" + k, "", [], k % 2);
let calls = 0; localStorage.setItem = (k, v) => { if (v.length > 25000 && ++calls) { const e = new Error("full"); e.name = "QuotaExceededError"; throw e; } };
save(); if (S.log.length >= 400 || !S.log.some((l) => !l.aside && l.text === "x0")) throw "shed";
console.log("shed ok:", S.log.length, "left, asides first");
}`, ctx);
vm.runInContext(`(() => {
  newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
  const [a, b] = living(); a.pastime = "maps"; a.traits = b.traits = ["calm", "kind"]; living().forEach((x) => { x.morale = 80; if (x !== a) x.pastime = null; });
  const lines = (n) => { const out = []; for (let k = 0; k < n; k++) { const m = S.log.length; a.quit = null; leisure([a, b]); out.push(...S.log.slice(m).map((l) => l.text)); } return out; };
  const before = lines(400);
  if (before.some((t) => t.includes("dungeon"))) throw new Error("drew the dungeon unseen");
  b.delved = true;
  const told = lines(400);
  if (!told.some((t) => t.includes(b.name + "'s telling")) || told.some((t) => t.startsWith(a.name) && t.includes("from memory"))) throw new Error("telling wrong");
  console.log("delved ok:", told.find((t) => t.includes("telling")));
})()`, ctx);
vm.runInContext(`(() => {
  newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
  S.land = S.land.map((k) => (k === "water" ? "meadow" : k));
  const out = [];
  for (const p of ["fishing", "swimming", "riding", "smithing", "birds", "painting"]) {
    living().forEach((x) => { x.pastime = p; x.morale = 80; });
    for (let k = 0; k < 300; k++) { const m = S.log.length; leisure(living()); out.push(...S.log.slice(m).map((l) => l.text)); }
  }
  const bad = out.filter((t) => /fish|swam|across the pond|floated|rode|horse|hammered|ring from a nail|'s pot|river|heron/.test(t));
  if (bad.length) throw new Error("impossible: " + bad[0]);
  console.log("doable ok:", out.length, "lines");
})()`, ctx);
vm.runInContext(`
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
const s = S.settlers[0], max = stats(s).hpMax, sum = () => Object.values(s.wounds || {}).reduce((a, b) => a + b, 0);
s.hp = Math.round(max * 0.3); limbs(s);
if (Math.abs(sum() - (max - s.hp)) > 1) throw new Error("wounds " + sum() + " != " + (max - s.hp));
if (!injuries(s).length) throw new Error("no injury at 30% hp");
s.hp = max; limbs(s);
if (sum() > 0.5 || injuries(s).length) throw new Error("wounds left at full hp");
const j = S.grid.findIndex((g, i) => !g && i > S.hall);
S.grid[j] = { type: "farm", worker: null, spent: {} }; assign(j, s.id);
const atk = stats(s).atk;
s.wounds = { larm: max * 0.175, rarm: max * 0.175 }; s.hp = max - Math.ceil(max * 0.35); rest(s);
if (s.laid == null || s.job != null) throw new Error("not laid up");
if (stats(s).atk >= atk) throw new Error("arms didn't weaken");
s.hp = max; rest(s);
if (s.laid != null || s.job !== j) throw new Error("not back at work");
{ const t = S.settlers[1]; t.hp = stats(t).hpMax; (S.stash ||= []).push({ uid: "t1", slot: "armor", def: 1, hp: 6 }); equip(t.id, "t1");
if (t.hp !== stats(t).hpMax) throw new Error("armor wounds the wearer"); }
console.log("limbs ok");
`, ctx);
vm.runInContext(`
const mem = new Map();
globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id)); S.town = "Ashford"; S.day = 9; save();
useSlot(1);
if (!S.recruits || S.town === "Ashford" || S.towns.length !== 3) throw new Error("slot 1 not fresh");
useSlot(0);
if (S.town !== "Ashford" || S.day !== 9 || slotInfo(0).town !== "Ashford" || slotInfo(1)) throw new Error("slot 0 not restored");
S.settlers.forEach((x) => { delete x.traits; delete x.pastime; }); S.settlers[0].spouse = S.settlers[1].id; save(); load();
if (!S.settlers.every((x) => x.traits?.length === 2 && x.pastime) || S.settlers[0].wedDay !== S.day) throw new Error("old save not converted");
console.log("slots ok");
`, ctx);
vm.runInContext(`{
const f = { heroes: [{ cls: "mystic", hp: 5, cd: 0 }, { cls: "cleric", hp: 9, cd: 1 }], enemies: [{ hp: 9, gauge: 0, spd: 1 }] };
S.res.potions = 0;
if (!covered(f)) throw new Error("mend in time should cover");
f.heroes[1].cd = 99;
if (covered(f)) throw new Error("late mend shouldn't cover");
S.res.potions = 1;
if (!covered(f)) throw new Error("potion should cover");
console.log("cover ok");
}`, ctx);
