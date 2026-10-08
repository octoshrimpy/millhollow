// A year of play by the bot in js/ds/bot.js. Writes out/play0..2.txt.
const OUT = require("path").join(__dirname, "out/");
const fs = require("fs"), vm = require("vm"), R = require("path").join(__dirname, "../../js/ds/");
const ctx = { console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
vm.runInContext(["data.js", "names.js", "game.js", "combat.js", "bot.js"].map((f) => fs.readFileSync(R + f, "utf8")).join("\n"), ctx);
vm.runInContext(`
var LOG, from;
const harvest = () => { LOG.push(...S.log.filter((e) => e.n > from)); from = S.logN; };
Bot.onTick(harvest);
this.year = () => {
  newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
  LOG = []; from = S.logN || 0;
  const cast0 = () => S.settlers.map((s) => s.name + " " + s.cls + ": " + (s.story || []).filter((e) => e.kind === "past").map((e) => e.text).join(" / ")).join("\\n");
  const cast = cast0();
  while (S.day <= 365 && living().length) { Bot.day(); harvest(); }
  const river = S.land.some((k, i) => k === "water" && dist(i, S.hall) <= 3);
  const all = S.settlers.map((s) => s.name + (s.dead ? " †d" + s.diedOn : living().includes(s) ? "" : " (gone)") + " " + s.cls + " L" + s.level + " " + PASTIMES[s.pastime].icon + " ♥" + Object.entries(s.ties || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => (S.settlers.concat(S.gone || []).find((o) => o.id == k) || {}).name + v).join(",") + (s.spouse ? " +" + byId(s.spouse).name : "") + " | " + Object.entries(s.drive || {}).filter(([, v]) => v).map(([k, v]) => k + v).join(" ") + " | " + (s.story || []).filter((e) => e.kind === "past").map((e) => e.text).join(" / ")).join("\\n");
  return "START\\n" + cast + "\\nRIVER " + river + " deepest " + S.deepest + " claim " + S.claim + " research " + S.research.join(",") +
    "\\n\\nLOG\\n" + LOG.filter((e) => e.kind !== "day").map((e) => "d" + e.day + " " + e.text).join("\\n") + "\\n\\nEVERYONE\\n" + all;
};`, ctx);
for (let v = 0; v < 3; v++) { const out = ctx.year(); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + `play${v}.txt`, out); console.log(v, out.split("\n").length, out.match(/\nRIVER (.*)/)[1]); }
