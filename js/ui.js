// DOM rendering: resource bar, town grid, proposals, villagers, toast.

function renderResourceBar() {
  const bar = document.getElementById("resource-bar");
  const r = state.resources;
  const progress = threadProgress();
  bar.innerHTML = `
    <span>🪵 ${r.wood}</span>
    <span>🐟 ${r.fish}</span>
    <span>⛏️ ${r.ore}</span>
    <span>${progress.resolved} of ${progress.total} threads settled</span>
  `;
}

function renderTown() {
  const grid = document.getElementById("town-grid");
  const themes = { mira: "river", tomas: "forest", pike: "mountain" };
  const projects = ["river", "forest", "mountain", "village"].flatMap((theme) =>
    PROJECTS.filter((p) => (themes[p.proposer] || "village") === theme)
  );
  grid.innerHTML = "";
  projects.forEach((p) => {
    const built = isApproved(p.id);
    const hasPendingNote = built && state.pendingNotes.some((n) => n.id.startsWith(`${p.id}_`));
    const div = document.createElement("div");
    div.className = `tile theme-${themes[p.proposer] || "village"}${built ? " built" : ""}`;
    div.innerHTML = `<div>${built ? p.built : p.locked}${hasPendingNote ? '<span class="tile-note-dot">●</span>' : ""}</div><div class="tile-label">${built ? p.name : "?"}</div>`;
    div.title = built ? p.name : "Not yet built";
    if (built) {
      div.onclick = () => {
        const revealed = revealNoteForProject(p.id);
        showToast(revealed || p.desc);
        if (revealed) renderTownNotes();
      };
    }
    grid.appendChild(div);
  });
}

function renderMinigameLaunchers() {
  const box = document.getElementById("minigame-launchers");
  box.innerHTML = "";
  const launchers = [
    { key: "chopping", label: "🪓 Chop Wood", fn: startChopping },
    { key: "fishing", label: "🎣 Go Fishing", fn: startFishing },
    { key: "mining", label: "⛏️ Mine Ore", fn: startMining },
  ];
  launchers.forEach(({ key, label, fn }) => {
    if (!state.unlockedMinigames.includes(key)) return;
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => openMinigame(fn);
    box.appendChild(btn);
  });
}

function openMinigame(startFn) {
  document.getElementById("minigame-overlay").classList.remove("hidden");
  startFn();
}

function closeMinigame() {
  stopMinigameLoop();
  document.getElementById("minigame-overlay").classList.add("hidden");
  renderAll();
}

function renderNetStatus() {
  const list = document.getElementById("net-status");
  list.innerHTML = "";
  if (!isApproved("better_nets")) return;
  updateNetCast();
  const box = document.createElement("div");
  box.className = "card";
  const active = state.netCast.active;
  box.innerHTML = `
    <h3>🥅 Mira's Nets</h3>
    <p>${active
      ? `Net's out. Banked: ${state.netCast.banked}/${NET_CAP} fish. Come back later to pull it in.`
      : "Net's in. Cast it, then check back in a while to see what it caught."}</p>
    <div class="actions">
      ${active
        ? `<button class="secondary" data-net="stop">Pull In Early</button>`
        : `<button data-net="start">Cast Net</button>`}
      <button data-net="collect" ${state.netCast.banked > 0 ? "" : "disabled"}>Collect (${state.netCast.banked})</button>
    </div>
  `;
  list.appendChild(box);
  box.querySelector('[data-net="start"]')?.addEventListener("click", () => { startNetCast(); renderAll(); });
  box.querySelector('[data-net="stop"]')?.addEventListener("click", () => { stopNetCast(); renderAll(); });
  box.querySelector('[data-net="collect"]')?.addEventListener("click", () => {
    const n = collectNet();
    if (n) showToast(`Collected ${n} fish.`);
    renderAll();
  });
}

function renderBuilding() {
  const list = document.getElementById("proposals-list");
  state.building.forEach(({ id, finishAt }) => {
    const p = PROJECTS.find((x) => x.id === id);
    const proposer = VILLAGERS.find((v) => v.id === p.proposer);
    const remaining = Math.max(0, Math.ceil((finishAt - Date.now()) / 1000));
    const card = document.createElement("div");
    card.className = "card in-progress";
    card.innerHTML = `
      <h3>${proposer.portrait} ${p.name}</h3>
      <div class="meta">${proposer.name} is working on it — ${remaining}s left</div>
    `;
    list.appendChild(card);
  });
}

function renderProposals() {
  checkBuilding();
  checkEpilogue();
  const list = document.getElementById("proposals-list");
  const avail = availableProjects().filter((p) => !p.charter);
  list.innerHTML = "";
  if (avail.length === 0 && state.building.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No one has a proposal right now. Go gather something.";
    list.appendChild(empty);
  }
  avail.forEach((p) => {
    const proposer = VILLAGERS.find((v) => v.id === p.proposer);
    const affordable = canAfford(p.cost);
    const costStr = Object.entries(p.cost)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ") || "Nothing — just a decision.";
    const rulesOut = (p.excludes || [])
      .filter((exId) => !isApproved(exId) && !isBuilding(exId) && !isDeclined(exId))
      .map((exId) => PROJECTS.find((x) => x.id === exId).name)
      .join(", ");
    const short = Object.entries(p.cost)
      .filter(([k, v]) => (state.resources[k] || 0) < v)
      .map(([k, v]) => `${v - (state.resources[k] || 0)} more ${k}`)
      .join(", ");
    const shortLine = short ? `<div class="meta">Still need: ${short}</div>` : "";
    const card = document.createElement("div");

    if (p.newcomer) {
      const subject = VILLAGERS.find((v) => v.id === p.subject);
      card.className = "card newcomer";
      card.innerHTML = `
        <h3>${subject.portrait} ${p.name}</h3>
        <div class="meta">A newcomer, vouched for by ${proposer.name}</div>
        <p>${p.desc}</p>
        <div class="cost">Costs: ${costStr}</div>
        ${shortLine}
        ${rulesOut ? `<div class="meta rules-out">Rules out: ${rulesOut}</div>` : ""}
        ${p.grant ? `<div class="cost">Brings: ${Object.entries(p.grant).map(([k, v]) => `${v} ${k}`).join(", ")}</div>` : ""}
        <div class="actions">
          <button ${affordable ? "" : "disabled"} data-approve="${p.id}">Welcome them in</button>
          <button class="secondary" data-decline="${p.id}">Turn them away</button>
        </div>
      `;
    } else {
      const timeStr = p.instant || BUILD_TIME_MS === 0
        ? "Happens right away."
        : `Takes about ${Math.round(BUILD_TIME_MS / 1000)}s once approved.`;
      card.className = "card";
      card.innerHTML = `
        <h3>${proposer.portrait} ${p.name}</h3>
        <div class="meta">Proposed by ${proposer.name}</div>
        <p>${p.desc}</p>
        <div class="cost">Costs: ${costStr}</div>
        ${shortLine}
        ${rulesOut ? `<div class="meta rules-out">Rules out: ${rulesOut}</div>` : ""}
        <div class="meta">${timeStr}</div>
        <div class="actions">
          <button ${affordable ? "" : "disabled"} data-approve="${p.id}">Approve</button>
          <button class="secondary" data-decline="${p.id}">Decline</button>
        </div>
      `;
    }
    list.appendChild(card);
  });

  list.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.approve;
      const project = PROJECTS.find((x) => x.id === id);
      const rivalId = (project.excludes || []).find(
        (exId) => !isApproved(exId) && !isBuilding(exId) && !isDeclined(exId)
      );
      if (rivalId) {
        const rival = PROJECTS.find((x) => x.id === rivalId);
        const ok = confirm(`Approving "${project.name}" permanently rules out "${rival.name}". Continue?`);
        if (!ok) return;
      }
      if (approveProject(id)) {
        showToast(BUILD_TIME_MS > 0 ? "Approved. Work begins." : "Approved. Millhollow changes a little.");
        renderAll();
      }
    };
  });
  list.querySelectorAll("[data-decline]").forEach((btn) => {
    btn.onclick = () => {
      declineProject(btn.dataset.decline);
      showToast("Declined. That thread ends here.");
      renderAll();
    };
  });

  renderBuilding();
  renderDeclined();
}

function renderDeclined() {
  const list = document.getElementById("proposals-list");
  if (state.declined.length === 0) return;
  const box = document.createElement("details");
  box.innerHTML = `<summary>Declined (${state.declined.length})</summary>`;
  state.declined.forEach((id) => {
    const p = PROJECTS.find((x) => x.id === id);
    const foreclosed = state.foreclosed.includes(id);
    const row = document.createElement("div");
    row.className = "card";
    row.innerHTML = foreclosed
      ? `<span>${p.name}</span> <span class="meta">Ruled out — a conflicting project was already built.</span>`
      : `<span>${p.name}</span> <button class="secondary" data-undecline="${id}">Reconsider</button>`;
    box.appendChild(row);
  });
  list.appendChild(box);
  list.querySelectorAll("[data-undecline]").forEach((btn) => {
    btn.onclick = () => {
      undeclineProject(btn.dataset.undecline);
      showToast("Back on the table.");
      renderAll();
    };
  });
}

function hasSurfaced(villagerId) {
  return PROJECTS.some(
    (p) => (p.proposer === villagerId || p.subject === villagerId) && (isAvailable(p) || isApproved(p.id))
  );
}

function villagerBlurb(v) {
  let blurb = v.blurb;
  (v.updates || []).forEach((u) => {
    if (isApproved(u.after)) blurb = u.blurb;
  });
  if (v.deniedBlurb && v.newcomerProjectId && isDeclined(v.newcomerProjectId)) {
    blurb = v.deniedBlurb;
  }
  if (v.favor && state.completedFavors.includes(v.id) && v.favor.blurbAfter) {
    blurb = v.favor.blurbAfter;
  }
  return blurb;
}

function renderVillagers() {
  const list = document.getElementById("villagers-list");
  list.innerHTML = "";
  VILLAGERS.filter((v) => hasSurfaced(v.id)).forEach((v) => {
    const pending = PROJECTS.find((p) => p.proposer === v.id && isAvailable(p));
    const showRelates = !v.relatesTo || hasSurfaced(v.relatesTo);
    const favorReady = canDoFavor(v);
    const div = document.createElement("div");
    div.className = "villager";
    div.innerHTML = `
      <div class="portrait">${v.portrait}</div>
      <div>
        <div class="name">${v.name}</div>
        <div class="role">${v.role}</div>
        <div class="want">${villagerBlurb(v)}</div>
        ${showRelates ? `<div class="want"><em>${v.relates}</em></div>` : ""}
        ${pending ? `<div class="want">💬 Wants: <strong>${pending.name}</strong></div>` : ""}
        ${favorReady ? `
          <div class="favor">
            ${v.favor.task}
            <div><button data-favor="${v.id}">Help out</button></div>
          </div>
        ` : ""}
      </div>
    `;
    list.appendChild(div);
  });
  list.querySelectorAll("[data-favor]").forEach((btn) => {
    btn.onclick = () => {
      if (completeFavor(btn.dataset.favor)) {
        showToast("Done. They'll remember it.");
        renderAll();
      }
    };
  });
}

function renderTownNotes() {
  const list = document.getElementById("town-notes-list");
  list.innerHTML = "";
  state.townNotes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note";
    div.textContent = note.text;
    list.appendChild(div);
  });
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderCharterOverlay() {
  const overlay = document.getElementById("charter-overlay");
  const charters = PROJECTS.filter((p) => p.charter);
  const decided = charters.some((p) => isApproved(p.id));
  overlay.classList.toggle("hidden", decided);
  if (decided) return;

  const list = document.getElementById("charter-list");
  list.innerHTML = "";
  charters.forEach((p) => {
    const proposer = VILLAGERS.find((v) => v.id === p.proposer);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${proposer.portrait} ${p.name}</h3>
      <p>${p.desc}</p>
      <button data-charter="${p.id}">Charter this course</button>
    `;
    list.appendChild(card);
  });
  list.querySelectorAll("[data-charter]").forEach((btn) => {
    btn.onclick = () => {
      approveProject(btn.dataset.charter);
      showToast("The town's course is set.");
      renderAll();
    };
  });
}

function renderAll() {
  renderResourceBar();
  renderTown();
  renderMinigameLaunchers();
  renderNetStatus();
  renderProposals();
  renderVillagers();
  renderTownNotes();
  renderCharterOverlay();
}
