// Millhollow — rendering and input. Every button carries data-act; one click
// handler routes them, so re-rendering never loses a listener.

const $ = (sel) => document.querySelector(sel);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let tab = "village";
let sheet = null; // open modal: { i } for a plot, { visitor: true } for someone at the gate
let knocked = null; // the visitor whose popup already opened by itself
let plan = { party: [], rations: 6, meals: 0, floor: 1 };

function faceFor(s, hp, hpMax) {
  let m = mood(s);
  if (hp != null) m = hp <= 0 ? "sad" : hp < hpMax * 0.3 ? "scared" : hp < hpMax * 0.7 ? "sad" : m;
  return `assets/face-${s.face}-${s.age}-${m}.webp`;
}
const bar = (v, max, cls = "") =>
  `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, (v / max) * 100))}%"></i></div>`;

function render() {
  if (S.expedition) { if (!["dungeon", "people", "log"].includes(tab)) tab = "dungeon"; }
  else if (tab === "dungeon") tab = "village";
  renderTop();
  if (!living().length) {
    $("#view").innerHTML = iconize(`<div class="card event"><p>Everyone is dead. Millhollow is empty.</p>
      <p class="dim">${S.day} days. Deepest floor: ${S.deepest}.</p></div>`);
    renderLog();
    $("#fight").hidden = true;
    return;
  }
  // A new arrival knocks once, in the village; swiping them away leaves them at the gate.
  if (S.visitor && S.visitor.id !== knocked && tab === "village" && !sheet && !S.expedition) {
    knocked = S.visitor.id;
    sheet = { visitor: true };
  }
  if (sheet && sheet.visitor && !S.visitor) sheet = null;
  const view = { village: viewVillage, people: viewPeople, forge: viewForge, research: viewResearch, expedition: viewExpedition, dungeon: viewDungeon, log: viewLog }[tab];
  $("#view").innerHTML = iconize(view());
  placeLand();
  renderLog();
  renderSheet();
  if (S.expedition && S.expedition.fight) renderFight();
  else $("#fight").hidden = true;
}

function renderTop() {
  // Food and wood always show; the rest appear once there is some.
  $("#res").innerHTML = iconize(`<span class="day">Day ${S.day}</span>` + Object.entries(RESOURCES)
    .filter(([k]) => S.res[k] > 0 || k === "food" || k === "wood")
    .map(([k, r]) => `<span title="${r.name}" data-k="${k}">${r.icon}${S.res[k]}</span>`).join(""));
  $("#menu").innerHTML = iconize("⚙");
  const log = ["log", "Log", "📖"];
  const tabs = S.expedition ? [["dungeon", "Dungeon", "🪜"], ["people", "People", "👥"], log]
    : [["village", "Village", "🏘"], ["people", "People", "👥"], ["forge", "Forge", "⚒"], ["research", "Research", "📚"], log, ["expedition", "Expedition", "🧭"]];
  // Icons carry the tabs; only the one you're on says its name.
  $("#tabs").innerHTML = iconize(tabs.map(([id, name, icon]) =>
    `<button data-act="tab" data-v="${id}" aria-label="${name}" class="${tab === id ? "on" : ""}">${icon}${tab === id ? `<small>${name}</small>` : ""}</button>`).join(""));
}

let logSeen = Infinity; // entries past this are new since the last render and slide in
const logLine = (l) => `<p class="${l.kind} ${l.n > logSeen ? "new" : ""}"><small>d${l.day}</small> ${esc(l.text)}</p>`;
// Every page keeps the last few lines underneath; tapping them opens the whole log.
function renderLog() {
  const el = $("#log");
  el.hidden = tab === "log";
  el.innerHTML = iconize(S.log.slice(-3).reverse().map(logLine).join(""));
  logSeen = S.logN || 0;
}
// Keep main's bottom padding equal to whatever the dock is right now.
if (window.ResizeObserver) new ResizeObserver(([e]) =>
  document.documentElement.style.setProperty("--dock-h", `${e.target.offsetHeight}px`)).observe($("#dock"));

function viewLog() {
  return `<div class="fulllog">${S.log.slice().reverse().map(logLine).join("")}</div>`;
}

// ---------- village ----------
function viewVillage() {
  const v = S.visitor;
  // Someone at the gate whose popup was swiped away: tap to see them again.
  const visitor = v ? `<button class="knock" data-act="knock"><img class="mini" src="${faceSrc(v)}" alt="">
    <b>${esc(v.name)}</b> ${CLASSES[v.cls].icon} <span class="dim">❯</span></button>` : "";
  // Only the known land is drawn, with a ring of fog around it.
  const known = S.seen.map((v, i) => v && xy(i)).filter(Boolean);
  const x0 = Math.max(0, Math.min(...known.map(([x]) => x)) - 1), x1 = Math.min(LAND - 1, Math.max(...known.map(([x]) => x)) + 1);
  const y0 = Math.max(0, Math.min(...known.map(([, y]) => y)) - 1), y1 = Math.min(LAND - 1, Math.max(...known.map(([, y]) => y)) + 1);
  const origin = S.hall ?? MID;
  const tile = (i) => {
    const b = S.grid[i];
    const at = `data-act="plot" data-v="${i}"` + (newLand.includes(i) ? ` style="--d:${dist(i, origin)}"` : "");
    const cls = newLand.includes(i) ? " fresh" : "";
    if (!S.seen[i]) return `<div class="tile fog"></div>`;
    // Untouched land is ground, not a thing: a few small marks with no card around them.
    const t = S.land[i], site = siteAt(i), ico = scatter(i, TERRAIN[t].icon);
    if (site) return `<button class="tile site t-${t}${cls}" ${at}><span class="ico">${SITES[site.kind].icon}</span><small>${esc(site.name)}</small>${site.deepest ? `<span class="lvl">🪜${site.deepest}</span>` : ""}</button>`;
    if (wild(i)) return `<button class="tile wild t-${t}${cls}" ${at}>${ico}</button>`;
    if (t !== "meadow") return `<div class="tile still t-${t}${cls}"${newLand.includes(i) ? ` style="--d:${dist(i, origin)}"` : ""}>${ico}</div>`;
    // Before anything else: the town hall's place, pulsing.
    if (!b) return `<button class="tile empty${cls}${S.hall == null ? " found" : ""}" ${at}>${S.hall == null ? "🏛️" : "＋"}</button>`;
    const def = BUILDINGS[b.type], w = b.worker && byId(b.worker);
    // The worker sits in the corner as a badge, so the icon and name keep the middle.
    const who = w ? `<img class="mini" src="${faceSrc(w)}" alt="${esc(w.name)}">` : "";
    const lvl = b.lvl ? `<span class="lvl">${"●".repeat(b.lvl)}</span>` : "";
    return `<button class="tile${cls}${b.type === "townhall" ? " hall" : ""}" ${at}><span class="ico">${def.icon}</span><small>${def.name}</small>${who}${lvl}</button>`;
  };
  let tiles = "";
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles += tile(y * LAND + x);
  newLand = [];
  // Housing: red only when someone is sleeping rough.
  const n = living().length, over = n > beds();
  return `<div class="land" id="land"><div class="grid" style="--w:${x1 - x0 + 1}" data-x0="${x0}" data-y0="${y0}">${tiles}</div></div>
    <div class="row between"><span class="row"><span class="housing ${over ? "bad" : ""}">🛏️ ${n}/${beds()}</span>
    ${S.hall != null ? `<button class="small ghost" data-act="center" aria-label="Centre">🎯</button>` : ""}</span>
    <button class="primary" data-act="endday">End day ▸</button></div>
    ${visitor}`;
}

// Three marks at spots of the tile's own, so a stretch of woods doesn't look stamped.
function scatter(i, icon) {
  const r = seeded(S.seed + i * 9973), spots = [[8, 10], [52, 6], [30, 40], [62, 46], [12, 58]];
  for (let k = spots.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [spots[k], spots[j]] = [spots[j], spots[k]]; }
  return `<span class="scatter">${spots.slice(0, 3).map(([x, y]) =>
    `<i style="left:${x + r() * 8}%;top:${y + r() * 8}%;--s:${0.22 + r() * 0.12}">${icon}</i>`).join("")}</span>`;
}

function sheetPlot(i) {
  const b = S.grid[i], site = siteAt(i);
  if (site) return sheetSite(site);
  const t = TERRAIN[S.land[i]];
  if (t.clear) {
    return `<h3>${t.icon} ${t.name}</h3><button class="opt" data-act="clear" ${afford(clearCost()) ? "" : "disabled"}>
      <span class="ico">${S.land[i] === "forest" ? "🪓" : "⛏️"}</span><span><b>Clear</b> ${costText(clearCost())} → ${gainText(t.clear)}</span></button>`;
  }
  if (!b) {
    return `<h3>Build</h3>` + Object.entries(BUILDINGS).filter(([id]) => (S.hall == null) === (id === "townhall")).map(([id, d]) => {
      const locked = d.needs && !has(d.needs);
      return `<button class="opt" data-act="build" data-v="${id}" ${locked || !afford(d.cost) ? "disabled" : ""}>
        <span class="ico">${d.icon}</span><span><b>${d.name}</b> ${costText(d.cost)}${besideTag(i, id)}<br><small>${locked ? `🔒 📜 ${RESEARCH[d.needs].name}` : d.desc}</small></span></button>`;
    }).join("");
  }
  const d = BUILDINGS[b.type];
  const back = Object.entries(refundOf(i)).map(([k, v]) => `+${v}${RESOURCES[k].icon}`).join(" ");
  const knock = b.type === "townhall" ? "" : `<button class="danger small" data-act="demolish">Demolish${back ? ` <small>♻ ${back}</small>` : ""}</button>`;
  const lv = b.lvl || 0, pips = IMPROVABLE(b.type) ? ` <span class="pips">${"●".repeat(lv)}${"○".repeat(IMPROVE.length - lv)}</span>` : "";
  let body = `<div class="sheet-head"><h3>${d.icon} ${d.name}${pips}${besideTag(i, b.type)}</h3>${knock}</div><p class="dim desc">${d.desc}</p>`;
  if (d.up) {
    const to = BUILDINGS[d.up.to], locked = to.needs && !has(to.needs);
    body += `<button class="opt" data-act="upgrade" ${canUpgrade(i) ? "" : "disabled"}>
      <span class="ico">⏫</span><span><b>${to.icon} ${to.name}</b> ${costText(d.up.cost)}<br><small>${locked ? `🔒 📜 ${RESEARCH[to.needs].name}` : to.desc}</small></span></button>`;
  }
  const next = IMPROVABLE(b.type) && IMPROVE[lv];
  if (next) {
    body += `<button class="opt" data-act="improve" ${canImprove(i) ? "" : "disabled"}>
      <span class="ico">⏫</span><span><b>+${Math.round(next.boost * 100)}%</b> ${costText(next.cost)}${has(next.needs) ? "" : `<br><small>🔒 📜 ${RESEARCH[next.needs].name}</small>`}</span></button>`;
  }
  if (d.job) {
    // Current worker, then free people, then people who'd leave another building (its icon in the corner).
    // Tapping the current worker takes them off.
    const sk = (s) => s.skills[d.job] || 0;
    const rank = (s) => (s.id === b.worker ? 0 : s.job == null ? 1 : 2);
    const home = living().filter((s) => !away(s)).sort((x, y) => rank(x) - rank(y) || sk(y) - sk(x));
    const best = Math.max(...home.map(sk));
    body += `<div class="who">` + home.map((s) => {
      const here = b.worker === s.id, from = !here && s.job != null && S.grid[s.job];
      const st = here ? `<small class="st here">✓ Working</small>` : from
        ? `<small class="st">${BUILDINGS[from.type].icon} ${BUILDINGS[from.type].name}</small>` : `<small class="st free">Free</small>`;
      return `<button class="${here ? "on" : ""}" data-act="assign" data-v="${here ? 0 : s.id}">
        ${sk(s) >= 0.1 ? `<em class="${sk(s) === best ? "top" : ""}"><i>${d.icon}</i>${sk(s).toFixed(1)}</em>` : ""}
        <img src="${faceSrc(s)}" alt="">
        <b>${esc(s.name)}</b>${st}</button>`;
    }).join("") + `</div>`;
  }
  return body;
}

// A site: how deep it's been walked, how long the road is, who waits every third floor.
function sheetSite(site) {
  const d = SITES[site.kind], k = S.sites.indexOf(site), days = travelDays(site);
  const chips = [site.deepest ? `🪜 ${site.deepest}` : "", days ? `👣 ${days}d` : "", site.boss ? `${d.boss} ${esc(site.boss)}` : ""]
    .filter(Boolean).map((x) => `<span class="chip">${x}</span>`).join("");
  return `<h3>${d.icon} ${esc(site.name)}</h3><div class="row wrap">${chips}</div>
    <button class="primary wide" data-act="tosite" data-v="${k}" ${S.expedition ? "disabled" : ""}>🧭 Set out</button>`;
}

// The land that helps a workplace here, e.g. "🌊+25%".
const besideTag = (i, type) => besideBoost(i, type)
  ? ` <span class="beside">${TERRAIN[BESIDE[type].find((k) => around(i).some((j) => S.land[j] === k))].icon}+${BESIDE_BOOST * 100}%</span>` : "";

// A skill's icon is the building that trains it: 🌾 farming, 🪓 woodcutting…
const jobIcon = (job) => Object.values(BUILDINGS).find((d) => d.job === job).icon;

function sheetVisitor() {
  const v = S.visitor, c = CLASSES[v.cls], st = stats(v), full = living().length >= beds();
  const skills = Object.entries(v.skills).filter(([, x]) => x >= 0.1)
    .map(([k, x]) => `<span class="chip">${jobIcon(k)} ${x.toFixed(1)}</span>`).join("");
  return `<div class="arrival">
    <img class="face" src="${faceSrc(v)}" alt="">
    <h3>${esc(v.name)}</h3>
    <div>${c.icon} ${c.name}</div>
    <div class="stats">${statLine(st, "❤️" + st.hpMax)}</div>
    <div class="row wrap">${skills}${full ? `<span class="chip bad">🛏️ ${living().length}/${beds()}</span>` : ""}</div>
    <div class="row pair"><button data-act="visitor" data-v="0">Turn away</button><button class="primary" data-act="visitor" data-v="1">Accept</button></div>
  </div>`;
}

const statLine = (st, hp = "") => [hp, `⚔${st.atk}`, `🛡${st.def}`, `💨${st.spd}`].filter(Boolean)
  .map((x) => `<span>${x}</span>`).join("");

// ---------- people ----------
// A card is a glance: who, how hurt, how they feel, what they hit for. Everything else is in their sheet.
function settlerCard(s) {
  const st = stats(s), c = CLASSES[s.cls];
  const feel = fresh(s).sort((x, y) => y.n - x.n).slice(0, 3)
    .map((x) => `<span class="${THOUGHTS[x.k].morale > 0 ? "good" : "bad"}" title="${THOUGHTS[x.k].name}">${THOUGHTS[x.k].icon}</span>`).join("");
  return `<div class="card person" data-act="person" data-v="${s.id}">
    <img class="face" src="${faceSrc(s)}" alt="">
    <div class="grow">
      <div class="row between"><span><b>${esc(s.name)}</b> <small class="dim">lv ${s.level}</small> <small class="dim">${jobText(s)}</small></span><small class="cls">${c.icon} ${c.name}</small></div>
      ${bar(s.hp, st.hpMax, "hp")}
      <div class="row between"><span class="feel">${moraleFace(s)}${feel}</span><span class="stats">${statLine(st)}</span></div>
    </div></div>`;
}
// Where they are: the building they work, the dungeon, or nothing when idle.
const jobText = (s) => s.job != null && S.grid[s.job] ? BUILDINGS[S.grid[s.job].type].icon : away(s) ? "🪜" : "";
const moraleFace = (s) => `<span title="Morale">${s.morale >= 75 ? "😄" : s.morale >= 50 ? "🙂" : s.morale >= 30 ? "😐" : "😠"} ${s.morale}</span>`;

function gearRow(s) {
  const gear = ["weapon", "armor"].map((slot) => {
    const g = s.gear[slot];
    return g ? `<button class="chip" data-act="unequip" data-v="${s.id}" data-slot="${slot}">${esc(g.name)} ✕</button>`
      : `<span class="chip dim">no ${slot}</span>`;
  }).join("");
  const stash = S.stash || [];
  return `<div class="row wrap center">${gear}
    ${stash.length && !away(s) ? `<select data-act="equip" data-v="${s.id}"><option value="">Equip…</option>${stash.map((g) =>
      `<option value="${g.uid}">${esc(g.name)} (${gearText(g)})</option>`).join("")}</select>` : ""}
    <button class="chip" data-act="row" data-v="${s.id}">${(s.row || defaultRow(s.cls)) === "front" ? "Front row" : "Back row"}</button></div>`;
}
const gearText = (g) => ["atk", "def", "hp", "spd"].filter((k) => g[k]).map((k) => `${k} ${g[k] > 0 ? "+" : ""}${g[k]}`).join(", ");

const moraleChip = (s) => `<span class="thought">${moraleFace(s)}</span>`;
const thoughtChip = (x) => {
  const t = THOUGHTS[x.k], v = t.morale;
  return `<span class="thought ${v > 0 ? "good" : "bad"}" title="${t.name}">${t.icon} ${v > 0 ? "+" : "−"}${Math.abs(v)}</span>`;
};

function viewPeople() {
  const dead = S.settlers.filter((s) => s.dead);
  return living().map(settlerCard).join("") + (dead.length ? `<h4>🪦</h4><div class="remembered">${dead.map((s) =>
    `<button data-act="person" data-v="${s.id}"><img class="mini" src="${faceSrc(s)}" alt="">${esc(s.name)}</button>`).join("")}</div>` : "");
}

// Someone's own story: how they feel now, then what happened to and around them, newest first.
function sheetPerson() {
  const s = byId(sheet.person), c = CLASSES[s.cls];
  const days = (e) => e.to > e.day ? `d${e.day}–${e.to}` : `d${e.day}`;
  const line = (e) => {
    if (e.kind === "past") return `<p class="past">${esc(e.text)}</p>`;
    if (!e.k) return `<p class="${e.kind || ""}"><small>${days(e)}</small> ${esc(e.text)}</p>`;
    const t = THOUGHTS[e.k];
    return `<p class="felt ${t.morale > 0 ? "good" : "bad"}"><small>${days(e)}</small> ${t.icon} ${t.name}${e.x > 1 ? ` ×${e.x}` : ""}</p>`;
  };
  const st = stats(s);
  const skills = Object.entries(s.skills).filter(([, x]) => x >= 0.1)
    .map(([k, x]) => `<span class="chip">${jobIcon(k)} ${x.toFixed(1)}</span>`).join("");
  return `<div class="arrival ${s.dead ? "gone" : ""}">
    <img class="face" src="${faceSrc(s)}" alt="">
    <h3>${esc(s.name)}</h3>
    <div>${c.icon} ${c.name} · lv ${s.level}${jobText(s) ? ` · ${jobText(s)}` : ""}</div>
    ${s.dead ? "" : `<div class="hpline">${bar(s.hp, st.hpMax, "hp")}</div>
    <div class="stats">${statLine(st, `❤️${s.hp}/${st.hpMax}`)}</div>
    <div class="thoughts">${moraleChip(s)}${fresh(s).sort((x, y) => y.n - x.n).map(thoughtChip).join("")}</div>
    <div class="row wrap center">${skills}</div>
    ${gearRow(s)}`}
  </div>
  <div class="lifelog">${(s.story || []).slice().reverse().map(line).join("")}</div>`;
}

// ---------- forge / research ----------
function viewForge() {
  if (!S.grid.some((b) => b && b.type === "forge")) return `<p class="dim">Build a forge first.</p>`;
  if (!staffed("forge")) return `<p class="dim">The forge needs a worker.</p>`;
  const recipes = RECIPES.map((r) => {
    const locked = r.needs && !has(r.needs);
    return `<button class="opt" data-act="craft" data-v="${r.id}" ${locked || !afford(r.cost) ? "disabled" : ""}>
      <span><b>${r.name}</b> ${costText(r.cost)}<br><small>${locked ? `🔒 📜 ${RESEARCH[r.needs].name}` : gearText(r)}</small></span></button>`;
  }).join("");
  const potion = has("herbalism") ? `<button class="opt" data-act="brew" ${S.res.herbs < 3 ? "disabled" : ""}><span><b>Potion</b> ${costText({ herbs: 3 })}<br><small>Heals 20 in a fight.</small></span></button>` : "";
  const stash = (S.stash || []).map((g) => `<span class="chip">${esc(g.name)} (${gearText(g)})</span>`).join("") || `<span class="dim">Empty. Equip from People.</span>`;
  return recipes + potion + `<h4>Stores</h4><div class="row wrap">${stash}</div>`;
}

function viewResearch() {
  const lib = S.grid.some((b) => b && b.type === "library");
  return `<p class="dim">${lib ? "Staffed library: 1🏺 → research per day." : "Needs a library and relics (🏺) from the dungeon."}</p>` +
    Object.entries(RESEARCH).map(([id, r]) => {
      const locked = r.after && !has(r.after);
      return `<button class="opt ${has(id) ? "on" : ""}" data-act="research" data-v="${id}" ${has(id) || locked || S.res.research < r.cost ? "disabled" : ""}>
      <span><b>${r.name}</b> ${has(id) ? "✓" : costText({ research: r.cost })}<br><small>${locked ? `🔒 📜 ${RESEARCH[r.after].name}` : r.desc}</small></span></button>`;
    }).join("");
}

// ---------- expedition ----------
function viewExpedition() {
  const ready = living().filter((s) => s.hp > 0);
  plan.party = plan.party.filter((id) => ready.some((s) => s.id === id));
  plan.rations = Math.min(plan.rations, S.res.food);
  plan.meals = Math.min(plan.meals || 0, S.res.meals);
  const known = S.sites.filter((x) => S.seen[x.i]);
  if (!known.includes(S.sites[plan.site || 0])) plan.site = 0;
  const site = S.sites[plan.site || 0], days = travelDays(site);
  plan.floor = Math.min(plan.floor, site.deepest + 1);
  const floors = Array.from({ length: site.deepest + 1 }, (_, k) => k + 1);
  const where = known.length > 1 ? `<div class="sites">${known.map((x) => `<button class="${x === site ? "on" : ""}" data-act="site" data-v="${S.sites.indexOf(x)}"
    aria-label="${esc(x.name)}">${SITES[x.kind].icon}</button>`).join("")}</div>` : "";
  const per = (k) => `${roomsPer(k)} ${roomsPer(k) > 1 ? "rooms" : "room"}`;
  const cook = has("smoking") || S.res.meals > 0;
  const stepper = (act, icon, n) => `<div class="row between"><span>${icon}</span><span class="row">
      <button data-act="${act}" data-v="-1" data-hold>−</button><b>${n}</b><button data-act="${act}" data-v="1" data-hold>＋</button></span></div>`;
  return `${where}<div class="row between"><h3>${SITES[site.kind].icon} ${esc(site.name)}</h3>${days ? `<span class="chip">👣 ${days}d</span>` : ""}</div>
    <p class="dim">Party of up to ${partyMax()}. 🍞 ${per("food")}${cook ? ` · 🥪 ${per("meals")}, +${MEAL_HEAL}❤️` : ""}. No food: starving. Death is permanent.</p>
    ${ready.map((s) => {
      const on = plan.party.includes(s.id), st = stats(s);
      return `<button class="opt ${on ? "on" : ""}" data-act="pick" data-v="${s.id}">
        <img class="mini" src="${faceSrc(s)}" alt=""><span><b>${esc(s.name)}</b> ${CLASSES[s.cls].icon} lv ${s.level}
        <br><small>HP ${s.hp}/${st.hpMax} · ${(s.row || defaultRow(s.cls))} row${s.job != null ? " · leaves their work" : ""}</small></span></button>`;
    }).join("")}
    ${stepper("rations", "🍞", plan.rations)}${cook ? stepper("meals", "🥪", plan.meals) : ""}
    <div class="row between"><span>Start at floor</span><select data-act="floor">${floors.map((f) =>
      `<option ${f === plan.floor ? "selected" : ""}>${f}</option>`).join("")}</select></div>
    <button class="primary wide" data-act="depart" ${plan.party.length ? "" : "disabled"}>Set out</button>`;
}

const ROOM_ICON = { entrance: "🚪", fight: "⚔️", boss: "☠️", treasure: "💰", empty: "·", shrine: "⛲", event: "❔", stairs: "🪜" };

function viewDungeon() {
  const e = S.expedition, m = e.map, near = neighbours(m.rooms, m.at);
  let cells = "";
  for (let y = 0; y < MAP; y++) for (let x = 0; x < MAP; x++) {
    const k = `${x},${y}`, r = m.rooms[k];
    if (!r || !r.seen) { cells += `<div class="room none"></div>`; continue; }
    const show = r.done || r.type === "entrance" || (has("lanterns") && near.includes(k)) || r.type === "stairs" && r.done;
    const here = m.at === k, can = !here && canMove(k);
    cells += `<button class="room ${here ? "here" : ""} ${r.done ? "done" : ""}" data-k="${k}" ${can ? `data-act="move" data-v="${k}"` : "disabled"}>
      ${here ? "🔦" : show ? ROOM_ICON[r.type] : "?"}</button>`;
  }
  const r = m.rooms[m.at];
  const party = e.party.map(byId).map((s) => `<div class="pc ${s.dead ? "dead" : ""}"><img class="mini" src="${faceFor(s)}" alt="">
    <small>${esc(s.name)}</small>${bar(s.dead ? 0 : s.hp, stats(s).hpMax, "hp")}</div>`).join("");
  const loot = Object.entries(e.loot).filter(([, n]) => n).map(([k, n]) => `${n}${RESOURCES[k].icon}`).concat(e.gear.map((g) => esc(g.name))).join(" ") || "nothing yet";
  let panel = "";
  if (e.event) {
    const ev = EVENTS.find((x) => x.id === e.event);
    panel = `<div class="card event"><p>${ev.text}</p><div class="row wrap">${ev.choices.map((c) =>
      `<button data-act="event" data-v="${c.act}">${c.label}</button>`).join("")}</div></div>`;
  } else {
    const down = ["stairs", "boss"].includes(r.type) && r.done;
    panel = `<div class="row wrap">${down ? `<button class="primary" data-act="descend">Down to floor ${m.floor + 1}</button>` : ""}
      <button data-act="home">Head home (${homeDays()}d)</button></div>`;
  }
  return `<div class="row between"><b>${SITES[siteOf().kind].icon} ${esc(siteOf().name)} · ${m.floor}</b><small>🍞 ${e.rations}${e.meals ? ` 🥪 ${e.meals}` : ""} · 🧪 ${S.res.potions}</small></div>
    <div class="party">${party}</div>
    <div class="map" style="--w:${MAP}">${cells}</div>
    <p class="dim small">Carrying: ${loot}</p>${panel}`;
}

// ---------- fight ----------
let fightBuilt = null;
function renderFight() {
  const f = S.expedition.fight, box = $("#fight");
  box.hidden = false;
  if (fightBuilt !== f) {
    fightBuilt = f;
    box.innerHTML = iconize(`<div class="fightbox">
      <div class="foes">${f.enemies.map((en, i) => `<button class="foe ${en.aoeEvery ? "boss" : ""}" style="--i:${i}" data-act="focus" data-v="${i}">
        <span class="ico">${en.icon}</span><small>${esc(en.name)}</small>${bar(en.hp, en.hpMax, "hp")}${bar(0, 100, "atb")}</button>`).join("")}</div>
      <div class="lines" id="flines"></div>
      <div class="heroes">${f.heroes.map((h, i) => { const s = byId(h.id); return `<div class="hero">
        <img class="face" alt=""><div class="grow"><b>${esc(h.name)}</b> <small class="dim">${h.row}</small>
        ${bar(h.hp, h.hpMax, "hp")}${bar(0, 100, "atb")}
        <div class="row"><small class="skill"></small>
        <button class="chip potion" data-act="potion" data-v="${i}"></button></div></div></div>`; }).join("")}</div>
      <div class="row wrap controls" id="fctl"></div></div>`);
  }
  tickFight();
}

function tickFight() {
  const f = S.expedition && S.expedition.fight;
  if (!f || fightBuilt !== f) return;
  document.querySelectorAll(".foe").forEach((el, i) => {
    const en = f.enemies[i];
    el.querySelector(".hp i").style.width = `${(en.hp / en.hpMax) * 100}%`;
    el.querySelector(".atb i").style.width = `${Math.min(100, en.gauge)}%`;
    el.classList.toggle("dead", en.hp <= 0);
    el.classList.toggle("focus", f.focus === i);
    el.classList.toggle("flash", en.flash > 0);
  });
  document.querySelectorAll(".hero").forEach((el, i) => {
    const h = f.heroes[i], s = byId(h.id), skill = el.querySelector(".skill");
    el.querySelector(".face").src = faceFor(s, h.hp, h.hpMax);
    el.querySelector(".hp i").style.width = `${(h.hp / h.hpMax) * 100}%`;
    el.querySelector(".atb i").style.width = `${Math.min(100, h.gauge)}%`;
    el.querySelector("b").textContent = `${h.name} ${Math.ceil(h.hp)}/${h.hpMax}`;
    skill.textContent = `${CLASSES[h.cls].skill.name}${h.cd > 0 ? ` ${Math.ceil(h.cd)}s` : " ready"}`;
    skill.title = CLASSES[h.cls].skill.desc;
    el.classList.toggle("dead", h.hp <= 0);
    el.classList.toggle("flash", h.flash > 0);
    el.classList.toggle("healed", h.healed > 0);
    // One tap drinks a potion: shows how many are left, gone when there are none.
    const pot = el.querySelector(".potion");
    pot.hidden = S.res.potions <= 0;
    pot.disabled = h.hp <= 0 || h.hp >= h.hpMax || f.over;
    const n = `×${S.res.potions}`;
    if (pot.dataset.n !== n) { pot.innerHTML = iconize(`🧪${n}`); pot.dataset.n = n; }
  });
  $("#flines").innerHTML = iconize(f.lines.map((l) => `<p>${esc(l)}</p>`).join(""));
  const ctl = f.over
    ? `<button class="primary wide" data-act="fightdone">${f.over === "won" ? "Victory. Carry on." : f.over === "fled" ? "Fall back" : "It's over"}</button>`
    : `<button class="primary" data-act="pause">${f.paused ? "▶ Fight" : "⏸ Pause"}</button>
       <button data-act="speed">${f.speed}×</button>
       <button class="danger" data-act="flee">Flee</button>`;
  const key = `${f.over}|${f.paused}|${f.speed}`;
  if ($("#fctl").dataset.k !== key) { $("#fctl").innerHTML = iconize(ctl); $("#fctl").dataset.k = key; }
}

setInterval(() => {
  const f = S && S.expedition && S.expedition.fight;
  if (!f || f.paused || f.over) return;
  step(f, 0.1);
  if (f.over) f.paused = true;
  tickFight();
  playFx(f);
}, 100);

// ---------- fight juice ----------
const elFor = (u) => document.querySelectorAll(u.side === "h" ? ".hero" : ".foe")[u.idx];

function playFx(f) {
  const box = $(".fightbox");
  let lag = 0; // a volley's arrows leave one after another, not as one blob
  for (const e of f.fx.splice(0)) {
    if (e.t === "hit") {
      const a = elFor(e.from), b = elFor(e.to);
      if (!a || !b) continue;
      const land = () => {
        const p = Juice.center(b, 0.4), hurt = e.to.side === "h";
        Juice.burst(p.x, p.y, { n: e.crit ? 24 : 10, colors: hurt ? PAL.blood : PAL.steel, spark: true, speed: e.crit ? 340 : 210, life: 0.4, gravity: 200 });
        Juice.float(p.x, p.y - 12, e.crit ? `${e.d}!` : e.d, e.crit ? "crit" : hurt ? "hurt" : "");
        Juice.shake(b, e.crit ? 8 : 4);
        if (e.crit) Juice.shake(box, 4);
      };
      const from = Juice.center(a), to = Juice.center(b, 0.3), dy = e.from.side === "h" ? -14 : 14;
      if (e.kind === "arrow") {
        setTimeout(() => Juice.shot(from, to, { color: "#fff4d6", size: 2, dur: 0.16, arc: 18, onHit: land }), lag);
        lag += 70;
      } else if (e.kind === "orb") {
        const colors = e.from.side === "h" ? PAL.arcane : PAL.shadow;
        setTimeout(() => Juice.shot(from, to, { color: colors[0], size: 4, dur: 0.24, trail: 1, onHit: land }), lag);
        lag += 70;
      } else if (e.kind === "fire") {
        Juice.shot(from, to, {
          color: "#ff8a3d", size: 7, dur: 0.32, arc: 24, trail: 3, onHit: () => {
            land();
            Juice.burst(to.x, to.y, { n: 44, colors: PAL.fire, speed: 320, up: 60, life: 0.7, size: 4 });
            Juice.shake(box, 9);
          },
        });
      } else {
        Juice.lunge(a, e.kind === "aoe" ? dy * 1.6 : dy);
        setTimeout(land, 80);
        if (e.kind === "cleave") {
          Juice.burst(to.x, to.y, { n: 16, colors: PAL.steel, spark: true, speed: 420, angle: 0, spread: 0.5, life: 0.3, gravity: 0 });
          Juice.burst(to.x, to.y, { n: 16, colors: PAL.steel, spark: true, speed: 420, angle: Math.PI, spread: 0.5, life: 0.3, gravity: 0 });
          Juice.shake(box, 5);
        }
      }
    } else if (e.t === "heal") {
      const b = elFor(e.to);
      if (!b) continue;
      const p = Juice.center(b);
      Juice.burst(p.x, p.y + 10, { n: 22, colors: PAL.heal, speed: 70, up: 90, gravity: -120, life: 0.9, size: 3 });
      Juice.float(p.x, p.y - 12, `+${e.n}`, "heal");
    } else if (e.t === "skill") {
      const a = elFor(e.u);
      if (!a) continue;
      const p = Juice.center(a);
      Juice.float(p.x, p.y - 30, `${e.name}!`, "skillname");
      Juice.burst(p.x, p.y, { n: 14, colors: PAL.gold, speed: 120, gravity: -40, life: 0.5, size: 2 });
    } else if (e.t === "die") {
      const b = elFor(e.u);
      if (!b) continue;
      const p = Juice.center(b);
      Juice.burst(p.x, p.y, { n: 34, colors: e.u.side === "h" ? [...PAL.blood, ...PAL.shadow] : PAL.shadow, speed: 160, up: 60, gravity: -60, life: 1, size: 4 });
      Juice.shake(e.u.side === "h" ? box : b, 7);
    } else if (e.t === "aoe") {
      const a = elFor(e.u);
      if (!a) continue;
      const p = Juice.center(a);
      Juice.burst(p.x, p.y, { n: 50, colors: PAL.blood, spark: true, speed: 520, drag: 0.8, gravity: 0, life: 0.55, size: 4 });
      Juice.shake(box, 12, 400);
    } else if (e.t === "won") {
      if (!box) continue;
      box.classList.add("victory");
      const r = box.getBoundingClientRect();
      Juice.float(r.left + r.width / 2, r.top + r.height / 2, "Victory", "banner");
      for (let i = 0; i < 5; i++) setTimeout(() => Juice.burst(r.left + r.width * (0.1 + 0.2 * i), r.top + 30,
        { n: 26, colors: [...PAL.gold, "#9fe07a", "#b9a4d6"], speed: 240, up: 240, gravity: 520, life: 1.3, size: 4, drag: 0.95 }), i * 90);
    } else if (e.t === "lost") {
      if (!box) continue;
      box.classList.add("defeat");
      const r = box.getBoundingClientRect();
      Juice.float(r.left + r.width / 2, r.top + r.height / 2, "Defeat", "banner bad");
    } else if (e.t === "fled") {
      document.querySelectorAll(".hero:not(.dead)").forEach((h) => {
        const p = Juice.center(h);
        Juice.burst(p.x, p.y + 20, { n: 18, colors: PAL.dust, speed: 140, up: 40, gravity: 60, life: 0.8, size: 5 });
      });
    }
  }
}

// ---------- sheet ----------
// Slides up when it opens and down when it closes, however it closes (tap outside,
// picking something, or dragging it down like an iOS sheet).
const calmMotion = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
let sheetShut = 0;

// GitHub's mark (Octicons, MIT); brand marks aren't in the icon sets.
const GITHUB_MARK = `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

// Settings live behind the gear; wiping the save takes a second, deliberate tap.
function sheetMenu() {
  const swatch = (t) => `<button class="${t.id === theme.id ? "on" : ""}" data-act="theme" data-v="${t.id}" style="background:${t.bg};color:${t.ink}">
    <span class="sw"><i style="background:${t.accent}"></i>${["red", "yellow", "green", "blue", "purple"].map((h) => `<i style="background:${t[h]}"></i>`).join("")}</span>
    <small style="background:${t.card}">${t.name}</small></button>`;
  const saves = `<div class="saves">
    <textarea id="savecode" rows="3" spellcheck="false" autocomplete="off" placeholder="mh1:…"></textarea>
    <div class="row pair">
      <button data-act="savecopy">📋<small>Copy</small></button><button data-act="savefile">💾<small>Save file</small></button>
      <button data-act="saveopen">📂<small>Open file</small></button><button data-act="saveload">📥<small>Load</small></button>
    </div><input id="savepick" type="file" accept=".txt,.json,text/plain,application/json" hidden></div>`;
  return `<div class="menu"><div class="themes">${THEMES.map(swatch).join("")}</div>${saves}` + (sheet.sure
    ? `<div class="row pair"><button data-act="close">Keep playing</button><button class="danger" data-act="wipe">Delete save</button></div>`
    : `<button class="danger wide" data-act="newgame">New game</button>`) + `<a class="src" href="https://github.com/octoshrimpy/millhollow" target="_blank" rel="noopener">${GITHUB_MARK}<small>Source</small></a></div>`;
}

function renderSheet() {
  const box = $("#sheet"), inner = box.querySelector(".inner");
  if (!sheet) {
    if (box.hidden || box.classList.contains("closing")) return;
    box.classList.add("closing");
    box.classList.remove("open");
    sheetShut = setTimeout(() => {
      box.hidden = true;
      box.classList.remove("closing");
      inner.style.transform = box.style.background = "";
    }, calmMotion ? 0 : 220);
    return;
  }
  clearTimeout(sheetShut);
  if (box.hidden || box.classList.contains("closing")) {
    box.classList.remove("closing");
    inner.style.transform = box.style.background = "";
    box.hidden = false;
    box.classList.add("open");
  }
  // A built plot's sheet is one tap (pick a worker) or a tap outside; only the long build list keeps Close.
  inner.innerHTML = iconize(sheet.menu ? sheetMenu() : sheet.visitor ? sheetVisitor() : sheet.person ? sheetPerson()
    : sheetPlot(sheet.i) + (S.grid[sheet.i] || wild(sheet.i) ? "" : `<button class="wide" data-act="close">Close</button>`));
}

(() => {
  const box = $("#sheet"), inner = box.querySelector(".inner");
  let y0 = null, t0 = 0, dy = 0, dragged = false;
  inner.addEventListener("touchstart", (e) => {
    y0 = inner.scrollTop <= 0 ? e.touches[0].clientY : null;
    t0 = performance.now(); dy = 0; dragged = false;
  }, { passive: true });
  inner.addEventListener("touchmove", (e) => {
    if (y0 == null) return;
    dy = e.touches[0].clientY - y0;
    if (dy <= 0 && !dragged) { y0 = null; return; } // scrolling up the content, not a drag
    e.preventDefault();
    dragged = dragged || dy > 6;
    const d = Math.max(0, dy);
    inner.style.transition = "none";
    inner.style.transform = `translateY(${d}px)`;
    box.style.background = `rgba(0,0,0,${0.67 * Math.max(0, 1 - d / inner.offsetHeight)})`;
  }, { passive: false });
  inner.addEventListener("touchend", () => {
    if (y0 == null) return;
    y0 = null;
    inner.style.transition = "";
    const fast = dy / (performance.now() - t0) > 0.5;
    if (dy > inner.offsetHeight * 0.3 || (fast && dy > 30)) run("close");
    else { inner.style.transform = ""; box.style.background = ""; }
  });
  // A drag that ends over a button shouldn't press it.
  inner.addEventListener("click", (e) => { if (dragged) { e.stopPropagation(); dragged = false; } }, true);
})();

// ---------- land ----------
// The land keeps its place between renders as the map spot at the middle of the window, so
// newly revealed rows don't shift it. The first look is at the town hall.
let landPos = null;
const landGeo = (land) => {
  const g = land.firstElementChild, [a, b] = g.children;
  const step = b.offsetLeft - a.offsetLeft;
  return step > 0 && { step, ox: a.offsetLeft, oy: a.offsetTop, x0: +g.dataset.x0, y0: +g.dataset.y0 };
};
function placeLand(smooth) {
  const land = $("#land"), geo = land && landGeo(land);
  if (!geo) return;
  const [hx, hy] = xy(S.hall ?? MID);
  const [mx, my] = smooth || !landPos ? [hx + 0.5, hy + 0.5] : landPos;
  land.scrollTo({ left: geo.ox + (mx - geo.x0) * geo.step - land.clientWidth / 2,
    top: geo.oy + (my - geo.y0) * geo.step - land.clientHeight / 2, behavior: smooth ? "smooth" : "instant" });
  if (!smooth) landPos = [mx, my];
}
document.addEventListener("scroll", (e) => {
  const land = e.target.id === "land" && e.target, geo = land && landGeo(land);
  if (geo) landPos = [geo.x0 + (land.scrollLeft + land.clientWidth / 2 - geo.ox) / geo.step,
    geo.y0 + (land.scrollTop + land.clientHeight / 2 - geo.oy) / geo.step];
}, true);
// Touch pans natively; a mouse drags. A drag isn't a tap on the tile it ends on.
(() => {
  let from = null, moved = false;
  document.addEventListener("pointerdown", (e) => {
    const land = e.pointerType === "mouse" && e.target.closest("#land");
    from = land && { x: e.clientX, y: e.clientY, l: land.scrollLeft, t: land.scrollTop };
    moved = false;
  });
  document.addEventListener("pointermove", (e) => {
    const land = from && $("#land");
    if (!land) return;
    const dx = e.clientX - from.x, dy = e.clientY - from.y;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    moved = true;
    land.classList.add("drag");
    land.scrollLeft = from.l - dx;
    land.scrollTop = from.t - dy;
  });
  window.addEventListener("pointerup", () => { from = null; const l = $("#land"); if (l) l.classList.remove("drag"); });
  document.addEventListener("click", (e) => { if (moved) { moved = false; e.stopPropagation(); e.preventDefault(); } }, true);
})();

// ---------- input ----------
// Buttons marked data-hold repeat while held, faster the longer the hold. The page re-renders
// under the finger, so the repeat runs off the action name, not the element.
(() => {
  let timer = null, repeated = false;
  const stop = () => { clearTimeout(timer); timer = null; };
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest("[data-hold]");
    if (!el || el.disabled) return;
    const act = el.dataset.act, v = el.dataset.v;
    repeated = false;
    let wait = 380;
    const tick = () => {
      repeated = true;
      run(act, v);
      wait = Math.max(40, wait * 0.8);
      timer = setTimeout(tick, wait);
    };
    stop();
    timer = setTimeout(tick, wait);
  });
  ["pointerup", "pointercancel", "blur"].forEach((ev) => window.addEventListener(ev, stop));
  document.addEventListener("contextmenu", (e) => { if (e.target.closest("[data-hold]")) e.preventDefault(); });
  // The release after a repeat isn't one more tap.
  document.addEventListener("click", (e) => {
    if (repeated) { repeated = false; e.stopPropagation(); e.preventDefault(); }
  }, true);
})();
const ACTS = {
  tab: (v) => { tab = v; sheet = null; },
  menu: () => (sheet = { menu: true }),
  theme: (v) => { applyTheme(v); },
  newgame: () => (sheet = { menu: true, sure: true }),
  wipe: () => { newGame(); landPos = null; plan = { party: [], rations: 6, meals: 0, floor: 1 }; tab = "village"; sheet = null; knocked = null; },
  plot: (v) => (sheet = { i: +v }),
  close: () => (sheet = null),
  clear: () => { clearLand(sheet.i); sheet = null; },
  build: (v) => {
    build(sheet.i, v);
    sheet = null;
    if (v === "townhall") setTimeout(() => placeLand(true), 60);
  },
  center: () => { placeLand(true); return "keep"; },
  demolish: () => {
    const back = Object.entries(refundOf(sheet.i)).map(([k, v]) => `${v} ${RESOURCES[k].name.toLowerCase()}`).join(", ");
    if (confirm(back ? `Demolish? Get back ${back}.` : "Demolish? No refund.")) { demolish(sheet.i); sheet = null; }
  },
  upgrade: () => upgrade(sheet.i),
  improve: () => improve(sheet.i),
  assign: (v) => { assign(sheet.i, +v); sheet = null; },
  endday: () => passDays(1),
  visitor: (v) => { welcomeVisitor(v === "1"); sheet = null; },
  knock: () => (sheet = { visitor: true }),
  person: (v) => (sheet = { person: +v }),
  unequip: (v, el) => unequip(+v, el.dataset.slot),
  row: (v) => { const s = byId(+v); s.row = (s.row || defaultRow(s.cls)) === "front" ? "back" : "front"; save(); },
  craft: (v) => craft(v),
  brew: () => brew(),
  research: (v) => doResearch(v),
  pick: (v) => {
    const id = +v, i = plan.party.indexOf(id);
    if (i >= 0) plan.party.splice(i, 1);
    else if (plan.party.length < partyMax()) plan.party.push(id);
  },
  rations: (v) => (plan.rations = Math.max(0, Math.min(S.res.food, plan.rations + +v))),
  meals: (v) => (plan.meals = Math.max(0, Math.min(S.res.meals, (plan.meals || 0) + +v))),
  depart: () => depart(plan.party, plan.rations, plan.floor, plan.meals || 0, plan.site || 0),
  site: (v) => { plan.site = +v; plan.floor = 1; },
  tosite: (v) => { plan.site = +v; plan.floor = 1; tab = "expedition"; sheet = null; },
  move: (v) => move(v),
  event: (v) => resolveEvent(v),
  descend: () => descend(),
  home: () => returnHome(),
  focus: (v) => { const f = S.expedition.fight; f.focus = f.enemies[+v].hp > 0 ? +v : null; tickFight(); return "keep"; },
  potion: (v) => { usePotion(+v); tickFight(); renderTop(); playFx(S.expedition.fight); return "keep"; },
  pause: () => { const f = S.expedition.fight; f.paused = !f.paused; tickFight(); return "keep"; },
  speed: () => { const f = S.expedition.fight; f.speed = f.speed >= 3 ? 1 : f.speed + 1; tickFight(); return "keep"; },
  flee: () => { flee(S.expedition.fight); tickFight(); playFx(S.expedition.fight); return "keep"; },
  fightdone: () => { endFight(S.expedition.fight.over); fightBuilt = null; },
  // Save import/export works on the open sheet in place, so none of these re-render it.
  savecopy: () => {
    exportSave().then((code) => {
      $("#savecode").value = code;
      $("#savecode").select();
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
        // Plain http (the LAN address) has no clipboard API; the old copy command still works there.
        .catch(() => { if (!document.execCommand("copy")) throw 0; })
        .then(() => Juice.toast("📋 ✓", "good"), () => {});
    });
    return "keep";
  },
  savefile: () => {
    exportSave().then((code) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
      a.download = `millhollow-day${S.day}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    return "keep";
  },
  saveopen: () => { $("#savepick").click(); return "keep"; },
  saveload: () => { loadCode($("#savecode").value); return "keep"; },
};

function loadCode(text) {
  if (!String(text).trim()) { $("#savecode").focus(); return; }
  if (!confirm("Replace this game?")) return;
  importSave(text).then(() => {
    plan = { party: [], rations: 6, meals: 0, floor: 1 };
    tab = "village"; sheet = null; knocked = null; landPos = null; fightBuilt = null; logSeen = Infinity;
    render();
    Juice.toast(`📥 Day ${S.day}`, "good");
  }, () => {
    const box = $("#savecode");
    if (box) { box.value = text; box.classList.remove("nope"); void box.offsetWidth; box.classList.add("nope"); }
  });
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el || el.tagName === "SELECT" || el.disabled) return;
  if (el.id === "sheet" && e.target !== el) return;
  const act = el.id === "sheet" ? "close" : el.dataset.act;
  run(act, el.dataset.v, el);
});

// Every action is bracketed by a snapshot, so the juice comes from what actually
// changed rather than from hooks scattered through game.js.
function run(act, v, el) {
  const before = snap();
  if (ACTS[act](v, el) === "keep") return;
  render();
  celebrate(before);
}

function snap() {
  const e = S.expedition;
  return {
    res: { ...S.res }, day: S.day, logN: S.logN || 0, grid: S.grid.map((b) => b && b.type),
    exp: e && { at: e.map.at, floor: e.map.floor, seen: Object.keys(e.map.rooms).filter((k) => e.map.rooms[k].seen) },
  };
}

const LOUD = /now level|died|joined|Learned|wiped out/;

function celebrate(b) {
  const e = S.expedition;
  for (const k in S.res) {
    const d = Math.round((S.res[k] - b.res[k]) * 10) / 10, el = document.querySelector(`#res [data-k="${k}"]`);
    if (!d || !el) continue;
    Juice.pop(el, 1.35);
    const p = Juice.center(el);
    Juice.float(p.x, p.y + 16, `${d > 0 ? "+" : ""}${d}`, `res ${d > 0 ? "up" : "down"}`);
  }

  if (S.day > b.day) {
    Juice.pop(document.querySelector("#res .day"), 1.4);
    const v = $("#view");
    v.classList.remove("dawn"); void v.offsetWidth; v.classList.add("dawn");
    const tiles = document.querySelectorAll(".grid .tile");
    lastYields.forEach(({ i, got }, n) => Object.entries(got).forEach(([k, amt], j) => setTimeout(() => {
      if (!tiles[i]) return;
      const p = Juice.center(tiles[i]);
      Juice.float(p.x, p.y - 6, `+${Math.round(amt * 10) / 10}${RESOURCES[k].icon}`, "yield");
      Juice.burst(p.x, p.y, { n: 6, colors: PAL.gold, speed: 60, up: 60, gravity: -30, life: 0.6, size: 2 });
    }, 150 + n * 70 + j * 260)));
  }

  S.grid.forEach((t, i) => {
    if ((t && t.type) === b.grid[i]) return;
    const el = document.querySelectorAll(".grid .tile")[i];
    if (!el) return;
    const p = Juice.center(el);
    Juice.burst(p.x, p.y + 12, { n: 26, colors: PAL.dust, speed: 150, up: 30, gravity: 120, life: 0.8, size: 5 });
    if (t) { Juice.pop(el, 1.25); Juice.burst(p.x, p.y, { n: 14, colors: PAL.gold, speed: 180, up: 80, life: 0.6 }); }
  });

  if (!b.exp && e) Juice.veil("Dungeon", `Floor ${e.map.floor}`);
  else if (b.exp && !e) Juice.veil("Millhollow", `Day ${S.day}`);
  else if (b.exp && e && e.map.floor !== b.exp.floor) Juice.veil(`Floor ${e.map.floor}`, bossFor(e.map.floor) ? "Boss floor" : "");
  else if (b.exp && e && e.map.at !== b.exp.at) {
    const here = $(".room.here"), r = e.map.rooms[e.map.at];
    if (here) {
      Juice.pop(here, 1.25);
      const p = Juice.center(here);
      Juice.burst(p.x, p.y + 10, { n: 10, colors: PAL.dust, speed: 90, up: 20, gravity: 80, life: 0.5, size: 3 });
      if (r.type === "treasure") Juice.burst(p.x, p.y, { n: 30, colors: PAL.gold, speed: 260, up: 180, gravity: 500, life: 1, size: 3, spark: true });
      if (r.type === "shrine") Juice.burst(p.x, p.y, { n: 26, colors: PAL.heal, speed: 60, up: 90, gravity: -100, life: 1.1, size: 3 });
    }
    document.querySelectorAll(".party .pc").forEach((pc, i) => setTimeout(() => Juice.lunge(pc, -8), i * 60));
    let n = 0;
    for (const k of Object.keys(e.map.rooms)) {
      if (!e.map.rooms[k].seen || b.exp.seen.includes(k)) continue;
      const el = document.querySelector(`.room[data-k="${k}"]`);
      if (el) { el.style.setProperty("--d", `${n++ * 70}ms`); el.classList.add("reveal"); }
    }
  }

  S.log.filter((l) => l.n > b.logN && LOUD.test(l.text))
    .forEach((l, i) => setTimeout(() => Juice.toast(l.text, l.kind), 300 + i * 350));
}

document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "savepick") { const f = el.files[0]; el.value = ""; if (f) f.text().then(loadCode); return; }
  if (!el.dataset.act) return;
  if (el.dataset.act === "equip" && el.value) equip(+el.dataset.v, +el.value);
  if (el.dataset.act === "floor") plan.floor = +el.value;
  render();
});

document.addEventListener("keydown", (e) => {
  const f = S.expedition && S.expedition.fight;
  if (!f) return;
  if (e.code === "Space") { e.preventDefault(); document.activeElement.blur(); run(f.over ? "fightdone" : "pause"); }
});


if (!load()) newGame();
render();
