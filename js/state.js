// Game state + persistence. localStorage only, no backend.

const SAVE_KEY = "millhollow-save-v1";

// Dev flag: skip build/net wait times for fast testing. Flip false for real timing.
const DEV_MODE = false;
const BUILD_TIME_MS = DEV_MODE ? 0 : 20000;
const NET_RATE_MS = DEV_MODE ? 2000 : 20000;
const NET_CAP = 5;

const DEFAULT_STATE = {
  resources: { wood: 0, fish: 0, ore: 0 },
  approved: [], // project ids
  declined: [], // project ids
  building: [], // { id, finishAt }
  unlockedMinigames: ["fishing"],
  netCast: { active: false, since: 0, banked: 0 },
  foreclosed: [], // project ids ruled out permanently by an excludes conflict
  townNotes: [], // { id, text } revealed aftermath scenes, newest first
  pendingNotes: [], // { id, text } queued scenes, revealed by visiting their project's tile
  completedFavors: [], // villager ids whose one-off favor has been done
  epilogueShown: false, // whether the one-time "village complete" note has fired
};

let state = loadState();
checkBuilding();

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function addResource(kind, amount) {
  state.resources[kind] = (state.resources[kind] || 0) + amount;
  saveState();
}

function canAfford(cost) {
  return Object.entries(cost).every(([k, v]) => (state.resources[k] || 0) >= v);
}

function spend(cost) {
  Object.entries(cost).forEach(([k, v]) => (state.resources[k] -= v));
}

function isApproved(id) {
  return state.approved.includes(id);
}

function isDeclined(id) {
  return state.declined.includes(id);
}

function prereqsMet(project) {
  return project.prereq.every((id) => isApproved(id));
}

function isBuilding(id) {
  return state.building.some((b) => b.id === id);
}

function isAvailable(project) {
  return !isApproved(project.id) && !isDeclined(project.id) && !isBuilding(project.id) && prereqsMet(project);
}

function availableProjects() {
  return PROJECTS.filter(isAvailable);
}

function threadProgress() {
  const threads = PROJECTS.filter((p) => !p.charter);
  const excluded = new Set(PROJECTS.filter((p) =>
    (isDeclined(p.id) && state.foreclosed.includes(p.id)) ||
    (p.excludes || []).some((id) => isApproved(id))
  ).map((p) => p.id));

  let changed = true;
  while (changed) {
    changed = false;
    PROJECTS.forEach((p) => {
      if (!excluded.has(p.id) && p.prereq.some((id) => excluded.has(id))) {
        excluded.add(p.id);
        changed = true;
      }
    });
  }

  return {
    resolved: threads.filter((p) => isApproved(p.id) || excluded.has(p.id)).length,
    total: threads.length,
  };
}

function approveProject(id) {
  const project = PROJECTS.find((p) => p.id === id);
  if (!project || !isAvailable(project) || !canAfford(project.cost)) return false;
  spend(project.cost);
  const buildTime = project.instant ? 0 : BUILD_TIME_MS;
  state.building.push({ id, finishAt: Date.now() + buildTime });
  // Committing to this project permanently rules out anything it excludes,
  // if that hasn't already been decided one way or the other.
  (project.excludes || []).forEach((exId) => {
    if (!isApproved(exId) && !isBuilding(exId) && !isDeclined(exId)) {
      state.declined.push(exId);
      state.foreclosed.push(exId);
    }
  });
  saveState();
  checkBuilding();
  return true;
}

// Moves any builds whose timer has elapsed into approved. Called on load
// (catches up builds finished while away) and each render tick.
function checkBuilding() {
  const now = Date.now();
  const done = state.building.filter((b) => b.finishAt <= now);
  if (done.length === 0) return false;
  state.building = state.building.filter((b) => b.finishAt > now);
  done.forEach(({ id }) => {
    const project = PROJECTS.find((p) => p.id === id);
    state.approved.push(id);
    if (project.unlockMinigame && !state.unlockedMinigames.includes(project.unlockMinigame)) {
      state.unlockedMinigames.push(project.unlockMinigame);
    }
    if (project.grant) {
      Object.entries(project.grant).forEach(([k, v]) => addResource(k, v));
    }
    // First aftermath line lands right away; any rest wait until the player
    // visits that project's own tile (see revealNoteForProject) instead of
    // handing them over just for reopening the app.
    (project.aftermath || []).forEach((text, i) => {
      const note = { id: `${id}_${i}`, text };
      if (i === 0) state.townNotes.unshift(note);
      else state.pendingNotes.push(note);
    });
  });
  saveState();
  return true;
}

// Reveals a project's queued aftermath scene when the player clicks that
// project's town tile. Returns the revealed text, or null if nothing was
// queued for it.
function revealNoteForProject(id) {
  const i = state.pendingNotes.findIndex((n) => n.id.startsWith(`${id}_`));
  if (i === -1) return null;
  const [note] = state.pendingNotes.splice(i, 1);
  state.townNotes.unshift(note);
  saveState();
  return note.text;
}

const EPILOGUE_TEXT = "Millhollow doesn't look like the town it was. Every thread that could resolve itself has — not because anyone finished, exactly, but because people stopped waiting and just started living in it. Whatever you didn't build stays undone, and that's fine too. Come back whenever. Nobody here is going anywhere.";

// Fires once, the moment nothing is available to decide and nothing is
// mid-build — every open thread actually resolved, not a project-count timer.
function checkEpilogue() {
  if (state.epilogueShown) return;
  if (availableProjects().length === 0 && state.building.length === 0) {
    state.epilogueShown = true;
    state.townNotes.unshift({ id: "epilogue", text: EPILOGUE_TEXT });
    saveState();
  }
}

function declineProject(id) {
  if (isApproved(id) || isDeclined(id)) return false;
  state.declined.push(id);
  const project = PROJECTS.find((p) => p.id === id);
  if (project && project.declineAftermath) {
    state.townNotes.unshift({ id: `${id}_decline`, text: project.declineAftermath });
  }
  saveState();
  return true;
}

function undeclineProject(id) {
  if (state.foreclosed.includes(id)) return false;
  const i = state.declined.indexOf(id);
  if (i === -1) return false;
  state.declined.splice(i, 1);
  saveState();
  return true;
}

function yieldMultiplier(minigame) {
  let mult = 1;
  for (const p of PROJECTS) {
    if (p.yieldBonus && p.yieldBonus.minigame === minigame && isApproved(p.id)) {
      mult *= p.yieldBonus.mult;
    }
  }
  return mult;
}

function easeBonus(minigame) {
  let bonus = 0;
  for (const p of PROJECTS) {
    if (p.easeBonus && p.easeBonus.minigame === minigame && isApproved(p.id)) {
      bonus += p.easeBonus.addZone;
    }
  }
  return bonus;
}

// Passive net-casting (unlocked by better_nets): one finite expedition per
// cast. Fish trickle in over real time up to NET_CAP; collecting ends the
// expedition (active goes false), so keeping it going requires a fresh,
// deliberate Cast Net tap rather than silently refilling forever.
function startNetCast() {
  state.netCast.active = true;
  state.netCast.since = Date.now();
  saveState();
}

function stopNetCast() {
  updateNetCast();
  state.netCast.active = false;
  saveState();
}

function updateNetCast() {
  if (!state.netCast.active || state.netCast.banked >= NET_CAP) return;
  const now = Date.now();
  const earned = Math.floor((now - state.netCast.since) / NET_RATE_MS);
  if (earned > 0) {
    state.netCast.banked = Math.min(NET_CAP, state.netCast.banked + earned);
    state.netCast.since += earned * NET_RATE_MS;
    saveState();
  }
}

function collectNet() {
  updateNetCast();
  const amount = state.netCast.banked;
  state.netCast.banked = 0;
  state.netCast.active = false;
  saveState();
  if (amount > 0) addResource("fish", amount);
  return amount;
}

// One-off villager favors (see VILLAGERS[].favor): unlocked once their
// linked project is approved, paid for with a small resource hand-in, done
// at most once per villager. Reward is story (a town note), never a
// production bonus.
function canDoFavor(v) {
  return !!v.favor && !state.completedFavors.includes(v.id) && isApproved(v.favor.after);
}

function completeFavor(villagerId) {
  const v = VILLAGERS.find((x) => x.id === villagerId);
  if (!v || !canDoFavor(v) || !canAfford(v.favor.cost)) return false;
  spend(v.favor.cost);
  state.completedFavors.push(villagerId);
  state.townNotes.unshift({ id: `favor_${villagerId}`, text: v.favor.scene });
  saveState();
  return true;
}
