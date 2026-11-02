// Many years of play by the bot, one line per year: population, children, who joined, births, old-age deaths.
// node tools/sim/long.js [years=8] [villages=3] [codeDir=js/ds]
const fs = require("fs"), vm = require("vm"), path = require("path");
const years = +process.argv[2] || 8, villages = +process.argv[3] || 3;
const R = path.resolve(process.argv[4] || path.join(__dirname, "../../js/ds")) + "/";
const ctx = { console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
vm.runInContext(["text.js", "data.js", "names.js", "game.js", "combat.js", "bot.js"].map((f) => fs.readFileSync(R + f, "utf8")).join("\n"), ctx);
vm.runInContext(`
const KINDS = { joined: / joined\\.$/, born: / was born to /, grew: / grew up\\./, aged: /, aged \\d+\\./, lost: / died on floor/, left: /never came back|walked off|slipped away|packed up and left|left to find food|didn't come back/, wed: / married( quietly|\\.)/ };
this.village = (years) => {
  newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id));
  const rows = [], keep = [];
  let from = S.logN || 0, y = 1, n = {};
  const harvest = () => { for (const e of S.log.filter((e) => e.n > from)) { for (const k in KINDS) if (KINDS[k].test(e.text)) n[k] = (n[k] || 0) + 1; if (/grew up|nature\\.|distrust|aged \\d|was born/.test(e.text)) keep.push("d" + e.day + " " + e.text); } from = S.logN; };
  while (yearOf(S.day) <= years && living().length) {
    Bot.day(); harvest();
    if (yearOf(S.day) > y) {
      rows.push({ y, pop: living().length, kids: typeof kid === "function" ? living().filter(kid).length : 0, beds: beds(), ...Object.fromEntries(Object.keys(KINDS).map((k) => [k, n[k] || 0])) });
      y++; n = {};
    }
  }
  return { rows, log: keep };
};`, ctx);
const sum = Array.from({ length: years }, () => ({}));
for (let v = 0; v < villages; v++) {
  const { rows, log } = ctx.village(years);
  console.log("village", v, rows.map((r) => `${r.y}:${r.pop}(${r.kids}k/${r.beds}b)`).join(" "));
  rows.forEach((r, i) => { for (const k in r) sum[i][k] = (sum[i][k] || 0) + r[k] / villages; });
  if (v === 0 && process.env.LOG) console.log(log.slice(0, 60).join("\n"));
}
console.log("year pop kids joined born grew aged lost left wed (mean per village)");
sum.forEach((r) => r.y && console.log([r.y, ...["pop", "kids", "joined", "born", "grew", "aged", "lost", "left", "wed"].map((k) => (r[k] ?? 0).toFixed(1))].join("\t")));
