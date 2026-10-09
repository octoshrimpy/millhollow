
const $ = (sel) => document.querySelector(sel);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let tab = "village";
let sheet = null;
let knocked = null;
let pleaded = null;
let alarmed = null;
// Ask the browser not to clear the save when it tidies up storage (Safari does after a week away).
navigator.storage?.persist?.().catch(() => {});
let plan = { party: [], rations: 6, meals: 0, floor: 1 };

function faceFor(s, hp, hpMax) {
  let m = mood(s);
  if (hp != null) m = hp <= 0 ? "sad" : hp < hpMax * 0.3 ? "scared" : hp < hpMax * 0.7 ? "sad" : m;
  return `assets/face-${s.face}-${s.age}-${m}.avif`;
}
const bar = (v, max, cls = "") =>
  `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, (v / max) * 100))}%"></i></div>`;

const wants = (s) => Object.values(S.asks || {}).some((ids) => ids.includes(s.id));
const mug = (s, cls = "mini") => `<span class="mug" data-act="person" data-v="${s.id}"><span class="pic"><img class="${cls}" src="${faceSrc(s)}" alt="">${wants(s) ? `<i class="wants">🙋</i>` : ""}</span><span><u>${esc(s.name)}</u>${s.dead ? " 🪦" : ""}</span></span>`;

const rowOf = (s) => s.row || defaultRow(s.cls);
let picked = null;
function formation(list, hp) {
  const lane = (row) => `<div class="lane ${row}" data-row="${row}">${list.filter((s) => rowOf(s) === row).map((s) => {
    const wait = row === "back" && CLASSES[s.cls].range === "melee";
    return `<div class="pc ${s.dead ? "dead" : ""}${picked === s.id ? " sel" : ""}" data-v="${s.id}">
      <span class="face-wrap">${mug(s)}${wait ? `<em>⏸</em>` : ""}</span>${hp ? bar(s.dead ? 0 : s.hp, stats(s).hpMax, "hp") : ""}</div>`;
  }).join("")}</div>`;
  return `<div class="formation"><div class="foeline">🧟 🧟 🧟</div>${lane("front")}${lane("back")}</div>`;
}

function render() {
  if (S.expedition) { if (!["dungeon", "people", "log"].includes(tab)) tab = "dungeon"; }
  else if (tab === "dungeon") tab = "village";
  renderTop();
  document.body.classList.toggle("founding", !!S.recruits);
  if (S.recruits) {
    morph($("#view"), iconize(viewRecruits()));
    $("#fight").hidden = true;
    renderSheet();
    return;
  }
  if (!living().length) {
    morph($("#view"), iconize(`<div class="card event"><p>Everyone is dead. ${esc(S.town)} is empty.</p>
      <p class="dim">${S.day} days. Deepest floor: ${S.deepest}.</p></div>`));
    renderLog();
    $("#fight").hidden = true;
    return;
  }
  if (S.visitor && S.visitor.id !== knocked && tab === "village" && !sheet && !S.expedition && !botTimer) {
    knocked = S.visitor.id;
    sheet = { visitor: true };
  }
  if (sheet && sheet.visitor && !S.visitor) sheet = null;
  const ev = S.expedition?.event, here = ev && `${S.expedition.map.floor}:${S.expedition.map.at}`;
  if (ev && here !== pleaded && tab === "dungeon" && !sheet && !S.expedition.fight) { pleaded = here; sheet = { event: true }; }
  if (sheet && sheet.event && !ev) sheet = null;
  if (S.trouble && S.trouble !== alarmed && ["village", "dungeon"].includes(tab) && !sheet && !S.expedition?.fight && !botTimer) {
    alarmed = S.trouble;
    sheet = { trouble: true };
  }
  if (sheet && sheet.trouble && !S.trouble) sheet = null;
  const view = { village: viewVillage, people: viewPeople, forge: viewForge, research: viewResearch, expedition: viewExpedition, dungeon: viewDungeon, log: viewLog }[tab];
  morph($("#view"), iconize(wide.matches && tab !== "log" ? `<div class="duo"><div class="page">${view()}</div><aside class="sidelog">${viewLog()}</aside></div>` : view()));
  placeLand();
  renderLog();
  renderPinned();
  renderSheet();
  if (S.expedition && S.expedition.fight) renderFight();
  else $("#fight").hidden = true;
}

let chosen = [], cooled = 0, shine = 0;
function viewRecruits() {
  chosen = chosen.filter((id) => S.recruits.some((s) => s.id === id));
  const left = cooled - Date.now(), cooling = left > 0;
  const town = `<div class="town"><input id="town" maxlength="20" spellcheck="false" autocomplete="off" value="${esc(S.town)}" aria-label="Town name"><button class="ghost" data-act="towns" aria-label="Reroll names">🎲</button>
    ${S.towns.map((t) => `<button class="small ${t === S.town ? "on" : ""}" data-act="town" data-v="${esc(t)}">${esc(t)}</button>`).join("")}</div>`;
  return town + `<div class="who">` + S.recruits.map((s) => {
    const t = tradeOf(s), b = Object.values(BUILDINGS).find((x) => x.job === t);
    return `<button class="${chosen.includes(s.id) ? "on" : ""} ${s.id === shine ? "shine" : ""}" data-act="recruit" data-v="${s.id}">
      <span class="me"><img src="${faceSrc(s)}" alt=""></span>
      <span class="past">${s.story.filter((e) => e.kind === "past").map((e) => `<span class="${PAST_GOOD.has(e.src || e.text) ? "good" : PAST_BAD.has(e.src || e.text) ? "bad" : ""}">${esc(e.text)}</span>`).join("")}</span>
      <b>${esc(s.name)}</b><span class="tags"><small>${CLASSES[s.cls].icon} ${CLASSES[s.cls].name}</small><small>${b ? b.icon : ""} ${TRADES[t]} <u>+${s.skills[t]}</u></small></span></button>`;
  }).join("") + `</div><div class="row pair">${(shine = 0, "")}
    <button class="reroll${cooling ? " cooling" : ""}" data-act="reroll" ${cooling ? `disabled style="--left:${left}ms"` : ""}>🎲 Reroll</button>
    <button class="primary go" data-act="settlein" ${chosen.length === STARTERS ? "" : "disabled"}><i>✓</i> ${chosen.length === STARTERS ? "Embark! " : ""}${chosen.length}/${STARTERS}</button></div>`;
}

function renderTop() {
  const packing = !S.expedition && tab === "expedition" ? { food: plan.rations, meals: plan.meals || 0 } : {};
  if (S.recruits) return morph($("#res"), iconize(`<button class="ghost back" data-act="back" aria-label="Back">⬅</button>`));
  morph($("#res"), iconize(`<span class="day">Day ${S.day}</span>` + Object.entries(RESOURCES)
    .filter(([k]) => S.res[k] > 0 || k === "food" || k === "wood")
    .map(([k, r]) => `<span data-tooltip="${r.name}${capOf(k) < Infinity ? ` ${S.res[k]}/${capOf(k)}` : ""}" data-placement="bottom" data-k="${k}" class="${packing[k] ? "packed" : S.res[k] >= capOf(k) ? "full" : ""}">${r.icon}${S.res[k] - (packing[k] || 0)}</span>`).join("")));
  morph($("#goals"), iconize("🔔"));
  $("#goals").classList.toggle("new", !!S.goalNew);
  morph($("#menu"), iconize("⚙"));
  morph($("#savebtn"), iconize(botTimer ? "⏹" : "💾"));
  $("#savebtn").dataset.act = botTimer ? "botstop" : "savefile";
  const log = ["log", "Log", "📖"];
  const tabs = S.expedition ? [["dungeon", "Dungeon", "🪜"], ["people", "People", "👥"], log]
    : [["village", "Village", "🏘"], ["people", "People", "👥"], ["forge", "Forge", "⚒"], ["research", "Research", "📜"], log, ["expedition", "Expedition", "🧭"]];
  morph($("#tabs"), iconize(tabs.map(([id, name, icon]) =>
    `<button data-act="tab" data-v="${id}" aria-label="${name}" class="${tab === id ? "on" : ""}">${icon}${tab === id ? `<small>${name}</small>` : id === "log" ? `<small class="lg-hide">Hide log</small><small class="lg-show">Show log</small>` : ""}</button>`).join("")));
}

const wide = matchMedia("(min-width: 64em)");
wide.addEventListener("change", () => render());
const root = document.documentElement;
const SPEEDS = [0.5, 1, 2, 3];
let fightSpeed = 1, speedOpen = false;
try { fightSpeed = SPEEDS.includes(+localStorage.getItem("mh-speed")) ? +localStorage.getItem("mh-speed") : 1; } catch {}
try { root.classList.toggle("nolog", localStorage.getItem("mh-sidelog") === "0"); } catch {}

// Redraws patch the live DOM to match: untouched nodes keep their scroll, focus, loaded images and running animations.
// Keyed children (data-key) move instead of being rewritten, so a prepended log line changes one node, not all.
function patch(to, from) {
  const keyed = new Map([...to.children].filter((n) => n.dataset.key).map((n) => [n.dataset.key, n]));
  const b = [...from.childNodes];
  b.forEach((n, i) => {
    let o = to.childNodes[i];
    const k = n.dataset?.key, mine = k && keyed.get(k);
    if (mine && mine !== o) { to.insertBefore(mine, o || null); o = mine; }
    if (!o) return to.append(n);
    if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || (k || "") !== (o.dataset?.key || "")) return o.replaceWith(n);
    if (n.nodeType !== 1) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    for (const { name } of [...o.attributes]) if (!n.hasAttribute(name)) o.removeAttribute(name);
    for (const { name, value } of [...n.attributes]) if (o.getAttribute(name) !== value) o.setAttribute(name, value);
    patch(o, n);
    if (o.nodeName === "SELECT") o.value = n.value;
  });
  while (to.childNodes.length > b.length) to.lastChild.remove();
}
const morph = (el, html) => { const t = document.createElement("template"); t.innerHTML = html; patch(el, t.content); };

let logSeen = Infinity;
const logLine = (l) => `<p data-key="${l.n}" class="${l.kind} ${l.aside ? "aside" : ""} ${l.n > logSeen ? "new" : ""}"><small>d${l.day}</small> ${named(esc(l.text))}</p>`;
// Anyone named in a line opens their sheet. ponytail: names are matched as words, so two settlers with one name both open the first.
let nameRe = null, nameKey = "";
const named = (html) => {
  const ns = S.settlers.map((s) => esc(s.name)), key = ns.join("|");
  if (key !== nameKey) {
    nameKey = key;
    const alt = [...new Set(ns)].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    nameRe = alt.length ? new RegExp(`(?<!\\p{L})(${alt.join("|")})(?!\\p{L})`, "gu") : null;
  }
  return nameRe ? html.replace(nameRe, (n) => `<u class="nm" data-act="person" data-v="${S.settlers[ns.indexOf(n)].id}">${n}</u>`) : html;
};
function renderLog() {
  const el = $("#log");
  el.hidden = tab === "log";
  morph(el, iconize(S.log.filter((l) => !l.aside).slice(-3).reverse().map(logLine).join("")));
  logSeen = S.logN || 0;
}
function renderPinned() {
  const st = tab === "forge" ? S.stash || [] : [];
  morph($("#pinned"), st.length ? iconize(`<details data-keep="stores" ${kept.stores ? "open" : ""}><summary>📦 ${st.length}</summary>
    <div class="row wrap">${st.map((g) => `<span class="chip">${esc(g.name)} ${gearText(g)}</span>`).join("")}</div></details>`) : "");
}
if (window.ResizeObserver) {
  const ro = new ResizeObserver((es) => es.forEach((e) =>
    document.documentElement.style.setProperty(e.target.id === "dock" ? "--dock-h" : "--head-h", `${e.target.offsetHeight}px`)));
  ro.observe($("#dock")); ro.observe($("header"));
}

let older = false;
function viewLog() {
  const shown = older ? S.log : S.log.slice(-2000);
  const out = shown.slice().reverse().map(logLine);
  if (shown.length < S.log.length) out.push(`<button class="more" data-act="older">▾ ${S.log.length - shown.length}</button>`);
  const fold = shown.some((l) => l.aside) ? `<button class="logfold" data-act="asides" aria-label="Asides"><span class="lg-more">↕</span><span class="lg-less">⇳</span></button>` : "";
  return `<div class="fulllog">${out.join("")}</div>${fold}`;
}

function viewVillage() {
  const v = S.visitor;
  const visitor = v ? `<button class="knock" data-act="knock"><span class="mug"><img class="mini" src="${faceSrc(v)}" alt=""><span><u>${esc(v.name)}</u></span></span>
    <b></b> ${CLASSES[v.cls].icon} <span class="dim">❯</span></button>` : "";
  const alarm = alarmButton();
  const known = S.seen.map((v, i) => v && xy(i)).filter(Boolean);
  const x0 = Math.max(0, Math.min(...known.map(([x]) => x)) - 1), x1 = Math.min(LAND - 1, Math.max(...known.map(([x]) => x)) + 1);
  const y0 = Math.max(0, Math.min(...known.map(([, y]) => y)) - 1), y1 = Math.min(LAND - 1, Math.max(...known.map(([, y]) => y)) + 1);
  const origin = S.hall ?? MID;
  const tile = (i) => {
    const b = S.grid[i];
    const at = `data-i="${i}" data-act="plot" data-v="${i}"` + (newLand.includes(i) ? ` style="--d:${dist(i, origin)}"` : "");
    const cls = (newLand.includes(i) ? " fresh" : "") + (S.hall != null && contested(i) ? " out" : "");
    if (!S.seen[i]) return `<div class="tile fog" data-i="${i}"></div>`;
    const t = S.land[i], site = siteAt(i), ico = scatter(i, TERRAIN[t].icon);
    if (site) return `<button class="tile site t-${t}${cls}" ${at}><span class="ico">${SITES[site.kind].icon}</span><small>${esc(site.name)}</small>${site.deepest ? `<span class="lvl">🪜${site.deepest}</span>` : ""}</button>`;
    if (wild(i)) return `<button class="tile wild t-${t}${cls}" ${at}>${ico}</button>`;
    if (t !== "meadow") return `<div class="tile still t-${t}${cls}" data-i="${i}"${newLand.includes(i) ? ` style="--d:${dist(i, origin)}"` : ""}>${ico}</div>`;
    if (b?.part) return "";
    if (!b) return `<button class="tile empty${cls}${S.hall == null ? " found" : ""}" ${at}>${S.hall == null ? "🏛️" : "＋"}</button>`;
    const def = BUILDINGS[b.type], w = b.worker && byId(b.worker);
    const sick = living().find((s) => s.laid === i);
    const who = (w ? `<img class="mini" src="${faceSrc(w)}" alt="${esc(w.name)}">` : "") + (sick ? `<img class="mini laid" src="${faceSrc(sick)}" alt="${esc(sick.name)}">` : "");
    const lvl = b.lvl ? `<span class="lvl${b.unpaid ? " bad" : ""}">${"●".repeat(b.lvl)}</span>` : "";
    const warn = S.hall != null && contested(i) ? `<span class="warn">❗</span>` : "";
    return `<button class="tile${cls}${b.type === "townhall" ? " hall" : def.big ? " big" : ""}" ${at}><span class="ico">${def.icon}</span><small>${def.name}</small>${who}${warn}${lvl}</button>`;
  };
  let tiles = "";
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles += tile(y * LAND + x);
  newLand = [];
  const n = living().length, over = n > beds();
  return `<div class="land" id="land"><div class="grid" style="--w:${x1 - x0 + 1}" data-x0="${x0}" data-y0="${y0}">${tiles}</div></div>
    <div class="row between endbar"><span class="row"><span class="housing ${over ? "bad" : ""}">🛏️ ${n}/${beds()}</span>
    ${S.hall != null ? `<button class="small ghost" data-act="center" aria-label="Centre">🎯</button>` : ""}</span>
    <span class="row"><button class="ghost" data-act="events" aria-label="Events">🎉</button><button class="primary" data-act="endday">End day ▸</button></span></div>
    ${visitor}${alarm}`;
}

const alarmButton = () => S.trouble ? `<button class="knock" data-act="alarm">${troubleHead(S.trouble)} <span class="dim">❯</span></button>` : "";
const goods = (c) => Object.entries(c).map(([r, n]) => tip(RESOURCES[r].name, `${n}${RESOURCES[r].icon}`)).join(" ");
function troubleHead(t) {
  const s = t.who && byId(t.who);
  const face = s ? mug(s) : "";
  if (t.pair) { const [a, b] = t.pair.map(byId); return `<b class="row">${mug(a)} 💍 ${mug(b)}</b>`; }
  return { bandits: `<b>🗡 ×${t.n}</b>`, pirates: `<b>🌊🗡 ×${t.n}</b>`, debt: `${face} 💰`, fey: `${face} ⚒🔒`, feast: `<b>🍖</b>`, trader: `<b>🛣</b>` }[t.kind];
}
function troubleStakes(t) {
  const s = t.who && byId(t.who), want = goods(t.take), twice = goods(Object.fromEntries(Object.entries(t.take).map(([r, n]) => [r, 2 * n])));
  const armed = [`⚔ Lost: they take ${twice}, everyone home hurt.`, `Left till End day: they take ${twice}.`];
  const lines = {
    bandits: [`${t.n} bandits want ${want}.`, ...armed],
    pirates: [`${t.n} river pirates want ${want}.`, ...armed],
    debt: [`Collectors want ${want} for ${esc(s?.name)}'s debts.`, ...armed],
    fey: [`${esc(s?.name)} wants ${want}.`, `Given: gear named for their ghost.`, `Refused or left: they smash where they work.`],
    feast: [`A feast for everyone home: ${want}.`],
    wedding: [`${want} buys the whole village a wedding.`],
    trader: [`A trader at the gate.`],
  }[t.kind] || [];
  return `<div class="stakes">${lines.map((l) => `<p>${l}</p>`).join("")}</div>`;
}
const TROUBLE_TITLE = { bandits: "Bandits!", pirates: "River pirates!", debt: "Debt collectors", fey: "Fey mood", feast: "Feast", wedding: "Wedding!", trader: "Trader" };
function sheetTrouble() {
  const t = S.trouble, ok = afford(t.take), title = `<h3>${TROUBLE_TITLE[t.kind]}</h3>`;
  const odds = t.n && holds(t.n), label = (x) => `<small>${x}</small>`;
  const [noText, yesText] = { wedding: ["Small ceremony", "Throw a feast"], feast: ["Skip", "Feast"], fey: ["Refuse", "Give"], debt: ["Refuse", "Pay"], bandits: ["", "Pay"], pirates: ["", "Pay"] }[t.kind] || ["", ""];
  const no = t.n ? `⚔ ${Math.round(odds * 100)}%${label(odds >= 0.65 ? "Likely win" : odds >= 0.4 ? "Even fight" : "Likely loss")}` : (t.pair ? "💍" : "✕") + label(noText);
  const yes = costText(t.take) + (t.give ? ` ❯ ${goods(t.give)}` : "") + label(yesText);
  if (t.offers) return `<div class="arrival">${title}<div class="row center">${troubleHead(t)}</div>${troubleStakes(t)}
    ${t.offers.map((o, i) => `<button class="wide" data-act="settle" data-v="${i}" ${afford(o.take) ? "" : "disabled"}>${costText(o.take)} ❯ ${goods(o.give)}</button>`).join("")}
    <button class="wide" data-act="settle" data-v="no">✕</button></div>`;
  return `<div class="arrival">${title}<div class="row center">${troubleHead(t)}</div>${troubleStakes(t)}
    <div class="row pair"><button data-act="settle" data-v="no">${no}</button><button class="${t.n || t.pair ? "" : "primary"}" data-act="settle" data-v="yes" ${ok ? "" : "disabled"}>${yes}</button></div></div>`;
}

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
    return `<h3>Build</h3><div class="picks">` + Object.entries(BUILDINGS).filter(([id, d]) => (S.hall == null) === (id === "townhall") && (!d.arcane || S.arcane)).map(([id, d]) => {
      const locked = d.needs && !has(d.needs), far = d.near && !beside(i, d.near);
      return `<button class="opt" data-act="build" data-v="${id}" ${locked || far || !fits(i, id) || !afford(d.cost) ? "disabled" : ""}>
        <span class="ico">${d.icon}</span><span><b>${d.name}</b>${S.asks?.[id]?.length ? ` ${tip("Asked for", `🙋${S.asks[id].length}`)}` : ""} ${costText(d.cost)}${besideTag(i, id)}<br><small>${locked ? `🔒 📜 ${RESEARCH[d.needs].name}` : far ? `🔒 ${TERRAIN[d.near].icon}` : d.desc}</small></span></button>`;
    }).join("") + `</div>`;
  }
  const d = BUILDINGS[b.type];
  const back = Object.entries(refundOf(i)).map(([k, v]) => tip(RESOURCES[k].name, `+${v}${RESOURCES[k].icon}`)).join(" ");
  const knock = ["townhall", "wonder"].includes(b.type) ? "" : `<button class="danger small" data-act="demolish">Demolish${back ? ` <small>♻ ${back}</small>` : ""}</button>`;
  const lv = b.lvl || 0, pips = IMPROVABLE(b.type) ? ` <span class="pips">${"●".repeat(lv)}${"○".repeat(IMPROVE.length - lv)}</span>` : "";
  let body = `<div class="sheet-head"><h3>${d.icon} ${d.name}${pips}${besideTag(i, b.type)}</h3>${knock}</div><p class="dim desc">${d.desc}</p>${contested(i) ? `<p class="bad">❗ Too far from town hall: unsafe location!</p>` : ""}${b.unpaid ? `<p class="bad">❗ Upkeep unpaid, upgrade idle: need ${goods(IMPROVE[b.lvl - 1].upkeep)}/d</p>` : ""}${b.maker && byId(b.maker) ? `<p class="dim">🔨 ${esc(byId(b.maker).name)}</p>` : ""}`;
  if (d.up) {
    const to = BUILDINGS[d.up.to], locked = to.needs && !has(to.needs);
    body += `<button class="opt" data-act="upgrade" ${canUpgrade(i) ? "" : "disabled"}>
      <span class="ico">⏫</span><span><b>${to.icon} ${to.name}</b> ${costText(d.up.cost)}<br><small>${locked ? `🔒 📜 ${RESEARCH[to.needs].name}` : to.desc}</small></span></button>`;
  }
  const next = IMPROVABLE(b.type) && IMPROVE[lv];
  if (next) {
    body += `<button class="opt" data-act="improve" ${canImprove(i) ? "" : "disabled"}>
      <span class="ico">⏫</span><span><b>${b.type === "forge" ? `−${Math.round((1 - 1 / (1 + next.boost)) * 100)}%` : `+${Math.round(next.boost * 100)}%`}</b> ${costText(next.cost)} · ${goods(next.upkeep)}/d${has(next.needs) ? "" : `<br><small>🔒 📜 ${RESEARCH[next.needs].name}</small>`}</span></button>`;
  }
  if (d.job) {
    const sk = (s) => s.skills[d.job] || 0;
    const rank = (s) => (s.id === b.worker ? 0 : s.job == null ? 1 : 2);
    const home = living().filter((s) => !away(s)).sort((x, y) => rank(x) - rank(y) || sk(y) - sk(x));
    const best = Math.max(...home.map(sk));
    body += `<div class="who">` + home.map((s) => {
      const here = b.worker === s.id, from = !here && s.job != null && S.grid[s.job];
      if (s.laid != null) return `<button disabled><img src="${faceSrc(s)}" alt=""><b>${esc(s.name)}</b><small class="st bad">🩹</small></button>`;
      const st = here ? `<small class="st here">✓ Working</small>` : from
        ? `<small class="st">${BUILDINGS[from.type].icon} ${BUILDINGS[from.type].name}${(s.skills[BUILDINGS[from.type].job] || 0) >= 0.1 ? ` <b>${s.skills[BUILDINGS[from.type].job].toFixed(1)}</b>` : ""}</small>` : `<small class="st free">Free</small>`;
      return `<button class="${here ? "on" : ""}" data-act="assign" data-v="${here ? 0 : s.id}">
        ${sk(s) >= 0.1 ? `<em class="${sk(s) === best ? "top" : ""}"><i>${d.icon}</i>${sk(s).toFixed(1)}</em>` : ""}
        <img src="${faceSrc(s)}" alt="">
        <b>${esc(s.name)}</b>${st}</button>`;
    }).join("") + `</div>`;
  }
  return body;
}

function sheetSite(site) {
  const d = SITES[site.kind], k = S.sites.indexOf(site), days = travelDays(site);
  const dead = S.remains.filter((r) => r.at === "below" && r.site === k).map((r) => `🦴 ${esc(byId(r.id).name)} · ${r.floor}`);
  const chips = [site.deepest ? tip("Deepest floor", `🪜 ${site.deepest}`) : "", days ? tip("Travel", `👣 ${days}d`) : "", site.boss ? `${d.boss} ${esc(site.boss)}` : "", ...dead]
    .filter(Boolean).map((x) => `<span class="chip">${x}</span>`).join("");
  return `<h3>${d.icon} ${esc(site.name)}</h3><div class="row wrap">${chips}</div>
    <button class="primary wide" data-act="tosite" data-v="${k}" ${S.expedition ? "disabled" : ""}>🧭 Set out</button>`;
}

const besideTag = (i, type) => {
  const near = besideBoost(i, type) && TERRAIN[BESIDE[type].find((k) => beside(i, k))];
  const boost = near ? tip(near.name, `${near.icon}+${Math.round(besideBoost(i, type) * 100)}%`) : "";
  const extra = Object.keys(BESIDE_YIELDS[type] || {}).filter((k) => beside(i, k))
    .map((k) => tip(TERRAIN[k].name, TERRAIN[k].icon + Object.keys(BESIDE_YIELDS[type][k]).map((r) => RESOURCES[r].icon).join(""))).join(" ");
  const tag = [boost, extra].filter(Boolean).join(" ");
  return tag ? ` <span class="beside">${tag}</span>` : "";
};

const jobIcon = (job) => Object.values(BUILDINGS).find((d) => d.job === job).icon;

function sheetEvent() {
  if (S.expedition.prisoner) return sheetPrisoner();
  const ev = EVENTS.find((x) => x.id === S.expedition.event);
  return `<div class="arrival">
    <h3>${ev.name}</h3>
    <div class="omen">${ROOM_ICON.event}</div>
    <p>${ev.text}</p>
    <div class="row pair">${ev.choices.slice().reverse().map((x, i) =>
      `<button ${i ? 'class="primary"' : ""} data-act="event" data-v="${x.act}">${x.label}</button>`).join("")}</div>
  </div>`;
}

function sheetPrisoner() {
  const p = S.expedition.prisoner, c = CLASSES[p.cls], ev = EVENTS.find((x) => x.id === "prisoner");
  return `<div class="arrival">
    <h3>${ev.name}</h3>
    <img class="face" src="${faceSrc(p)}" alt="">
    <h4>${esc(p.name)}</h4>
    <div>${c.icon} ${c.name}</div>
    <p>${ev.text}</p>
    <div class="row pair">${ev.choices.slice().reverse().map((x, i) =>
      `<button ${i ? 'class="primary"' : ""} data-act="event" data-v="${x.act}">${x.label}</button>`).join("")}</div>
  </div>`;
}

function sheetVisitor() {
  const v = S.visitor, c = CLASSES[v.cls], st = stats(v), full = living().length >= beds();
  const skills = Object.entries(v.skills).filter(([, x]) => x >= 0.1)
    .map(([k, x]) => tip(k, `${jobIcon(k)} ${x.toFixed(1)}`, "chip")).join("");
  return `<div class="arrival">
    <h3>Visitor</h3>
    <img class="face" src="${faceSrc(v)}" alt="">
    <h4>${esc(v.name)}</h4>
    <div>${c.icon} ${c.name}</div>
    <div class="stats">${statLine(st, "❤️" + st.hpMax)}</div>
    <div class="row wrap">${skills}${full ? `<span class="chip bad">🛏️ ${living().length}/${beds()}</span>` : ""}</div>
    ${blames(v)}
    <div class="row pair"><button data-act="visitor" data-v="0">Turn away</button><button class="primary" data-act="visitor" data-v="1">Accept</button></div>
  </div>`;
}

const gearAdds = (s, k) => ["weapon", "armor"].reduce((a, slot) => a + (s.gear[slot] ? gearStat(s.gear[slot], k, s) : 0), 0);
const statLine = (st, hp = "", s = null) => [[hp, "hp", "Health"], [`⚔${st.atk}`, "atk", "Attack"], [`🛡${st.def}`, "def", "Defense"], [`💨${st.spd}`, "spd", "Speed"]].filter(([x]) => x)
  .map(([x, k, name]) => { const d = s ? gearAdds(s, k) : 0;
    return `<span data-tooltip="${name}">${x}${d ? `<small class="${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${Math.abs(d)}</small>` : ""}</span>`; }).join("");

function settlerCard(s) {
  const st = stats(s), c = CLASSES[s.cls];
  const feel = fresh(s).sort((x, y) => y.n - x.n).slice(0, 3)
    .map((x) => `<span class="${THOUGHTS[x.k].morale > 0 ? "good" : "bad"}" data-tooltip="${THOUGHTS[x.k].name}">${THOUGHTS[x.k].icon}</span>`).join("");
  return `<div class="card person" data-act="person" data-v="${s.id}">
    ${mug(s, "face")}
    <div class="grow">
      <div class="row between"><span>${s.guest ? "🚪 " : ""}<small class="dim">lv ${s.level}</small> <small class="dim">${jobText(s)}</small></span><small class="cls">${c.icon} ${c.name}</small></div>
      ${bar(s.hp, st.hpMax, "hp")}
      <div class="row between"><span class="feel">${moraleFace(s)}${feel}</span><span class="stats">${statLine(st, "", s)}</span></div>
    </div></div>`;
}
const jobText = (s) => below(s) ? "🪜" : s.wander?.seen ? "👣" : isGuard(s) ? "👀" : s.job != null && S.grid[s.job] ? BUILDINGS[S.grid[s.job].type].icon : "";
const moraleFace = (s) => `<span data-tooltip="Morale" data-placement="bottom">${s.morale >= 75 ? "😄" : s.morale >= 50 ? "🙂" : s.morale >= 30 ? "😐" : "😠"} ${s.morale}</span>`;

let gearPick = null;
const SLOT_ICON = { weapon: "⚔️", armor: "🦺" };
const STAT_ICON = { atk: "⚔️", def: "🛡️", hp: "❤️", spd: "💨" };
function gearRow(s) {
  const busy = away(s), open = gearPick && gearPick.id === s.id && gearPick.slot;
  const slots = ["weapon", "armor"].map((slot) => {
    const g = s.gear[slot], choices = (S.stash || []).some((x) => x.slot === slot);
    return `<button class="slot ${g ? "" : "empty"} ${open === slot ? "open" : ""}" data-act="gearpick" data-v="${slot}"
      ${busy || (!g && !choices) ? "disabled" : ""}><i>${SLOT_ICON[slot]}</i><span><b>${g ? esc(g.name) : "—"}</b>${g ? `<small>${gearText(g, s)}</small>` : ""}</span></button>`;
  }).join("");
  return `<div class="slots">${slots}</div>${open && !busy ? gearList(s, open) : ""}
`;
}
function gearList(s, slot) {
  const cur = s.gear[slot];
  const worth = (g) => (weaponCls(g) === s.cls ? 1000 : 0) + Object.keys(STAT_ICON).reduce((t, k) => t + gearStat(g, k, s), 0);
  const rows = (S.stash || []).filter((g) => g.slot === slot).sort((a, b) => worth(b) - worth(a)).map((g) =>
    `<button class="pick" data-act="equip" data-v="${s.id}" data-uid="${g.uid}"><b>${esc(g.name)}</b><small>${weaponCls(g) ? `${CLASSES[weaponCls(g)].icon} ` : ""}${gearDelta(g, cur, s)}</small></button>`);
  if (cur) rows.push(`<button class="pick off" data-act="unequip" data-v="${s.id}" data-slot="${slot}">✕</button>`);
  return `<div class="picker">${rows.join("")}</div>`;
}
const gearDelta = (g, cur, s) => Object.keys(STAT_ICON).map((k) => {
  const d = gearStat(g, k, s) - (cur ? gearStat(cur, k, s) : 0);
  return d ? `<span class="${d > 0 ? "up" : "down"}">${STAT_ICON[k]}${d > 0 ? "+" : "−"}${Math.abs(d)}</span>` : "";
}).filter(Boolean).join(" ") || "=";
const gearStat = (g, k, s) => (g[k] || 0) + (k === "atk" && s ? fitBonus(g, s) : 0);
const gearText = (g, s, bare = false) => (!bare && weaponCls(g) ? `${CLASSES[weaponCls(g)].icon} ` : "") +
  Object.keys(STAT_ICON).filter((k) => g[k]).map((k) => { const v = gearStat(g, k, s); return `${STAT_ICON[k]}${v > 0 ? "+" : "−"}${Math.abs(v)}`; }).join(" ");

const DRIVE_ICON = { anger: "😠", fear: "👁", grief: "🪦", restless: "👣", warmth: "🔥", pride: "⭐" };
const drivePips = (s) => Object.keys(DRIVES).some((d) => drive(s, d) >= 10) ? `<div class="drives">${Object.keys(DRIVES).map((d) => {
  const n = Math.round(drive(s, d) / 20);
  return `<span class="drive" data-tooltip="${d}">${DRIVE_ICON[d]} <b class="${DRIVES[d] === "happy" ? "good" : "bad"}">${"◆".repeat(n)}</b>${"◇".repeat(5 - n)}</span>`;
}).join("")}</div>` : "";
const moraleChip = (s) => `<span class="thought">${moraleFace(s)}</span>`;
const thoughtChip = (x) => {
  const t = THOUGHTS[x.k], v = t.morale;
  return `<span class="thought ${v > 0 ? "good" : "bad"}" data-tooltip="${t.name}">${t.icon} ${v > 0 ? "+" : "−"}${Math.abs(v)}</span>`;
};

function viewPeople() {
  const dead = S.settlers.filter((s) => s.dead);
  const down = living().filter(below);
  const crew = (xs) => `<div class="crew">${xs.map(settlerCard).join("")}</div>`;
  const cards = !down.length ? crew(living())
    : `<h4>${SITES[siteOf().kind].icon} ${esc(siteOf().name)}</h4>${crew(down)}
      <h4 class="split">🏘 ${esc(S.town)}</h4>${crew(living().filter((s) => !below(s)))}`;
  return cards + (dead.length ? `<h4>🪦</h4><div class="remembered">${dead.map((s) =>
    mug(s)).join("")}</div>` : "");
}

function restText(s) {
  const r = S.remains.find((x) => x.id === s.id);
  if (!r) return "";
  const where = r.at === "below" ? `${SITES[S.sites[r.site].kind].icon} ${esc(S.sites[r.site].name)} · ${r.floor}` : r.at === "carried" ? "👣" : "🏘";
  return `<div class="chip">🦴 ${where}</div>`;
}

const blames = (s) => {
  const ts = living().filter((t) => grudge(s, t));
  return ts.length ? `<div class="row wrap center">😠 ${ts.map((t) => mug(t)).join("")}</div>` : "";
};
function sheetPerson() {
  const s = byId(sheet.person), c = CLASSES[s.cls];
  const days = (e) => e.to > e.day ? `d${e.day}–${e.to}` : `d${e.day}`;
  const line = (e) => {
    if (e.kind === "past") return `<p class="past">${esc(e.text)}</p>`;
    if (!e.k) return `<p class="${e.kind || ""}"><small>${days(e)}</small> ${named(esc(e.text))}</p>`;
    const t = THOUGHTS[e.k];
    return `<p class="felt ${t.morale > 0 ? "good" : "bad"}"><small>${days(e)}</small> ${t.icon} ${t.name}${e.x > 1 ? ` ×${e.x}` : ""}</p>`;
  };
  const st = stats(s);
  const skills = Object.entries(s.skills).filter(([, x]) => x >= 0.1)
    .map(([k, x]) => tip(k, `${jobIcon(k)} ${x.toFixed(1)}`, "chip")).join("");
  return `<div class="personsheet"><div class="arrival ${s.dead ? "gone" : ""}"><div class="idcard">
    <img class="face" src="${faceSrc(s)}" alt="">
    <div><div class="nameline"><h3>${esc(s.name)}</h3>${s.dead ? "" : moraleChip(s)}</div>
    <div class="row center">${c.icon} ${c.name} · lv ${s.level}${isGuard(s) ? (s.wasJob ? ` · <span class="dim">${BUILDINGS[s.wasJob.type].icon}</span>` : "") : jobText(s) ? ` · ${jobText(s)}` : ""}
    ${s.dead || away(s) ? "" : `<button class="small ${isGuard(s) ? "on" : "ghost"}" data-act="guard" aria-label="Guard">👀</button>`}</div>
    ${s.dead ? restText(s) : ""}
    ${s.dead ? "" : `<div class="hpline">${bar(s.hp, st.hpMax, "hp")}</div>
    ${injuries(s).length ? `<p class="bad hurts">${injuries(s).join(" · ")}</p>` : ""}
    <div class="stats">${statLine(st, `❤️${s.hp}/${st.hpMax}`, s)}</div>`}</div></div>
    ${!s.dead ? `<p class="said">“${esc(why(s))}”</p>` : ""}
    ${!s.dead && wants(s) ? `<div class="row center wrap">${Object.entries(S.asks).filter(([, ids]) => ids.includes(s.id))
      .map(([t]) => tip("Asked for", `🙋 ${BUILDINGS[t].icon} ${BUILDINGS[t].name}`, "chip")).join("")}</div>` : ""}
    ${s.dead ? "" : `<div class="thoughts">${fresh(s).sort((x, y) => y.n - x.n).map(thoughtChip).join("")}</div>
    ${drivePips(s)}
    <div class="row wrap center">${skills}${traitsOf(s).map((k) => tip("Nature", `${TRAITS[k].icon} ${TRAITS[k].name}`, "chip")).join("")}${s.pastime ? tip("Pastime", `${PASTIMES[s.pastime].icon} ${PASTIMES[s.pastime].name}`, "chip") : ""}</div>
    ${blames(s)}
    ${gearRow(s)}`}
  </div>
  <div><div class="sites lifetabs"><button class="${sheet.ties ? "" : "on"}" data-act="lifetab" data-v="log" aria-label="Log">📖</button><button class="${sheet.ties ? "on" : ""}" data-act="lifetab" data-v="ties" aria-label="Relationships">👥</button></div>
  <div class="lifelog">${sheet.ties ? tiesOf(s) : (s.story || []).slice().reverse().map(line).join("")}</div></div></div>`;
}
const FEELS = [[90, "would die for"], [75, "would do anything for"], [60, "devoted to"], [45, "close to"], [30, "fond of"],
  [15, "enjoys company of"], [5, "gets along with"], [1, "warming to"], [0, "indifferent to"], [-4, "unsure of"],
  [-14, "annoyed at"], [-29, "irritated by"], [-44, "dislikes"], [-59, "resents"], [-74, "can't stand"], [-89, "loathes"], [-100, "hates"]];
const feels = (v, dead) => dead && v >= 15 ? "misses" : FEELS.find(([at]) => v >= at)[1];
function tiesOf(s) {
  const os = [...S.settlers, ...(S.gone || [])].filter((o) => o.id !== s.id && (tieOf(s, o) || s.spouse === o.id || grudge(s, o)));
  return os.sort((a, b) => tieOf(s, b) - tieOf(s, a)).map((o) => {
    const v = tieOf(s, o);
    const marks = (s.spouse === o.id ? "💍" : "") + (s.sweet?.o === o.id ? "❤" : "") + (s.rival?.o === o.id ? "🤺" : "") + (s.owes?.some((x) => x.o === o.id) ? "🎁" : "") + (s.fz?.includes(o.id) ? "💔" : "") + (grudge(s, o) ? "😠" : "") + (o.dead ? "🪦" : "");
    return `<p class="tie"><span><u class="nm" data-act="person" data-v="${o.id}">${esc(o.name)}</u> <i>${feels(v, o.dead)}</i></span><span>${marks} <small>${v > 0 ? "+" : ""}${Math.round(v)}</small></span><span class="tiebar ${v < 0 ? "neg" : ""}" style="--v:${Math.abs(v)}"><i></i></span></p>`;
  }).join("");
}

let forgeTab = null;
function viewForge() {
  if (!built("forge")) return `<p class="dim">Build a forge first.</p>`;
  if (!staffed("forge")) return `<p class="dim">The forge needs a worker.</p>`;
  const free = forgeFree();
  const job = (id) => (S.forging || []).filter((x) => x.id === id).sort((a, b) => a.left - b.left)[0];
  const timer = (id) => (job(id) ? " on" : "");
  const days = (id) => ` ${tip("Days", `⏳ ${job(id) ? job(id).left : forgeDays(id)}d`)}`;
  const recipe = (r) => {
    const locked = r.needs && !has(r.needs);
    return `<button class="opt${timer(r.id)}" data-act="craft" data-v="${r.id}" ${locked || !free || !afford(forgeCost(r.cost)) ? "disabled" : ""}>
      <span><b>${r.name}</b> ${costText(forgeCost(r.cost))}${days(r.id)}<br><small>${locked ? `🔒 📜 ${RESEARCH[r.needs].name}` : gearText(r, null, true)}</small></span></button>`;
  };
  const potion = `<button class="opt${timer("potion")}" data-act="brew" ${free && afford(forgeCost(POTION_COST)) ? "" : "disabled"}><span><b>Potion</b> ${costText(forgeCost(POTION_COST))}${days("potion")}<br><small>❤️+20</small></span></button>`;
  const groups = [...Object.entries(CLASSES).map(([k, c]) => [k, c.icon, c.name, RECIPES.filter((r) => r.cls === k).map(recipe).join(""), RECIPES.some((r) => r.cls === k && timer(r.id))]),
    ["armor", SLOT_ICON.armor, "Armour", RECIPES.filter((r) => r.slot === "armor").map(recipe).join(""), RECIPES.some((r) => r.slot === "armor" && timer(r.id))],
    ...(has("herbalism") ? [["potion", "🧪", "Potion", potion, !!timer("potion")]] : [])];
  if (!groups.some(([k]) => k === forgeTab)) forgeTab = groups[0][0];
  const tabs = groups.map(([k, icon, name, , busy]) => {
    const j = busy && (S.forging || []).some((x) => k === "potion" ? x.id === "potion" : RECIPES.some((r) => r.id === x.id && (r.cls || r.slot) === k));
    return `<button class="${k === forgeTab ? "on" : ""}${j ? " busy" : ""}" data-act="forgetab" data-v="${k}" aria-label="${name}">${icon}</button>`;
  }).join("");
  return `<div class="sites">${tabs}</div>` + groups.find(([k]) => k === forgeTab)[3];
}

function viewResearch() {
  if (!built("library")) return `<p class="dim">Build a library first.</p>`;
  if (!staffed("library")) return `<p class="dim">The library needs a worker.</p>`;
  return `<p class="dim">Staffed library: 1🏺 → research per day.</p><div class="picks">` +
    Object.entries(RESEARCH).filter(([, r]) => !r.spell || built("arcanum")).map(([id, r]) => {
      const locked = r.after && !has(r.after), repeat = REPEAT_RESEARCH.includes(id), n = tech(id), cost = researchCost(id), now = S.study && S.study.id === id;
      return `<button class="opt ${has(id) || now ? "on" : ""}" data-act="research" data-v="${id}" ${(!repeat && has(id)) || locked || S.study || S.res.research < cost ? "disabled" : ""}>
      <span><b>${r.spell ? `${CLASSES[r.cls].icon} ` : ""}${r.name}</b> ${now ? tip("Days", `⏳ ${S.study.left}d`) : has(id) && !repeat ? "✓" : `${costText({ research: cost })} ${tip("Days", `⏳ ${studyDays(id)}d`)}`}${repeat && n ? ` <small>lv ${n}</small>` : ""}<br><small>${locked ? `🔒 📜 ${RESEARCH[r.after].name}` : r.spell ? `lv ${r.lvl}. ${r.desc}` : r.desc}</small></span></button>`;
    }).join("") + `</div>`;
}

// One villager in the picker: face + name, then class, level, HP and what blocks or flags them.
function pickRow(s) {
  const on = plan.party.includes(s.id), no = refuses(s), due = avenges(s);
  const mates = plan.party.map(byId).filter((m) => m.id !== s.id);
  const mad = mates.some((m) => grudge(s, m) || grudge(m, s)) ? "😠" : "";
  const lens = [...new Set(lensOf(s).map((t) => ROOM_ICON[t === "boss" ? "stairs" : t]))].join("");
  const job = s.job != null && S.grid[s.job] ? ` · ${BUILDINGS[S.grid[s.job].type].icon}` : "";
  const flags = [no ? "😔" : due ? "🔒" : "", mad].filter(Boolean).join(" ");
  return `<div class="optrow">${mug(s)}
    <button class="opt ${on ? "on" : ""}" data-act="pick" data-v="${s.id}" ${no || due ? "disabled" : ""}>
      <span>${flags ? `${flags} ` : ""}${CLASSES[s.cls].icon} lv ${s.level}${lens ? ` <span class="chip">${lens}</span>` : ""}
      <br><small>HP ${s.hp}/${stats(s).hpMax}${job}</small></span></button></div>`;
}

function viewExpedition() {
  const ready = living().filter((s) => s.hp > 0);
  const sworn = ready.filter(avenges).map((s) => s.id);
  plan.party = [...new Set([...sworn, ...plan.party])].filter((id) => ready.some((s) => s.id === id && !refuses(s))).slice(0, partyMax());
  plan.rations = Math.min(plan.rations, S.res.food);
  plan.meals = Math.min(plan.meals || 0, S.res.meals);
  const known = S.sites.filter((x) => S.seen[x.i]);
  if (!known.includes(S.sites[plan.site || 0])) plan.site = 0;
  const site = S.sites[plan.site || 0], days = travelDays(site);
  plan.floor = Math.min(plan.floor, site.deepest + 1);
  const floors = Array.from({ length: site.deepest + 1 }, (_, k) => k + 1);
  const where = known.length > 1 ? `<div class="sites">${known.map((x) => `<button class="${x === site ? "on" : ""}" data-act="site" data-v="${S.sites.indexOf(x)}"
    aria-label="${esc(x.name)}">${SITES[x.kind].icon}</button>`).join("")}</div>` : "";
  const home = living().filter((s) => !away(s) && !plan.party.includes(s.id));
  const per = (k) => `${roomsPer(k)} ${roomsPer(k) > 1 ? "rooms" : "room"}`;
  const cook = has("smoking") || S.res.meals > 0;
  const stepper = (act, icon, n) => `<div class="row between"><span>${icon}</span><span class="row">
      <button data-act="${act}" data-v="-1" data-hold>−</button><b>${n}</b><button data-act="${act}" data-v="1" data-hold>＋</button></span></div>`;
  return `${where}<div class="row between"><h3>${SITES[site.kind].icon} ${esc(site.name)}</h3>${days ? tip("Travel", `👣 ${days}d`, "chip") : ""}</div>
    <p class="dim">Party of up to ${partyMax()}. 🍞 ${per("food")}${cook ? ` · 🥪 ${per("meals")}, +${MEAL_HEAL}❤️` : ""}. No food: starving. Death is permanent.</p>
    <div class="exped"><div class="roster">${ready.map(pickRow).join("")}</div><div class="plan">
    ${plan.party.length ? formation(plan.party.map(byId), false) : ""}
    ${home.length ? `<div class="row between"><span>👀 Gate watch</span><span class="keepers">${Array.from({ length: watchMax() }, (_, i) => {
      const on = guards()[i];
      return `<button class="pick" data-act="keepdrop" data-v="${i}">${on ? `<img class="mini" src="${faceSrc(on)}" alt=""><span><b>${esc(on.name)}</b> ${CLASSES[on.cls].icon} lv ${on.level}</span>` : "<span>—</span>"}</button>`; }).join("")}</span></div>` : ""}
    ${stepper("rations", "🍞", plan.rations)}${cook ? stepper("meals", "🥪", plan.meals) : ""}
    <div class="row pair"><button class="${plan.scav ? "" : "on"}" data-act="mode" data-v="0">🤺 Delve</button><button class="${plan.scav ? "on" : ""}" data-act="mode" data-v="1">💰 Scavenge</button></div>
    ${plan.scav ? "" : `<div class="row between"><span>Start at floor</span><select data-act="floor">${floors.map((f) =>
      `<option ${f === plan.floor ? "selected" : ""}>${f}</option>`).join("")}</select></div>`}
    <button class="primary wide" data-act="depart" ${plan.party.length ? "" : "disabled"}>Set out</button></div></div>`;
}

const ROOM_ICON = { entrance: "🚪", fight: "🤺", boss: "☠️", treasure: "💰", empty: "·", shrine: "⛲", event: "❔", stairs: "🪜", enchant: "🔮" };

function viewDungeon() {
  const e = S.expedition, m = e.map, near = neighbours(m.rooms, m.at);
  const [fx, fy] = m.from.split(",").map(Number), [ax, ay] = m.at.split(",").map(Number);
  const dir = ax > fx ? "e" : ax < fx ? "w" : ay > fy ? "s" : ay < fy ? "n" : "";
  let cells = "";
  for (let y = 0; y < MAP; y++) for (let x = 0; x < MAP; x++) {
    const k = `${x},${y}`, r = m.rooms[k];
    if (!r || !r.seen) { cells += `<div class="room none"></div>`; continue; }
    const show = r.done || r.type === "entrance" || (near.includes(k) && (has("lanterns") || partyReads(r.type))) || r.type === "stairs" && r.done;
    const here = m.at === k, can = !here && canMove(k);
    const spent = r.done && !r.body && !["entrance", "stairs", "boss"].includes(r.type);
    const mark = r.done && r.type === "boss" ? ROOM_ICON.stairs : ROOM_ICON[r.type];
    cells += `<button class="room ${here ? "here" : ""} ${m.from === k && !here ? "from" : ""} ${r.done ? "done" : ""} ${spent ? "spent" : ""}" data-k="${k}" ${can ? `data-act="move" data-v="${k}"` : "disabled"}>
      ${here ? "🔦" : r.body ? `<span class="mark">🦴</span>` : show ? `<span class="mark">${mark}</span>` : "?"}</button>`;
  }
  const r = m.rooms[m.at];
  const loot = Object.entries(e.loot).filter(([, n]) => n).map(([k, n]) => tip(RESOURCES[k].name, `${n}${RESOURCES[k].icon}`)).concat(e.gear.map((g) => esc(g.name)), e.crown ? ["👑".repeat(e.crowns || 1)] : []).join(" ") || "nothing yet";
  let panel = "";
  if (e.event) {
    const ev = EVENTS.find((x) => x.id === e.event);
    panel = `<div class="row wrap center acts"><button class="primary" data-act="asked">${ROOM_ICON.event} ${ev.text}</button></div>`;
  } else {
    const down = ["stairs", "boss"].includes(r.type) && r.done && !(e.scav && m.floor >= SCAV_CAP);
    panel = `<div class="row wrap center acts">${down ? `<button class="primary" data-act="descend">Down to floor ${m.floor + 1}${grim(m.floor + 1) > 1 ? " " + "💀".repeat(1 + Math.floor(Math.log2(grim(m.floor + 1)))) : ""}</button>` : ""}
      <button data-hold="push" ${nextStep() ? "" : "disabled"}>👣 Push on</button>
      ${has("camping") ? `<button data-act="camp" ${canCamp() ? "" : "disabled"}>🏕️ Camp (${partyAlive().length}🍞)</button>` : ""}
      <button data-act="home">Head home (${homeDays()}d, ${homeFood()}🍞)</button></div>`;
  }
  return `<div class="row between"><b>${SITES[siteOf().kind].icon} ${esc(siteOf().name)} · ${m.floor}</b><small class="${foodLeft() <= homeFood() ? "short" : ""}">${tip("Rations", `🍞 ${e.rations}`)}${e.meals ? ` ${tip("Meals", `🥪 ${e.meals}`)}` : ""} · ${tip("Potions", `🧪 ${S.res.potions}`)}</small></div>
    <div class="bags"><details class="lineup" data-keep="lineup" ${kept.lineup ? "open" : ""}><summary>Lineup</summary>${formation(e.party.map(byId), true)}</details>
    <details class="lineup pack" data-keep="carry" ${kept.carry ? "open" : ""}><summary>Pack</summary><p class="dim small">${loot}</p></details></div>
    <div class="map move-${dir}" style="--w:${MAP}">${cells}</div>
    ${panel}${alarmButton()}`;
}

// A <details> marked data-keep stays as it was left across re-renders.
const kept = {};
document.addEventListener("toggle", (e) => { if (e.target.dataset?.keep) kept[e.target.dataset.keep] = e.target.open; }, true);

let fightBuilt = null;
function renderFight() {
  const f = S.expedition.fight, box = $("#fight");
  box.hidden = false;
  if (fightBuilt !== f) {
    fightBuilt = f;
    box.innerHTML = iconize(`<div class="fightbox">
      <div class="foes">${f.enemies.map((en, i) => `<button class="foe ${en.aoeEvery ? "boss" : ""}" style="--i:${i}" data-act="focus" data-v="${i}">
        <span class="ico">${en.icon}</span><small>${esc(en.name)}</small>${bar(en.hp, en.hpMax, "hp")}${bar(0, 100, "atb")}${en.aoeEvery ? bar(0, 100, "wind") : ""}</button>`).join("")}</div>
      <div class="lines" id="flines"></div>
      <div class="heroes">${f.heroes.map((h, i) => { const s = byId(h.id); return `<div class="hero">
        <button class="lanebtn" data-act="lane" data-v="${i}"><img class="face" alt=""></button><div class="grow"><b>${esc(h.name)}</b>
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
    const w = el.querySelector(".wind i");
    if (w) { w.style.width = `${windup(en)}%`; el.classList.toggle("due", en.hp > 0 && en.swings % en.aoeEvery === en.aoeEvery - 1); }
  });
  document.querySelectorAll(".hero").forEach((el, i) => {
    const h = f.heroes[i], s = byId(h.id), skill = el.querySelector(".skill");
    el.querySelector(".face").src = faceFor(s, h.hp, h.hpMax);
    el.querySelector(".hp i").style.width = `${(h.hp / h.hpMax) * 100}%`;
    el.querySelector(".atb i").style.width = `${Math.min(100, h.gauge)}%`;
    el.querySelector("b").textContent = `${h.name} ${Math.ceil(h.hp)}/${h.hpMax}`;
    const sks = [[CLASSES[h.cls].skill, h.cd], ...spellsOf(h).map((sp) => [sp, h.cds?.[sp.id] ?? 2])];
    skill.textContent = sks.map(([sk, cd]) => `${sk.name}${cd > 0 ? ` ${Math.ceil(cd)}s` : " ready"}`).join(" · ");
    skill.title = CLASSES[h.cls].skill.desc;
    el.classList.toggle("dead", h.hp <= 0);
    el.classList.toggle("flash", h.flash > 0);
    el.classList.toggle("healed", h.healed > 0);
    el.classList.toggle("back", h.row === "back");
    const pot = el.querySelector(".potion");
    pot.hidden = S.res.potions <= 0;
    pot.disabled = h.hp <= 0 || h.hp >= h.hpMax || f.over;
    const n = `×${S.res.potions}`;
    if (pot.dataset.n !== n) { pot.innerHTML = iconize(`🧪${n}`); pot.dataset.n = n; }
  });
  morph($("#flines"), iconize(f.lines.map((l) => `<p>${esc(l)}</p>`).join("")));
  const ctl = f.over === "won" ? ""
    : f.over
    ? `<button class="primary wide" data-act="fightdone">${f.over === "fled" ? "Fall back" : "It's over"}</button>`
    : `<button class="primary" data-act="pause">${f.paused ? "▶ Fight" : "⏸ Pause"}</button>
       <button class="danger" data-act="flee">Flee</button>`;
  const key = `${f.over}|${f.paused}`;
  if ($("#fctl").dataset.k !== key) { $("#fctl").innerHTML = iconize(ctl); $("#fctl").dataset.k = key; }
}

setInterval(() => {
  const f = S && S.expedition && S.expedition.fight;
  if (!f || f.paused || f.over) return;
  f.speed = fightSpeed;
  step(f, 0.1);
  if (f.over) f.paused = true;
  tickFight();
  playFx(f);
}, 100);


let pushing = null;
const stopPush = () => { clearInterval(pushing); pushing = null; };
document.addEventListener("pointerdown", (ev) => {
  if (pushing || !ev.target.closest?.("[data-hold=push]:not(:disabled)")) return;
  const beat = () => {
    const e = S.expedition, k = e && !e.fight && !e.event && !hurting() && nextStep();
    // the food warning is a modal: let go first, so a yes takes one step and the next press carries on
    if (!k || (onlyEnoughHome() && !e.warned)) stopPush();
    if (k) run("move", k);
  };
  beat();
  pushing = setInterval(beat, 380);
});
for (const t of ["pointerup", "pointercancel", "blur"]) window.addEventListener(t, stopPush);

const EGG_FLOOR = 6;
const elFor = (u) => document.querySelectorAll(u.side === "h" ? ".hero" : ".foe")[u.idx];

function playFx(f) {
  const box = $(".fightbox");
  let lag = 0;
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
      const heat = Math.min(4, Math.max(0.15, f.odds) * (f.enemies.some((x) => x.boss) ? 1.6 : 1) * (1 + 0.04 * (S.expedition.map.floor - 1)));
      const r = box.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const ms = 1200 + 900 * heat, deep = f.enemies.some((x) => x.boss) && S.expedition.map.floor >= EGG_FLOOR;
      if (!(deep && chance(0.02) && Juice.solitaire("Victory", cx, cy))) {
        const big = Juice.float(cx, cy, "Victory", "banner", ms);
        if (big) big.style.fontSize = `${1.4 + 0.6 * heat}rem`;
      }
      const n = Math.max(1, Math.round(1 + 2 * heat)), waves = heat > 1.5 ? 3 : heat > 0.7 ? 2 : 1;
      for (let w = 0; w < waves; w++) for (let i = 0; i < n; i++) setTimeout(() => Juice.burst(r.left + r.width * ((i + 1) / (n + 1)), r.top + 30,
        { n: Math.round(8 + 10 * heat), colors: [...PAL.gold, "#9fe07a", "#b9a4d6"], speed: 160 + 60 * heat, up: 160 + 80 * heat, gravity: 520, life: 1 + 0.3 * heat, size: 3 + heat / 2, drag: 0.95 }), w * 500 + i * 90);
      setTimeout(() => { if (S.expedition?.fight === f) run("fightdone"); }, 1800);
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

const calmMotion = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
let sheetShut = 0;

// GitHub's mark (Octicons, MIT); brand marks aren't in the icon sets.
const GITHUB_MARK = `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

let installer = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installer = e; });
window.addEventListener("appinstalled", () => { installer = null; });
document.addEventListener("fullscreenchange", () => { if (sheet?.menu) renderSheet(); });

const GOALS = [
  ["Build a hut", () => built("hut"), { wood: 5 }],
  ["Put someone to work", () => S.grid.some((b) => b && b.worker), { food: 5 }],
  ["Reach floor 1", () => S.deepest >= 1, { food: 5 }],
  ["Research something", () => S.research.length > 0, { research: 2 }],
  ["Claim land", () => S.cleared > 0, { stone: 5 }],
  ["Reach floor 5", () => S.deepest >= 5, { silver: 2 }],
  ["Reach floor 10", () => S.deepest >= 10, { silver: 4 }],
  ["Reach floor 20", () => S.deepest >= 20, { starmetal: 1 }],
  ["Have 10 villagers", () => living().length >= 10, { food: 15 }],
  ["Level 10 villager", () => S.settlers.some((s) => s.level >= 10), { potions: 2 }],
  ["Build a chapel", () => built("chapel"), { herbs: 5 }],
  ["Find an enchanting room", () => S.arcane, { relics: 2 }],
  ["Build a storehouse", () => built("storehouse") || built("vault"), { stone: 10 }],
  ["Build the wonder", () => built("wonder"), { relics: 5 }],
];
function sheetGoals() {
  return `<div class="menu"><h3>🔔 Goals</h3><div class="goals">${GOALS.map(([t, ok, win]) => `<p class="${ok() ? "good" : "dim"}">${ok() ? "✓" : "○"} ${t} <span class="dim">${goods(win)}</span></p>`).join("")}</div></div>`;
}

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
  if (sheet.slots) return `<div class="menu"><h3>Save slots</h3><div class="slots">${[0, 1, 2].map((n) => {
    const s = n === slot ? { town: S.town, day: S.recruits ? null : S.day } : slotInfo(n);
    return `<button class="${n === slot ? "on" : ""}" data-act="slot" data-v="${n}">${s ? `${esc(s.town)}${s.day ? `<small>Day ${s.day}</small>` : ""}` : "＋"}</button>`;
  }).join("")}</div>` + (sheet.sure
    ? `<div class="row pair"><button data-act="slots">Keep playing</button><button class="danger" data-act="wipe">Delete ${esc(S.town)}</button></div>`
    : `<button class="danger wide" data-act="newgame" ${S.recruits ? "disabled" : ""}>New game</button>`) + `</div>`;
  const secret = sheet.secret ? `<div class="row pair bot"><span>🤖</span><input id="botdays" type="number" min="1" value="${botDays}" inputmode="numeric">
    <button data-act="bot">▶</button><button data-act="bot" data-v="all">∞</button><button data-act="botstop" ${botTimer ? "" : "disabled"}>⏹</button></div>` : "";
  return `<div class="menu"><h3>Settings</h3>${secret}<div class="themes">${THEMES.map(swatch).join("")}</div>${saves}<button class="wide" data-act="slots">🗂 Save slots</button>`
    + `<div class="row pair acts">${installer ? `<button class="install stack" data-act="install">📲<small>Install</small></button>` : ""}`
    + `<button class="stack ${speedOpen ? "on" : ""}" data-act="speed">🕐<small>Fight speed</small></button>${document.fullscreenEnabled ? `<button class="stack ${document.fullscreenElement ? "on" : ""}" data-act="fullscreen">⛶<small>Fullscreen</small></button>` : ""}</div>` + (speedOpen ? `<label class="speedrange"><span>Fight speed</span><input id="fightspeed" type="range" min="0" max="${SPEEDS.length - 1}" step="1" value="${SPEEDS.indexOf(fightSpeed)}"><b id="fsval">${fightSpeed}×</b></label>` : "")
    + `<a class="src" href="https://github.com/octoshrimpy/millhollow" target="_blank" rel="noopener">${GITHUB_MARK}<small>Source</small></a></div>`;
}

const ask = (title, text, act, v, labels, nay) => (sheet = { ask: { title, text, act, v, labels, nay, back: sheet } });
const sheetAsk = () => { const a = sheet.ask, [no, yes] = a.labels || ["✕<small>No</small>", "✓<small>Yes</small>"];
  return `<div class="menu"><h3>${a.title}</h3><p>${esc(a.text)}</p><div class="row pair"><button class="${a.nay ? "primary" : ""}" data-act="no">${no}</button><button class="${a.nay ? "" : "primary"}" data-act="yes">${yes}</button></div></div>`; };
const sheetKeep = () => { const on = guards()[sheet.keep], home = living().filter((s) => !away(s) && !plan.party.includes(s.id));
  return `<div class="menu"><h3>👀 Gate watch</h3><div class="watchers"><button data-act="keep" data-v="">✕ <b>None</b></button>${home.filter((s) => s === on || !isGuard(s)).map((s) =>
    `<button class="${s === on ? "on" : ""}" data-act="keep" data-v="${s.id}" ${s.laid != null ? "disabled" : ""}><img class="mini" src="${faceSrc(s)}" alt=""><span><b>${esc(s.name)}</b> ${CLASSES[s.cls].icon} ${s.level}<br><small>${statLine(stats(s), `❤️${s.hp}/${stats(s).hpMax}`)}</small></span></button>`).join("")}</div></div>`; };
const sheetEvents = () => { const take = feastCost(), wait = feastWait();
  return `<div class="menu"><h3>🎉 Events</h3><div class="watchers">
    <button data-act="dayoff">🏖 <span><b>Day off</b><br><small>No work. Ends the day.</small></span></button>
    <button data-act="feast" ${!afford(take) || wait ? "disabled" : ""}>🍖 <span><b>Feast</b><br><small>${wait ? `⏳ ${wait}d` : `−${take.food}${RESOURCES.food.icon}`}</small></span></button></div></div>`; };
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
  morph(inner, iconize(sheet.ask ? sheetAsk() : sheet.goals ? sheetGoals() : sheet.menu ? sheetMenu() : sheet.event ? sheetEvent() : sheet.visitor ? sheetVisitor() : sheet.trouble ? sheetTrouble() : sheet.person ? sheetPerson()
    : sheet.keep != null ? sheetKeep() : sheet.events ? sheetEvents() : sheetPlot(sheet.i)));
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

// The land keeps its place between renders as the map spot at the middle of the window, so
// newly revealed rows don't shift it. The first look is at the town hall. It's counted from the
// middle of the land, which stays put when the land grows.
let landPos = null;
const landGeo = (land) => {
  const g = land.firstElementChild, [a, b] = g.children;
  const step = b.offsetLeft - a.offsetLeft;
  const c = LAND >> 1;
  return step > 0 && { step, ox: a.offsetLeft, oy: a.offsetTop, x0: +g.dataset.x0 - c, y0: +g.dataset.y0 - c };
};
function placeLand(smooth) {
  const land = $("#land"), geo = land && landGeo(land);
  if (!geo) return;
  const [hx, hy] = xy(S.hall ?? MID).map((v) => v - (LAND >> 1));
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

// Map zoom: --zoom scales the tile size. Pinch on touch, ctrl+wheel or +/- on desktop.
(() => {
  const root = document.documentElement, pts = new Map();
  let z = 1, d0 = 0, z0 = 1;
  try { z = +localStorage.getItem("mh-zoom") || 1; } catch (e) {}
  const clamp = (v) => Math.max(0.6, Math.min(2, v));
  const set = (v) => {
    z = clamp(v); root.style.setProperty("--zoom", z);
    try { localStorage.setItem("mh-zoom", z); } catch (e) {}
  };
  set(z);
  const dist2 = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch" || !e.target.closest("#land")) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { d0 = dist2(); z0 = z; }
  });
  document.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && d0) set(z0 * dist2() / d0);
  });
  const up = (e) => { pts.delete(e.pointerId); d0 = 0; };
  window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  document.addEventListener("wheel", (e) => {
    if (!e.ctrlKey || !e.target.closest("#land")) return;
    e.preventDefault(); set(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
  }, { passive: false });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || !$("#land") || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "+" || e.key === "=") set(z * 1.15); else if (e.key === "-") set(z / 1.15);
  });
})();

// A touch drag scrolls the page instead (pan-y), so on a phone it's the taps.
(() => {
  let pc = null, from = null, moved = false;
  const reset = () => { if (pc && moved) render(); pc = null; };
  document.addEventListener("pointerdown", (e) => {
    pc = e.target.closest(".lane .pc:not(.dead)");
    from = pc && { x: e.clientX, y: e.clientY };
    moved = false;
  });
  document.addEventListener("pointermove", (e) => {
    if (!pc) return;
    const dx = e.clientX - from.x, dy = e.clientY - from.y;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    moved = true;
    pc.classList.add("drag");
    pc.style.transform = `translate(${dx}px, ${dy}px)`;
    document.querySelectorAll(".lane").forEach((l) => l.classList.toggle("over", l === document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.matches(".lane"))));
  });
  window.addEventListener("pointercancel", reset);
  window.addEventListener("pointerup", (e) => {
    if (!pc) return;
    const to = moved && document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.matches(".lane"));
    const id = pc.dataset.v;
    pc = null;
    if (to && !to.contains(document.querySelector(`.lane .pc[data-v="${id}"]`))) { picked = null; run("row", id, to); }
    else if (moved) render();
  });
  document.addEventListener("click", (e) => {
    if (moved) { moved = false; e.stopPropagation(); e.preventDefault(); return; }
    const lane = e.target.closest(".lane");
    if (!lane) return;
    const one = e.target.closest(".pc:not(.dead)"), id = one && +one.dataset.v;
    if (one && id === picked) { picked = null; return; }
    e.stopPropagation(); e.preventDefault();
    if (one) picked = id;
    else if (picked != null) { const v = picked; picked = null; if (rowOf(byId(v)) !== lane.dataset.row) return run("row", v, lane); }
    render();
  }, true);
})();

// Buttons marked data-hold repeat while held, faster the longer the hold. The page re-renders
// under the finger, so the repeat runs off the action name, not the element.
(() => {
  let timer = null, repeated = false;
  const stop = () => { clearTimeout(timer); timer = null; };
  document.addEventListener("pointerdown", (e) => {
    // reset on every press: a hold whose button re-rendered away never gets its click, and the flag would eat the next tap
    repeated = false;
    const el = e.target.closest("[data-hold][data-act]");
    if (!el || el.disabled) return;
    const act = el.dataset.act, v = el.dataset.v;
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
  tab: (v) => {
    if (v === "log" && wide.matches) {
      const was = tab === "log", off = !was && root.classList.toggle("nolog");
      if (was) root.classList.remove("nolog");
      try { localStorage.setItem("mh-sidelog", off ? "0" : "1"); } catch {}
      if (was) { tab = S.expedition ? "dungeon" : "village"; return; }
      return "keep";
    }
    tab = v; sheet = null;
  },
  asides: () => (root.classList.toggle("asides"), "keep"),
  older: () => (older = true),
  goals: () => { S.goalNew = false; save(); sheet = { goals: true }; },
  menu: () => { if (secretOpened) { secretOpened = false; return "keep"; } sheet = { menu: true }; },
  theme: (v) => { applyTheme(v); },
  newgame: () => (sheet = { menu: true, slots: true, sure: true }),
  slots: () => (sheet = { menu: true, slots: true }),
  slot: (v) => { if (+v === slot) return "keep"; backTo = slotInfo(+v) || S.recruits ? null : slot; useSlot(+v); landPos = null; plan = { party: [], rations: 6, meals: 0, floor: 1 }; tab = "village"; sheet = null; knocked = null; chosen = []; },
  towns: () => { S.towns = places(); S.town = S.towns[0]; save(); const el = document.getElementById("town"); if (el) el.value = S.town; },
  town: (v) => { S.town = v; save(); const el = document.getElementById("town"); if (el) el.value = v; },
  recruit: (v) => {
    const id = +v;
    if (chosen.includes(id)) chosen = chosen.filter((x) => x !== id);
    else if (chosen.length < STARTERS) chosen.push(shine = id);
  },
  reroll: () => {
    if (cooled > Date.now()) return "keep";
    reroll(chosen);
    cooled = Date.now() + 3000;
    setTimeout(() => { if (S.recruits) render(); }, 3000);
  },
  settlein: () => { settleIn(chosen); chosen = []; },
  wipe: () => { newGame(); landPos = null; plan = { party: [], rations: 6, meals: 0, floor: 1 }; tab = "village"; sheet = null; knocked = null; },
  plot: (v) => (sheet = { i: +v }),
  close: () => (sheet = null),
  back: () => {
    const to = backTo ?? [0, 1, 2].find((n) => n !== slot && slotInfo(n) && !slotInfo(n).founding);
    if (to != null) { useSlot(to); backTo = null; landPos = null; tab = "village"; }
    sheet = { menu: true, slots: true };
  },
  imported: (v) => importCode(v),
  clear: () => { clearLand(sheet.i); sheet = null; },
  build: (v) => {
    build(sheet.i, v);
    sheet = null;
    if (v === "townhall") setTimeout(() => placeLand(true), 60);
  },
  center: () => { placeLand(true); return "keep"; },
  demolish: () => {
    const back = Object.entries(refundOf(sheet.i)).map(([k, v]) => `${v} ${RESOURCES[k].name.toLowerCase()}`).join(", ");
    ask(back ? `Demolish? Get back ${back}.` : "Demolish? No refund.", "demolished", sheet.i);
  },
  demolished: (v) => { demolish(+v); sheet = null; },
  yes: () => { const a = sheet.ask; sheet = a.back; ACTS[a.act](a.v); },
  no: () => { const a = sheet.ask; sheet = a.back; if (a.nay) ACTS[a.nay](); },
  upgrade: () => upgrade(sheet.i),
  improve: () => improve(sheet.i),
  assign: (v) => { assign(sheet.i, +v); sheet = null; },
  endday: () => passDays(1),
  bot: (v) => { botDays = Math.max(1, +$("#botdays").value || 1); botLeft = v === "all" ? Infinity : botDays; sheet = null; clearTimeout(botTimer); botTimer = setTimeout(botStep, 0); },
  botstop: () => { clearTimeout(botTimer); botTimer = null; save(); },
  visitor: (v) => { welcomeVisitor(v === "1"); sheet = null; },
  knock: () => (sheet = { visitor: true }),
  alarm: () => (sheet = { trouble: true }),
  settle: (v) => { settle(v); save(); sheet = null; },
  person: (v) => { sheet = { person: +v }; gearPick = null; },
  lifetab: (v) => { sheet.ties = v === "ties"; },
  guard: () => setGuard(sheet.person),
  keepdrop: (v) => (sheet = { keep: +v }),
  events: () => (sheet = { events: true }),
  dayoff: () => { sheet = null; dayOff(); passDays(1); },
  feast: () => { sheet = null; feast(); save(); },
  keep: (v) => { const on = guards()[sheet.keep]; if (on && on.id !== +v) setGuard(on.id); if (v && on?.id !== +v) setGuard(+v); sheet = null; },
  gearpick: (v) => (gearPick = gearPick && gearPick.id === sheet.person && gearPick.slot === v ? null : { id: sheet.person, slot: v }),
  equip: (v, el) => { equip(+v, +el.dataset.uid); gearPick = null; },
  unequip: (v, el) => { unequip(+v, el.dataset.slot); gearPick = null; },
  row: (v, el) => { byId(+v).row = el.dataset.row; save(); },
  craft: (v) => craft(v),
  brew: () => brew(),
  research: (v) => doResearch(v),
  camp: () => camp(),
  pick: (v) => {
    const id = +v, i = plan.party.indexOf(id);
    if (refuses(byId(id)) || avenges(byId(id))) return;
    if (i >= 0) plan.party.splice(i, 1);
    else if (plan.party.length < partyMax()) plan.party.push(id);
  },
  rations: (v) => (plan.rations = Math.max(0, Math.min(S.res.food, plan.rations + +v))),
  meals: (v) => (plan.meals = Math.max(0, Math.min(S.res.meals, (plan.meals || 0) + +v))),
  depart: () => depart(plan.party, plan.rations, plan.floor, plan.meals || 0, plan.site || 0, !!plan.scav),
  mode: (v) => (plan.scav = v === "1"),
  site: (v) => { plan.site = +v; plan.floor = 1; },
  tosite: (v) => { plan.site = +v; plan.floor = 1; tab = "expedition"; sheet = null; },
  move: (v) => {
    const e = S.expedition;
    if (e && !e.warned && canMove(v) && onlyEnoughHome()) {
      return ask("Not enough food!", `Food left only covers the walk home (${homeDays()}d, ${homeFood()} rations).`, "moved", v, ["🏘 Head home", "👣 Keep going"], "home");
    }
    move(v);
  },
  moved: (v) => { S.expedition.warned = true; move(v); },
  event: (v) => { resolveEvent(v); if (sheet?.event) sheet = null; },
  asked: () => (sheet = { event: true }),
  forgetab: (v) => (forgeTab = v),
  descend: () => descend(),
  home: () => returnHome(),
  focus: (v) => { const f = S.expedition.fight; f.focus = f.enemies[+v].hp > 0 ? +v : null; tickFight(); return "keep"; },
  potion: (v) => { usePotion(+v); tickFight(); renderTop(); playFx(S.expedition.fight); return "keep"; },
  lane: (v) => { const f = S.expedition.fight, h = f.heroes[+v]; if (h.hp > 0 && !f.over) { byId(h.id).row = h.row = h.row === "back" ? "front" : "back"; f.front = null; } tickFight(); return "keep"; },
  pause: () => { const f = S.expedition.fight; f.paused = !f.paused; tickFight(); return "keep"; },
  speed: () => { speedOpen = !speedOpen; },
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
  fullscreen: () => { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen({ navigationUI: "hide" })).catch(() => {}); },
  install: () => { installer.prompt(); installer.userChoice.then(() => { installer = null; if (sheet) renderSheet(); }); return "keep"; },
  savefile: () => {
    exportSave().then((code) => {
      // Inside the Android app the page can't download; the app asks where to put it.
      if (window.Android) return Android.saveFile(`millhollow-day${S.day}.txt`, code);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
      a.download = `millhollow-day${S.day}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    return "keep";
  },
  saveopen: () => { $("#savepick").click(); return "keep"; },
  saveload: () => loadCode($("#savecode").value),
};

function loadCode(text) {
  if (!String(text).trim()) { $("#savecode").focus(); return "keep"; }
  ask("Load save", "Replace this game?", "imported", text);
}
function importCode(text) {
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

// Android's back key lands here: close the open sheet, leave an unfounded village, or go to the first tab.
let backTo = null;
function goBack() {
  const home = S.expedition ? "dungeon" : "village";
  if (sheet) run("close");
  else if (S.recruits) run("back");
  else if (tab !== home) run("tab", home);
  else return false;
  return true;
}

// Secret settings: hold the gear 5s. The bot plays a day at a time until botLeft runs out or Stop.
let botTimer = null, botLeft = 0, botDays = 30, held = null, secretOpened = false;
function botStep() {
  if (botLeft-- <= 0 || S.expedition || S.recruits || !living().length) { botTimer = null; save(); return render(); }
  const before = snap();
  Bot.day(); save();
  botTimer = setTimeout(botStep, 400);
  render(); celebrate(before);
}
$("#menu").addEventListener("pointerdown", () => { clearTimeout(held); held = setTimeout(() => { secretOpened = true; sheet = { menu: true, secret: true }; render(); }, 5000); });
["pointerup", "pointerleave", "pointercancel"].forEach((k) => $("#menu").addEventListener(k, () => clearTimeout(held)));
$("#menu").addEventListener("contextmenu", (e) => e.preventDefault());

// these swap in a different village, so a diff against the old one is not news
const NEW_WORLD = ["slot", "back", "wipe"];
function run(act, v, el) {
  const before = snap(), was = tab, life = act === "lifetab" && !!sheet.ties !== (v === "ties");
  if (ACTS[act](v, el) === "keep") return;
  const draw = () => { render(); if (!NEW_WORLD.includes(act)) celebrate(before); };
  if ((tab === was && !life) || !wide.matches || !document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return draw();
  const order = [...document.querySelectorAll("#tabs button")].map((b) => b.dataset.v);
  root.dataset.vt = life ? "life" : "tab";
  root.dataset.slide = life ? (v === "ties" ? "on" : "back") : order.indexOf(tab) < order.indexOf(was) ? "back" : "on";
  document.startViewTransition(draw);
}

function snap() {
  const e = S.expedition;
  return {
    res: { ...S.res }, day: S.day, logN: S.logN || 0, grid: S.grid.map((b) => b && b.type), claim: S.claim, won: !!S.won,
    exp: e && { crowns: e.crowns || (e.crown ? 1 : 0), at: e.map.at, floor: e.map.floor, seen: Object.keys(e.map.rooms).filter((k) => e.map.rooms[k].seen),
      done: Object.keys(e.map.rooms).filter((k) => e.map.rooms[k].done) },
  };
}

const LOUD = /now level|died|joined|Learned|wiped out/;

function celebrate(b) {
  const e = S.expedition;
  // ponytail: old saves start with whatever's already done, so nothing fires retroactively
  if (!S.goals) S.goals = GOALS.filter(([, ok]) => ok()).map(([t]) => t);
  const fresh = GOALS.filter(([t, ok]) => !S.goals.includes(t) && ok()).map(([t]) => t);
  if (fresh.length) {
    S.goals.push(...fresh); S.goalNew = true;
    GOALS.filter(([t]) => fresh.includes(t)).forEach(([, , win]) => { for (const k in win) S.res[k] += win[k]; });
    renderTop(); save();
  }
  fresh.forEach((t, n) => setTimeout(() => {
    const v = Juice.center($("#view")), bell = $("#goals");
    Juice.float(v.x, v.y, `✓ ${t}`, "banner goal", 1600);
    Juice.burst(v.x, v.y, { n: 30, colors: PAL.gold, speed: 220, up: 160, gravity: 520, life: 1.1, size: 3, drag: 0.95 });
    setTimeout(() => Juice.carry("🔔", $("#view"), bell, () => {
      const p = Juice.center(bell);
      Juice.pop(bell, 1.5);
      Juice.burst(p.x, p.y, { n: 20, colors: PAL.gold, speed: 160, up: 60, life: 0.7, size: 3, spark: true });
    }), 900);
  }, 500 + n * 1800));
  if (e && b.exp && (e.crowns || (e.crown ? 1 : 0)) > b.exp.crowns) setTimeout(() => Juice.prize("👑", $("#res")), 400);
  if (S.won && !b.won) setTimeout(() => {
    const v = Juice.center($("#view"));
    Juice.veil("The wonder stands", S.town);
    Juice.float(v.x, v.y, "🗼 Wonder raised", "banner goal", 3200);
    [0, 250, 500, 800].forEach((d, n) => setTimeout(() => {
      Juice.burst(v.x, v.y, { n: 60, colors: PAL.gold, speed: 260 + n * 40, up: 200, gravity: 520, life: 1.4, size: 3, drag: 0.95 });
      Juice.wave(v.x, v.y, 140 + n * 60, { colors: PAL.gold, size: 3 });
    }, d));
  }, 900);
  if (S.claim > b.claim) {
    placeLand(true);
    setTimeout(() => {
      const hall = document.querySelector(`.tile[data-i="${S.hall}"]`);
      if (!hall) return;
      Juice.carry("👑", $("#res"), hall, () => {
        const p = Juice.center(hall), step = hall.getBoundingClientRect().width + 6;
        Juice.pop(hall, 1.3);
        Juice.burst(p.x, p.y, { n: 24, colors: PAL.gold, speed: 160, up: 60, life: 0.7, size: 3, spark: true });
        Juice.wave(p.x, p.y, (claimR() + 0.5) * step, { colors: PAL.gold, size: 3 });
        setTimeout(() => Juice.wave(p.x, p.y, (claimR() + 0.5) * step, { n: 64, colors: PAL.gold, size: 2, life: 1.8 }), 180);
      });
    }, b.exp && !e ? 1500 : 300);
  }
  for (const k in S.res) {
    const d = Math.round((S.res[k] - b.res[k]) * 10) / 10, el = document.querySelector(`#res [data-k="${k}"]`);
    if (!d || !el) continue;
    Juice.pop(el, 1.35);
    const p = Juice.center(el);
    Juice.float(p.x, p.y + 16, `${d > 0 ? "+" : ""}${d}`, `res ${d > 0 ? "up" : "down"}`);
  }

  if (S.day > b.day) {
    Juice.pop(document.querySelector("#res .day"), 1.4);
    lastYields.forEach(({ i, got }, n) => Object.entries(got).forEach(([k, amt], j) => setTimeout(() => {
      const tile = document.querySelector(`.tile[data-i="${i}"]`);
      if (!tile) return;
      const p = Juice.center(tile);
      Juice.float(p.x, p.y - 6, `+${Math.round(amt * 10) / 10}${RESOURCES[k].icon}`, "yield");
      Juice.burst(p.x, p.y, { n: 6, colors: PAL.gold, speed: 60, up: 60, gravity: -30, life: 0.6, size: 2 });
    }, 150 + n * 70 + j * 260)));
  }

  S.grid.forEach((t, i) => {
    if ((t && t.type) === b.grid[i]) return;
    const el = document.querySelector(`.tile[data-i="${i}"]`);
    if (!el) return;
    const p = Juice.center(el);
    Juice.burst(p.x, p.y + 12, { n: 26, colors: PAL.dust, speed: 150, up: 30, gravity: 120, life: 0.8, size: 5 });
    if (t) { Juice.pop(el, 1.25); Juice.burst(p.x, p.y, { n: 14, colors: PAL.gold, speed: 180, up: 80, life: 0.6 }); }
  });

  if (b.exp && e && b.exp.floor === e.map.floor) {
    for (const [k, r] of Object.entries(e.map.rooms)) {
      const el = r.quick && r.done && !b.exp.done.includes(k) && document.querySelector(`.room[data-k="${k}"]`);
      if (!el) continue;
      const p = Juice.center(el);
      Juice.pop(el, 1.15);
      Juice.burst(p.x, p.y, { n: 30, colors: [...PAL.gold, "#9fe07a", "#b9a4d6"], speed: 220, up: 160, gravity: 520, life: 1.1, size: 3, drag: 0.95 });
    }
  }

  if (!b.exp && e) Juice.veil("Dungeon", `Floor ${e.map.floor}`);
  else if (b.exp && !e) Juice.veil(S.town, `Day ${S.day}`);
  else if (b.exp && e && e.map.floor !== b.exp.floor) Juice.veil(`Floor ${e.map.floor}`, keeper(siteOf(), e.map.floor) ? "Boss floor" : "");
  else if (b.exp && e && e.map.at !== b.exp.at) {
    const here = $(".room.here"), r = e.map.rooms[e.map.at], fresh = r.done && !b.exp.done.includes(e.map.at);
    if (here && fresh && (r.type === "treasure" || r.type === "shrine")) {
      const p = Juice.center(here);
      Juice.pop(here, 1.15);
      if (r.type === "treasure") Juice.burst(p.x, p.y, { n: 20, colors: PAL.gold, speed: 200, up: 140, gravity: 500, life: 0.8, size: 3, spark: true });
      else Juice.burst(p.x, p.y, { n: 16, colors: PAL.heal, speed: 50, up: 70, gravity: -100, life: 0.9, size: 3 });
    }
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

document.addEventListener("input", (e) => {
  if (e.target.id === "town") { S.town = e.target.value; save(); }
  if (e.target.id === "fightspeed") {
    fightSpeed = SPEEDS[+e.target.value];
    $("#fsval").textContent = `${fightSpeed}×`;
    try { localStorage.setItem("mh-speed", fightSpeed); } catch {}
  }
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "savepick") { const f = el.files[0]; el.value = ""; if (f) f.text().then(loadCode); return; }
  if (!el.dataset.act) return;
  if (el.dataset.act === "floor") plan.floor = +el.value;
  render();
});

document.addEventListener("keydown", (e) => {
  const f = S.expedition && S.expedition.fight;
  if (!f) return;
  if (e.code === "Space") { e.preventDefault(); document.activeElement.blur(); run(f.over ? "fightdone" : "pause"); }
});

// Every 10 minutes and whenever the page comes back into view, ask the server for the page's
// and scripts' ETags. If any changed since this page loaded, save and reload: at once when coming
// back into view, otherwise after 30s without a tap. Never mid-fight.
const updates = { tags: null, ready: false, lastTap: Date.now() };
const codeFiles = () => ["./", ...[...document.scripts].map((s) => s.src).filter(Boolean)];
const etags = () => Promise.all(codeFiles().map((u) =>
  fetch(u, { method: "HEAD", cache: "no-store" }).then((r) => r.headers.get("etag") || r.headers.get("last-modified") || "")))
  .then((t) => t.join("|"));
function reloadIfSafe(now) {
  if (!updates.ready || (S.expedition && S.expedition.fight)) return;
  if (!now && Date.now() - updates.lastTap < 30000) return;
  save();
  location.reload();
}
function checkUpdate(now) {
  if (!navigator.onLine) return;
  etags().then((t) => {
    if (updates.tags == null) updates.tags = t;
    else if (t !== updates.tags) updates.ready = true;
    reloadIfSafe(now);
  }).catch(() => {});
}
if (location.protocol.startsWith("http") && !window.Android) {
  checkUpdate();
  setInterval(() => (updates.ready ? reloadIfSafe() : checkUpdate()), 10 * 60 * 1000);
  setInterval(() => updates.ready && reloadIfSafe(), 5000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkUpdate(true); });
  window.addEventListener("pointerdown", () => (updates.lastTap = Date.now()), true);
}

if (!load()) newGame();
render();
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("boot")));
