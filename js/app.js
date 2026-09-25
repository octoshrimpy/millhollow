// Stage 1 — the playable layer over js/sim.js.
// The world only moves when the player taps. Nothing here runs on a clock.

const SAVE = "millhollow.stage1";
// FACE_IDS, AGES, MOODS and portrait() come from sim.js — the sim hands each
// villager a face, so it owns the pool.
const LEADER_AGES = AGE_IDS.slice(1); // an expedition does not send a child

// First names come from sim.js — one pool for the whole village, the leader
// included, because a name has to suit a face and the sim is what knows which
// face is which. Surnames stay here: the leader gets the longer list.
const LAST = [
  "Ashdown", "Quill", "Fennimore", "Bray", "Holloway", "Stint", "Marrow",
  "Vane", "Redlow", "Crane", "Barrowe", "Cleave", "Dunmore", "Elmgate",
  "Fallowes", "Garrow", "Hathersedge", "Inglebright", "Kettle", "Lockwood",
  "Mardle", "Netherby", "Oakhurst", "Prideaux", "Rookwood", "Selby",
  "Thorncastle", "Underhill", "Vellacott", "Winterbourne", "Yardley",
  "Ambry", "Bellweather", "Corvish", "Deverel", "Ferrers", "Glaswell",
  "Hobb", "Larkspur", "Mortlake",
];
const any = (xs) => xs[Math.floor(Math.random() * xs.length)];

// A repeat inside a handful of taps reads as a bug even when it isn't, so
// each pool remembers what it last handed out and refuses to repeat it.
function roller(xs, keep = 3) {
  const recent = [];
  const n = Math.min(keep, xs.length - 1); // never exclude the whole pool
  return () => {
    const x = any(xs.filter((v) => !recent.includes(v)));
    recent.push(x);
    if (recent.length > n) recent.shift();
    return x;
  };
}
const rollLast = roller(LAST);
// The first-name pool depends on the face, so it cannot be a fixed roller. One
// recent list spans every sex — stepping from a man's face to a woman's and back
// should not hand back the name just seen.
const recentFirst = [];
const rollFirst = (sex) => {
  const pool = namesFor(sex);
  const free = pool.filter((n) => !recentFirst.includes(n));
  const x = any(free.length ? free : pool);
  recentFirst.push(x);
  if (recentFirst.length > 3) recentFirst.shift();
  return x;
};
const rollName = (sex) => `${rollFirst(sex)} ${rollLast()}`;

// no console on a phone — put failures where they can be read
window.onerror = (msg, src, ln) => {
  const d = document.createElement("pre");
  d.style.cssText = "color:#e08a6a;white-space:pre-wrap;padding:1em;font-size:14px";
  d.textContent = `${msg}\n${(src || "").split("/").pop()}:${ln}`;
  document.body.appendChild(d);
};

const el = (id) => document.getElementById(id);
const $log = el("log"), $inner = el("log-inner"), $sheet = el("sheet"), $box = el("sheet-box");

let S = null;      // what gets saved: seed, leader, and every input in order
let w, leader;     // the live world, rebuilt from S on load
let pending = [];  // answers given but not yet lived through
let shown = 0, lastDay = null;

// ---------- save is the input log, not the world ----------
// ponytail: replaying a seeded sim beats serialising it. ~40 bytes a turn.
// `seen` is the only wall-clock value stored, and it never reaches the sim.
// It buys the leader an itinerary on the way back in; it does not buy the
// village time. See "coming back" below.
const save = () => { S.seen = Date.now(); localStorage.setItem(SAVE, JSON.stringify(S)); };

function rebuild() {
  w = genWorld(S.seed, 5, S.face, S.name.split(" ")[0]);
  w.leaderAt = "old_mill";
  leader = { id: -1, name: S.name, bg: S.bg, face: S.face, bracket: S.bracket };
  w.leader = leader;
  for (const t of S.log) advance(w, leader, t.a, t.d);
}

// ---------- start ----------
function startScreen() {
  el("start").hidden = false;
  const draft = {};
  const $name = el("leader-name"), $img = el("face").querySelector("img"), $bg = el("bg");

  const paint = () => {
    $img.src = portrait(draft.face, draft.bracket);
    $name.value = draft.name;
    // no "what you will notice" line — the background is who you were, and what
    // that lets you see is found by reading the log, not by being told
    $bg.querySelector(".t").textContent = BACKGROUNDS[draft.bg].name;
    const i = LEADER_AGES.indexOf(draft.bracket);
    el("years").textContent = AGES.find((a) => a.id === draft.bracket).label;
    el("younger").disabled = i === 0;
    el("older").disabled = i === LEADER_AGES.length - 1;
  };

  // tapping a field steps to the next one, so it can be browsed, not gambled
  const nextIn = (xs, cur) => xs[(xs.indexOf(cur) + 1) % xs.length];
  el("face").onclick = () => {
    draft.face = nextIn(FACE_IDS, draft.face);
    // a name that no longer suits the new face is replaced — but never one the
    // player typed, which is theirs to have not suit anything
    const first = draft.name.split(" ")[0];
    if (!draft.typed && !namesFor(sexOf(draft.face)).includes(first))
      draft.name = rollName(sexOf(draft.face));
    paint();
  };
  el("bg").onclick = () => { draft.bg = nextIn(BG_IDS, draft.bg); paint(); };
  el("name-next").onclick = () => { draft.name = rollName(sexOf(draft.face)); paint(); };
  $name.oninput = () => { draft.name = $name.value; draft.typed = true; };
  // the same person, older or younger — the face id does not change
  const shift = (d) => () => {
    const i = LEADER_AGES.indexOf(draft.bracket) + d;
    if (i < 0 || i >= LEADER_AGES.length) return;
    draft.bracket = LEADER_AGES[i];
    paint();
  };
  el("younger").onclick = shift(-1);
  el("older").onclick = shift(1);

  const rollFace = roller(FACE_IDS), rollBg = roller(BG_IDS);
  const roll = () => {
    draft.face = rollFace();
    draft.bg = rollBg();
    draft.bracket = any(LEADER_AGES);
    draft.typed = false; // a fresh candidate is nobody the player has named yet
    draft.name = rollName(sexOf(draft.face));
  };

  // this one walks off, the next one walks on. Reduced motion gets the swap
  // with no travel — animationend never fires there, so don't wait on it.
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const card = el("card");
  el("again").onclick = () => {
    if (still.matches || card.classList.contains("out")) { roll(); paint(); return; }
    card.classList.remove("in");
    card.classList.add("out");
    card.addEventListener("animationend", () => {
      card.classList.remove("out");
      roll();
      paint();
      card.classList.add("in");
      card.addEventListener("animationend", () => card.classList.remove("in"), { once: true });
    }, { once: true });
  };

  roll(); // arrive as somebody, not as a blank form
  paint();

  el("begin").onclick = () => {
    draft.name = $name.value.trim() || rollName(sexOf(draft.face));
    S = { seed: Math.floor(Math.random() * 1e9), log: [], ...draft };
    save();
    el("start").hidden = true;
    boot();
  };
}

// ---------- the book ----------
function line(cls, text) {
  const p = document.createElement("p");
  if (cls) p.className = cls;
  p.textContent = text;
  $inner.appendChild(p);
}

const asks = document.createElement("div");
const awayBox = document.createElement("div");

function appendNew() {
  for (; shown < w.events.length; shown++) {
    const e = w.events[shown];
    if (e.turn < 0) continue; // history, printed once at the top
    const t = renderEvent(e, leader, w);
    if (!t) continue;
    if (e.turn !== lastDay) { lastDay = e.turn; line("day", "Day " + e.turn); }
    line("", t);
  }
  // where you were comes first, then the open questions — both stay at the bottom
  $inner.appendChild(awayBox);
  $inner.appendChild(asks);
}

function renderAsks() {
  asks.innerHTML = "";
  for (const p of w.open) {
    if (pending.some(([id]) => id === p.b.id)) continue;
    const d = document.createElement("div");
    d.className = "ask";
    const place = placeById(w, p.b.place);
    let t = `${p.by.name} - asks for ${p.b.bare} at ${place.bare} : ${p.b.need} ${p.b.res}`;
    if (p.rival) t += ` — rules out the ${p.rival.bare}`;
    d.innerHTML = `<div></div><div class="acts"></div>`;
    d.firstChild.textContent = t;
    for (const [label, yes] of [["Agree", true], ["Not yet", false]]) {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => { pending.push([p.b.id, yes]); renderAsks(); };
      d.lastChild.appendChild(b);
    }
    asks.appendChild(d);
  }
}

const scroll = () => { $log.scrollTop = $log.scrollHeight; };

// ---------- coming back ----------
// Time away buys the leader an itinerary and nothing else. The village does not
// move while the tab is shut — each pick IS a turn, generated on the tap that
// makes it, so closing the game mid-day leaves that day exactly where it was.
//
// Longer gone means more picks, not more options per pick: four things you did
// reads as a month, where one choice out of eight just reads as a bigger menu.
// What a long absence actually unlocks is options a daily player never sees,
// and every payout is lateral — a name, a place, something somebody said — so
// staying away is never the better play.
let awayLeft = 0, awayHours = 0;
const awayTaken = [];

const spellGap = (h) =>
  h < 2 ? "an hour or so" : h < 20 ? `${Math.round(h)} hours`
  : h < 48 ? "a day" : h < 24 * 14 ? `${Math.round(h / 24)} days`
  : `${Math.round(h / 168)} weeks`;

function renderAway() {
  awayBox.innerHTML = "";
  const pool = awayOpts(awayHours).filter((o) => !awayTaken.includes(o.id));
  if (awayLeft <= 0 || !pool.length) {
    awayLeft = 0;
    for (const b of document.querySelectorAll("#bar button")) b.disabled = false;
    return;
  }
  for (const b of document.querySelectorAll("#bar button")) b.disabled = true;

  // the rarest thing the absence unlocked is always on the table, so the time
  // away is visible in the choice rather than announced in a number
  const rare = pool.reduce((a, b) => (b.hrs > a.hrs ? b : a));
  const rest = pool.filter((o) => o !== rare).sort(() => Math.random() - 0.5).slice(0, 2);
  const offer = [rare, ...rest].sort(() => Math.random() - 0.5);

  const d = document.createElement("div");
  d.className = "ask";
  d.innerHTML = `<div></div><div class="opts"></div>`;
  d.firstChild.textContent = awayTaken.length
    ? `And then?  (${awayLeft} more)`
    : `You were gone ${spellGap(awayHours)}. What were you doing?`;
  for (const o of offer) {
    const b = document.createElement("button");
    b.className = "opt";
    b.innerHTML = `<span></span><span class="d"></span>`;
    b.firstChild.textContent = o.label;
    b.lastChild.textContent = o.det;
    b.onclick = () => {
      awayTaken.push(o.id);
      awayLeft--;
      step({ kind: "away", id: o.id });
    };
    d.lastChild.appendChild(b);
  }
  awayBox.appendChild(d);
}

function step(action) {
  advance(w, leader, action, pending);
  S.log.push({ a: action, d: pending });
  pending = [];
  save();
  appendNew();
  renderAsks();
  renderAway();
  scroll();
}

// ---------- sheets ----------
function sheet(title, rows) {
  $box.innerHTML = `<h2>${title}</h2>`;
  for (const r of rows) $box.appendChild(r);
  $sheet.hidden = false;
}
$sheet.onclick = (e) => { if (e.target === $sheet) $sheet.hidden = true; };

function opt(text, detail, fn) {
  const b = document.createElement("button");
  b.className = "opt";
  b.innerHTML = `<span></span><span class="d"></span>`;
  b.firstChild.textContent = text;
  b.lastChild.textContent = detail;
  b.onclick = () => { $sheet.hidden = true; fn(); };
  return b;
}

function goOut() {
  sheet("Go where", outside(w).map((p) =>
    opt(cap(p.name), p.tags.join(", "), () => step({ kind: "range", place: p.id }))));
}

// The face a villager is wearing right now. "scared" is drawn but unused —
// nothing in the sim frightens anyone yet.
const moodOf = (v) => {
  if (v.injured > 0) return "sad";
  const me = opinion(v, -1, w.turn);
  return me > 0.6 ? "happy" : me < -0.6 ? "angry" : "neutral";
};
const mugOf = (v) => {
  const img = document.createElement("img");
  img.alt = "";
  img.src = portrait(v.face, v.bracket, moodOf(v));
  return img;
};

// Odds in the only form this game states them: how many days in ten. Everything
// the player is asked to bet on is quoted this way, so two numbers can be
// compared without working out what either one is a fraction of.
const inTen = (x) => `${Math.round(x * 10)} in 10`;
const jobName = (v) => v.taught && (TASKS.find((t) => t.id === v.taught.t) || {}).id;

function workWith() {
  sheet("Work with", w.villagers.map((v) => {
    const best = Object.entries(v.skills).sort((a, b) => b[1] - a[1])[0];
    const on = jobName(v);
    // what they are already on comes first: it is the thing you would be
    // interrupting, and the number next to it is the bet you already made
    const detail = v.injured > 0 ? "laid up"
      : on ? `on the ${on} — ${inTen(holdOf(w, v))} to stay with it`
      : (best ? `${best[0]} ${best[1]}, likes ${v.likes}` : `no skill yet, likes ${v.likes}`);
    const b = opt(v.name, detail, () => showJobs(v));
    b.classList.add("mugged");
    b.prepend(mugOf(v));
    if (v.injured > 0) { b.disabled = true; b.style.opacity = .4; }
    return b;
  }));
}

// The second half of working with someone: what to put your hands to in front
// of them. The odds quoted are the chance they turn up to it again tomorrow
// with nobody asking — which is the entire bet, so it is on the button.
function showJobs(v) {
  const jobs = jobsFor(w, v).slice(0, 5);
  sheet(`Show ${v.name} what`, jobs.map((j) => {
    const like = j.p.tags.includes(v.likes) || j.t.tags.includes(v.likes);
    const hate = j.p.tags.includes(v.dislikes) || j.t.tags.includes(v.dislikes);
    const note = hate ? `hates ${v.dislikes}`
      : like ? `likes ${v.likes}`
      : `${j.t.skill} ${v.skills[j.t.skill] || 0}`;
    // holdOf reads only taught/skills/likes/dislikes, so a copy wearing this
    // job answers "what would the odds be" without touching the real villager
    const would = { ...v, taught: { t: j.t.id, p: j.p.id } };
    return opt(`${cap(j.t.id)} at ${j.p.bare}`,
      `${note} — ${inTen(holdOf(w, would))} to keep at it`,
      () => step({ kind: "work", v: v.id, task: j.t.id, place: j.p.id }));
  }));
}

function village() {
  const rows = w.villagers.map((v) => {
    const d = document.createElement("div");
    d.className = "who";
    const skills = Object.entries(v.skills).map(([k, n]) => `${k} ${n}`).join(", ")
      || "no skill worth naming";
    const feels = w.villagers.filter((o) => o.id !== v.id)
      .map((o) => [o, opinion(v, o.id, w.turn)])
      .filter(([, n]) => Math.abs(n) > 0.4)
      .sort((a, b) => b[1] - a[1]);
    const said = feels.length
      ? feels.map(([o, n]) => `${n > 0 ? "warm to" : "sour on"} ${o.name}`).join(", ")
      : "no strong word about anyone";
    const me = opinion(v, -1, w.turn);
    const ofyou = Math.abs(me) < 0.4 ? "has yet to make up their mind about you"
      : me > 0 ? "thinks well of you" : "does not think much of you";
    d.innerHTML = `<div class="txt"><div class="n"></div><div class="d"></div></div>`;
    d.prepend(mugOf(v));
    const was = BACKGROUNDS[v.bg].name;
    // a child has not been anything yet — they are still being made into it
    const past = v.bracket === "child" ? `Learning ${was.toLowerCase()}` : was;
    d.querySelector(".n").textContent = `${v.full}, ${v.age}`;
    d.querySelector(".d").textContent =
      `${past}. Likes ${v.likes}, dislikes ${v.dislikes}. `
      + `${cap(skills)}. ${cap(said)}. ${cap(ofyou)}.`
      + (jobName(v) ? ` On the ${jobName(v)} since you showed them — `
        + `${inTen(holdOf(w, v))} to stay with it.` : "");
    return d;
  });
  const done = document.createElement("button");
  done.className = "opt";
  done.textContent = "New village";
  done.onclick = () => {
    if (!confirm("Delete this village and start again?")) return;
    localStorage.removeItem(SAVE);
    location.reload();
  };
  sheet(`Millhollow, day ${w.turn}`, [...rows, done]);
}

// ---------- boot ----------
function boot() {
  el("game").hidden = false;
  rebuild();

  const past = w.events.filter((e) => e.turn < 0).sort((a, b) => b.year - a.year);
  const r = mulberry32(S.seed ^ 0x9e37);
  for (const e of past) {
    const t = renderHist(e);
    if (t && (leader.bg === "scribe" || chance(r, 0.4))) line("past", t);
  }
  const head = document.createElement("div");
  head.className = "me";
  head.innerHTML = `<img alt=""><div><div class="n"></div><div class="d"></div></div>`;
  head.querySelector("img").src = portrait(S.face, S.bracket);
  head.querySelector(".n").textContent = S.name;
  head.querySelector(".d").textContent = BACKGROUNDS[S.bg].name;
  $inner.appendChild(head);
  // facts out of the sim, not mood. See DESIGN.md "precise, not pretty".
  // the founders are already named in the history lines above — don't repeat them
  line("", `Millhollow is ${w.founded} years old. ${w.villagers.length} people live here. `
    + `You got in today.`);

  // what the wall clock is worth, read once, before the first save overwrites it
  awayHours = S.seen ? (Date.now() - S.seen) / 36e5 : 0;
  awayLeft = awayPicks(awayHours);

  appendNew();
  renderAsks();
  renderAway();
  scroll();

  el("out").onclick = goOut;
  el("work").onclick = workWith;
  el("who").onclick = village;
  el("next").onclick = () => step({ kind: "stay" });
}

const saved = localStorage.getItem(SAVE);
if (saved) { S = JSON.parse(saved); boot(); } else startScreen();
