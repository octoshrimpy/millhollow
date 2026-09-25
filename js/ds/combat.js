// Millhollow — real-time-with-pause fights. step() is driven by ui.js on a timer;
// everything here is plain data so a fight can be stepped headless too.

const GAUGE_RATE = 8; // gauge per second per point of speed; 100 gauge = one attack

const defaultRow = (cls) => (CLASSES[cls].range === "ranged" ? "back" : "front");

function newFight(settlers, enemies) {
  return {
    heroes: settlers.map((s, i) => {
      const st = stats(s);
      return {
        side: "h", idx: i, id: s.id, name: s.name, cls: s.cls, level: s.level, row: s.row || defaultRow(s.cls),
        hp: s.hp, hpMax: st.hpMax, atk: starving() ? Math.ceil(st.atk / 2) : st.atk, def: st.def, spd: st.spd,
        gauge: rand(40), cd: 2,
      };
    }),
    enemies: enemies.map((e, i) => ({ ...e, side: "e", idx: i, gauge: rand(40), swings: 0 })),
    focus: null, taunt: 0, paused: true, speed: 1, lines: [], over: false,
    fx: [], // what just happened, for ui.js to animate; drained every frame

  };
}

function fightLog(f, text) {
  f.lines.push(text);
  if (f.lines.length > 6) f.lines.shift();
}

const alive = (xs) => xs.filter((u) => u.hp > 0);

// How a plain attack looks: who lunges and who throws something.
const attackKind = (u) => u.side === "h"
  ? { ranger: "arrow", mystic: "orb" }[u.cls] || "melee"
  : u.ranged ? "orb" : "melee";

function hit(f, from, to, mult = 1, pierce = false, kind = attackKind(from)) {
  let d = from.atk * mult * (0.8 + Math.random() * 0.4) - (pierce ? 0 : to.def);
  const crit = Math.random() < 0.1;
  if (crit) d *= 1.5;
  d = Math.max(1, Math.round(d));
  to.hp = Math.max(0, to.hp - d);
  to.flash = 0.3;
  f.fx.push({ t: "hit", from, to, d, crit, kind });
  if (to.hp <= 0) f.fx.push({ t: "die", u: to });
  return d;
}

function heroTarget(f) {
  const live = alive(f.enemies);
  return (f.focus != null && f.enemies[f.focus].hp > 0) ? f.enemies[f.focus] : live[0];
}

function enemyTarget(f, en) {
  const live = alive(f.heroes);
  const warrior = live.find((h) => h.cls === "warrior");
  if (f.taunt > 0 && warrior) return warrior;
  if (en.flying) return pick(live);
  const front = live.filter((h) => h.row === "front");
  return pick(front.length ? front : live);
}

function useSkill(f, i) {
  const h = f.heroes[i];
  if (!h || h.hp <= 0 || h.cd > 0 || f.over) return;
  const skill = CLASSES[h.cls].skill;
  const live = alive(f.enemies);
  if (!live.length) return;
  if (skill.id === "cleave") {
    live.forEach((en) => hit(f, h, en, 0.7, false, "cleave"));
    f.taunt = 5;
    fightLog(f, `${h.name}: Cleave.`);
  } else if (skill.id === "volley") {
    for (let k = 0; k < 3; k++) { const t = alive(f.enemies); if (t.length) hit(f, h, pick(t), 0.6, false, "arrow"); }
    fightLog(f, `${h.name}: Volley.`);
  } else if (skill.id === "firebolt") {
    const t = heroTarget(f), d = hit(f, h, t, 2.2, true, "fire");
    fightLog(f, `${h.name}: Firebolt, ${d} to ${t.name}.`);
  } else if (skill.id === "mend") {
    const t = alive(f.heroes).sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax)[0];
    const n = 12 + 2 * h.level;
    t.hp = Math.min(t.hpMax, t.hp + n);
    t.healed = 0.4;
    f.fx.push({ t: "heal", to: t, n });
    fightLog(f, `${h.name}: Mend, +${n} to ${t === h ? "self" : t.name}.`);
  }
  h.cd = skill.cd;
  f.fx.push({ t: "skill", u: h, id: skill.id, name: skill.name });
  check(f);
}

// Heroes fire their own skills. Mend waits until someone actually needs it.
function wantsSkill(f, h) {
  if (CLASSES[h.cls].skill.id !== "mend") return true;
  return alive(f.heroes).some((u) => u.hp < u.hpMax * 0.6);
}

function step(f, dt) {
  if (f.paused || f.over) return;
  dt *= f.speed;
  f.taunt = Math.max(0, f.taunt - dt);
  for (const u of [...f.heroes, ...f.enemies]) {
    u.flash = Math.max(0, (u.flash || 0) - dt);
    u.healed = Math.max(0, (u.healed || 0) - dt);
  }

  f.heroes.forEach((h, i) => {
    if (h.hp <= 0 || f.over) return;
    h.cd = Math.max(0, h.cd - dt);
    if (h.cd === 0 && wantsSkill(f, h)) useSkill(f, i);
    h.gauge += h.spd * GAUGE_RATE * dt;
    if (h.gauge < 100 || f.over) return;
    h.gauge -= 100;
    const t = heroTarget(f);
    if (!t) return;
    // Swinging a sword from the back row is half a swing.
    const mult = CLASSES[h.cls].range === "melee" && h.row === "back" ? 0.5 : 1;
    hit(f, h, t, mult);
    check(f);
  });

  for (const en of f.enemies) {
    if (en.hp <= 0 || f.over) continue;
    en.gauge += en.spd * GAUGE_RATE * dt;
    if (en.gauge < 100) continue;
    en.gauge -= 100;
    en.swings++;
    if (en.aoeEvery && en.swings % en.aoeEvery === 0) {
      f.fx.push({ t: "aoe", u: en });
      alive(f.heroes).forEach((h) => hit(f, en, h, 0.6, false, "aoe"));
      fightLog(f, `${en.name} hits everyone.`);
    } else {
      const t = enemyTarget(f, en);
      if (t) { const d = hit(f, en, t); if (t.hp <= 0) fightLog(f, `${t.name} is down (${d}).`); }
    }
    check(f);
  }
}

function check(f) {
  if (f.over) return;
  f.enemies.forEach((en) => { if (en.hp <= 0 && !en.logged) { en.logged = true; fightLog(f, `${en.name} killed.`); } });
  if (!alive(f.enemies).length) f.over = "won";
  else if (!alive(f.heroes).length) f.over = "lost";
  if (f.over) f.fx.push({ t: f.over });
}

function flee(f) {
  if (f.over) return;
  // Everyone takes one parting blow on the way out.
  for (const h of alive(f.heroes)) { const en = pick(alive(f.enemies)); if (en) hit(f, en, h, 0.8); }
  f.over = "fled";
  f.fx.push({ t: "fled" });
}
