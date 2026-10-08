
const GAUGE_RATE = 8;

const defaultRow = (cls) => (CLASSES[cls].range === "ranged" ? "back" : "front");

const might = (us) => us.reduce((a, u) => a + u.atk * u.hp, 0);

function newFight(settlers, enemies) {
  const f = {
    heroes: settlers.map((s, i) => {
      const st = stats(s);
      return {
        side: "h", idx: i, id: s.id, name: s.name, cls: s.cls, level: s.level, row: s.row || defaultRow(s.cls),
        hp: s.hp, hpMax: st.hpMax, atk: starving() ? Math.ceil(st.atk / 2) : st.atk, def: st.def, spd: st.spd,
        gauge: rand(40), cd: 2, hurt: s.hp < st.hpMax / 2,
      };
    }),
    enemies: enemies.map((e, i) => ({ ...e, side: "e", idx: i, gauge: rand(40), swings: 0 })),
    focus: null, taunt: 0, paused: true, speed: 1, lines: [], over: false,
    fx: [],
  };
  f.odds = might(f.enemies) / Math.max(1, might(f.heroes));
  return f;
}

function fightLog(f, text) {
  f.lines.push(text);
  if (f.lines.length > 6) f.lines.shift();
}

const alive = (xs) => xs.filter((u) => u.hp > 0);

const windup = (en) => en.aoeEvery ? ((en.swings % en.aoeEvery) * 100 + Math.min(100, en.gauge)) / en.aoeEvery : 0;

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

const waits = (h) => h.row === "back" && CLASSES[h.cls].range === "melee";

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
    const s = byId(h.id), n = 12 + 2 * h.level + (fitBonus(s.gear.weapon, s) ? s.gear.weapon.atk : 0);
    t.hp = Math.min(t.hpMax, t.hp + n);
    t.healed = 0.4;
    f.fx.push({ t: "heal", to: t, n });
    fightLog(f, `${h.name}: Mend, +${n} to ${t === h ? "self" : t.name}.`);
  }
  h.cd = skill.cd;
  f.fx.push({ t: "skill", u: h, id: skill.id, name: skill.name });
  check(f);
}

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
    if (h.hp < h.hpMax * 0.25 && S.res.potions > 0) usePotion(i);
    if (h.cd === 0 && wantsSkill(f, h) && !(waits(h) && CLASSES[h.cls].skill.id !== "mend")) useSkill(f, i);
    h.gauge += h.spd * GAUGE_RATE * dt;
    if (waits(h)) h.gauge = Math.min(h.gauge, 100);
    if (h.gauge < 100 || f.over || waits(h)) return;
    h.gauge -= 100;
    const t = heroTarget(f);
    if (!t) return;
    hit(f, h, t);
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
      alive(f.heroes).forEach((h) => hit(f, en, h, h.row === "back" ? 0.3 : 0.6, false, "aoe"));
      fightLog(f, `${en.name} hits everyone.`);
    } else {
      const t = enemyTarget(f, en);
      if (t) { const d = hit(f, en, t); if (t.hp <= 0) fightLog(f, `${t.name} is down (${d}).`); }
    }
    check(f);
  }
  const front = alive(f.heroes).filter((h) => h.row === "front").length;
  const up = (front < (f.front ?? front) || !front) && alive(f.heroes).find(waits);
  if (up) { up.row = "front"; byId(up.id).row = "front"; fightLog(f, `${up.name} steps up.`); }
  f.front = front + (up ? 1 : 0);
  for (const h of f.heroes) if (h.hp > 0 && h.hp < h.hpMax / 2 && !h.hurt && !f.over) { h.hurt = true; f.paused ||= !covered(f); }
}

// A potion on hand, or a mend ready before the next enemy swing, means no need to stop the fight.
function covered(f) {
  const next = Math.min(...alive(f.enemies).map((en) => (100 - en.gauge) / (en.spd * GAUGE_RATE)));
  return S.res.potions > 0 || alive(f.heroes).some((c) => CLASSES[c.cls].skill.id === "mend" && c.cd < next);
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
  for (const h of alive(f.heroes)) { const en = pick(alive(f.enemies)); if (en) hit(f, en, h, 0.8); }
  f.over = "fled";
  f.fx.push({ t: "fled" });
}
