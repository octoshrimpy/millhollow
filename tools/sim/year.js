// Three villages, 365 days each, kept fed; dumps cast, pasts and the full log.
const fs = require("fs"), vm = require("vm"), R = require("path").join(__dirname, "../../js/ds/");
const OUT = require("path").join(__dirname, "out/");
const ctx = { console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
vm.runInContext(["data.js", "names.js", "game.js", "combat.js"].map((f) => fs.readFileSync(R + f, "utf8")).join("\n"), ctx);
vm.runInContext(`this.year = () => {
  newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
  for (let k = 0; k < 4; k++) S.settlers.push(makeSettler());
  S.grid[S.grid.findIndex((g, i) => !g && i > S.hall)] = { type: "stonehouse", worker: null, spent: {} };
  S.settlers.slice(0, 3).forEach((o, k) => { const at = S.grid.findIndex((g, i) => !g && i > S.hall + 2 + k); S.grid[at] = { type: "farm", worker: o.id, spent: {} }; o.job = at; });
  const cast = S.settlers.map((s) => s.name + " " + s.cls + ": " + (s.story || []).filter((e) => e.kind === "past").map((e) => e.text).join(" / ")).join("\\n");
  let from = S.logN; const all = [];
  for (let d = 0; d < 365; d++) { S.res.food = Math.max(S.res.food, 150); endDay(); all.push(...S.log.filter((e) => e.n > from)); from = S.logN; }
  const river = S.land.some((k, i) => k === "water" && dist(i, S.hall ?? MID) <= 3);
  return "CAST\\n" + cast + "\\nRIVER " + river + "\\n\\nLOG\\n" +
    all.filter((e) => /[a-z]/i.test(e.text)).map((e) => "d" + e.day + " " + e.text).join("\\n") +
    "\\n\\nEND " + living().map((s) => s.name + (s.spouse ? "+" + (byId(s.spouse) || {}).name : "")).join(", ");
};`, ctx);
for (let v = 0; v < 3; v++) { const out = ctx.year(); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + `year${v}.txt`, out); console.log(v, out.split("\n").length); }
