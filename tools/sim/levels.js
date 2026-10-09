// Runs N bot years and prints deepest floor / deaths / top level. Usage: node tools/sim/levels.js [N] [game.js path]
const fs = require("fs"), vm = require("vm"), R = require("path").join(__dirname, "../../js/ds/");
const N = +process.argv[2] || 8, game = process.argv[3] || R + "game.js";
const ctx = { console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
const src = [R + "data.js", R + "names.js", game, R + "combat.js", R + "bot.js"].map((f) => fs.readFileSync(f, "utf8")).join("\n");
vm.runInContext(src, ctx);
vm.runInContext(`this.run = () => {
  newGame(); S.beasts ??= {}; settleIn(S.recruits.slice(0, 4).map((s) => s.id));
  while (S.day <= 365 && living().length) Bot.day();
  return { deepest: S.deepest, dead: S.settlers.filter((s) => s.dead).length, top: Math.max(...S.settlers.map((s) => s.level)), alive: living().length, day: S.day };
};`, ctx);
const rs = Array.from({ length: N }, () => ctx.run());
const avg = (k) => (rs.reduce((a, r) => a + r[k], 0) / N).toFixed(1);
console.log(rs.map((r) => `${r.deepest}/${r.dead}/${r.top}`).join(" "), "| deepest", avg("deepest"), "dead", avg("dead"), "toplvl", avg("top"), "alive", avg("alive"));
