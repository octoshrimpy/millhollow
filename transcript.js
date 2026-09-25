#!/usr/bin/env node
// Stage 0 — the transcript test. No UI, no DOM.
// Rolls a village, generates history, runs N turns, prints the event log.
// Runs the SAME village twice with different leaders/policies so the two
// transcripts can be diffed. See DESIGN.md "Build order".
//
//   node transcript.js [worldSeed] [turns]
//
// The sim itself lives in js/sim.js, shared with the game.

const fs = require("fs");
const path = require("path");
const {
  chance, BACKGROUNDS, genWorld, opinion, advance, renderHist, renderEvent,
} = require("./js/sim.js");

function run(worldSeed, turns, leader) {
  const w = genWorld(worldSeed);
  w.leaderAt = "old_mill";
  leader = { ...leader, id: -1 };
  w.leader = leader;

  const out = [];
  out.push(`=== ${leader.name}, ${BACKGROUNDS[leader.bg].name} — ${leader.policy} ===`);
  out.push("");
  out.push("-- what is remembered --");
  for (const e of w.events.filter((x) => x.turn < 0).sort((a, b) => b.year - a.year)) {
    const line = renderHist(e);
    if (line && (leader.bg === "scribe" || chance(w.r, 0.4))) out.push("  " + line);
  }
  out.push("");

  const historyCount = w.events.length;
  for (let i = 0; i < turns; i++) {
    const before = w.events.length;
    advance(w, leader);
    const lines = w.events.slice(before).map((e) => renderEvent(e, leader, w)).filter(Boolean);
    if (!lines.length) continue;
    out.push(`-- turn ${w.turn} --`);
    for (const l of lines) out.push("  " + l);
    out.push("");
  }

  // convergence check
  out.push("-- who thinks what of whom (turn " + w.turn + ") --");
  for (const a of w.villagers) {
    const row = w.villagers
      .filter((b) => b.id !== a.id)
      .map((b) => `${b.name} ${opinion(a, b.id, w.turn).toFixed(1)}`)
      .join("  ");
    out.push(`  ${a.name}: ${row}`);
  }
  out.push("");
  out.push("-- skills --");
  for (const v of w.villagers) {
    out.push(`  ${v.full}, ${v.age}. likes ${v.likes}, dislikes ${v.dislikes}. ` +
      (Object.entries(v.skills).map(([k, n]) => `${k} ${n}`).join(", ") || "no skill worth naming"));
  }

  return { text: out.join("\n"), events: w.events.length - historyCount, world: w };
}

const worldSeed = Number(process.argv[2] || 12345);
const turns = Number(process.argv[3] || 100);

const A = run(worldSeed, turns, { name: "Adrel", bg: "surveyor", policy: "ranger" });
const B = run(worldSeed, turns, { name: "Nessa", bg: "cook", policy: "worker" });

const dir = process.env.OUT_DIR || ".";
fs.writeFileSync(path.join(dir, "transcript-a.txt"), A.text);
fs.writeFileSync(path.join(dir, "transcript-b.txt"), B.text);

const la = A.text.split("\n"), lb = B.text.split("\n");
const same = la.filter((l, i) => l === lb[i]).length;

console.log(A.text.split("\n").slice(0, 60).join("\n"));
console.log("\n... (full text in transcript-a.txt / transcript-b.txt)\n");
console.log(`world seed ${worldSeed}, ${turns} turns`);
console.log(`A: ${A.events} events, ${la.length} lines`);
console.log(`B: ${B.events} events, ${lb.length} lines`);
console.log(`identical lines at same index: ${same} (${((same / Math.max(la.length, lb.length)) * 100).toFixed(1)}%)`);
