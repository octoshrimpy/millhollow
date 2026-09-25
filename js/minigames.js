// Three short minigames. Fishing + chopping share a timing-bar mechanic;
// mining is a click-the-vein grid. Canvas only, no assets.

const canvas = document.getElementById("minigame-canvas");
const ctx = canvas.getContext("2d");
let rafId = null;
let audioContext;

function playBeep(hit) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext ||= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const duration = hit ? 0.09 : 0.12;
    oscillator.type = hit ? "sine" : "triangle";
    oscillator.frequency.value = hit ? 720 : 180;
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {}
}

function newFeedback(hit, text, x, y) {
  playBeep(hit);
  return { hit, text, x, y, started: performance.now() };
}

function drawFeedback(feedback, now) {
  const age = now - feedback.started;
  if (age >= 550) return false;
  ctx.save();
  ctx.fillStyle = feedback.hit
    ? getComputedStyle(document.documentElement).getPropertyValue("--mg-zone").trim()
    : "#c85b4b";
  if (age < 180) {
    ctx.globalAlpha = 0.3 * (1 - age / 180);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (feedback.text) {
    ctx.globalAlpha = 1 - age / 550;
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(feedback.text, feedback.x, feedback.y - 30 * age / 550);
  }
  ctx.restore();
  return true;
}

function animateFeedback(hit, text) {
  const feedback = newFeedback(hit, text, canvas.width / 2, canvas.height / 2 + 15);
  cancelAnimationFrame(rafId);
  function frame(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (drawFeedback(feedback, now)) rafId = requestAnimationFrame(frame);
    else rafId = null;
  }
  rafId = requestAnimationFrame(frame);
}

function stopMinigameLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

// ---- shared timing-bar mechanic (fishing, chopping) ----

function startTimingGame(cfg) {
  // cfg: { resource, label, speed, zoneWidth, baseAmount, verb,
  //   comboBonus, pushLuck }
  // comboBonus (fishing/boat): each hit auto-banks and escalates reward as
  // the zone tightens; a miss only resets the streak, nothing earned is lost.
  // pushLuck (chopping): hits pile into an unbanked pool you choose to bank
  // or risk; a miss after pushing loses the whole pool.
  const W = canvas.width, H = canvas.height;
  const trackY = H / 2;
  const firstTrackY = cfg.twoMarker ? trackY - 24 : trackY;
  const secondTrackY = trackY + 24;
  let t = 0;
  let zoneCenter = 60 + Math.random() * (W - 120);
  let secondZoneCenter = 60 + Math.random() * (W - 120);
  const minigameKey = cfg.resource === "wood" ? "chopping" : "fishing";
  const mult = yieldMultiplier(minigameKey);
  const baseZoneWidth = cfg.zoneWidth + easeBonus(minigameKey);
  let step = 0;
  let banked = 0;
  let currentZoneWidth = baseZoneWidth;
  let feedback = null;

  const ui = document.getElementById("minigame-ui");
  ui.innerHTML = `
    <p>${cfg.label}</p>
    <button id="mg-action">${cfg.verb}!</button>
    <div id="mg-choice" style="display:none;">
      <button id="mg-bank"></button>
      <button id="mg-push">Push your luck</button>
    </div>
    <p id="mg-result"></p>
  `;

  const style = getComputedStyle(document.documentElement);
  const trackColor = style.getPropertyValue("--mg-track").trim();
  const zoneColor = style.getPropertyValue("--mg-zone").trim();
  const markerColor = style.getPropertyValue("--mg-marker").trim();
  const secondMarkerColor = style.getPropertyValue("--accent").trim();

  function draw() {
    t += cfg.speed * (1 + step * 0.15);
    const x = W / 2 + Math.sin(t) * (W / 2 - 20);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = trackColor;
    ctx.fillRect(10, firstTrackY - 4, W - 20, 8);
    ctx.fillStyle = zoneColor;
    ctx.fillRect(zoneCenter - currentZoneWidth / 2, firstTrackY - 4, currentZoneWidth, 8);
    ctx.beginPath();
    ctx.arc(x, firstTrackY, 8, 0, Math.PI * 2);
    ctx.fillStyle = markerColor;
    ctx.fill();
    canvas._markerX = x;
    if (cfg.twoMarker) {
      const secondX = W / 2 + Math.sin(t * 1.37 + 1.8) * (W / 2 - 20);
      ctx.fillStyle = trackColor;
      ctx.fillRect(10, secondTrackY - 4, W - 20, 8);
      ctx.fillStyle = zoneColor;
      ctx.fillRect(secondZoneCenter - currentZoneWidth / 2, secondTrackY - 4, currentZoneWidth, 8);
      ctx.beginPath();
      ctx.arc(secondX, secondTrackY, 8, 0, Math.PI * 2);
      ctx.fillStyle = secondMarkerColor;
      ctx.fill();
      canvas._secondMarkerX = secondX;
    }
    if (feedback && !drawFeedback(feedback, performance.now())) feedback = null;
    rafId = requestAnimationFrame(draw);
  }
  draw();

  const actionBtn = document.getElementById("mg-action");
  const choiceBox = document.getElementById("mg-choice");
  const bankBtn = document.getElementById("mg-bank");
  const pushBtn = document.getElementById("mg-push");
  const result = document.getElementById("mg-result");

  function resetRound() {
    zoneCenter = 60 + Math.random() * (W - 120);
    if (cfg.twoMarker) secondZoneCenter = 60 + Math.random() * (W - 120);
    currentZoneWidth = Math.max(10, baseZoneWidth - step * 5);
    actionBtn.disabled = true;
    setTimeout(() => { actionBtn.disabled = false; }, 350);
  }

  function offerChoice() {
    actionBtn.style.display = "none";
    choiceBox.style.display = "block";
    bankBtn.textContent = `Bank ${banked} ${cfg.resource}`;
  }

  function hideChoice() {
    actionBtn.style.display = "";
    choiceBox.style.display = "none";
  }

  bankBtn.onclick = () => {
    addResource(cfg.resource, banked);
    renderResourceBar();
    result.textContent = `Banked ${banked} ${cfg.resource}. Starting fresh.`;
    banked = 0;
    step = 0;
    hideChoice();
    resetRound();
  };

  pushBtn.onclick = () => {
    hideChoice();
    resetRound();
  };

  actionBtn.onclick = () => {
    if (actionBtn.disabled) return;
    const dist = Math.abs(canvas._markerX - zoneCenter);
    const hit = dist < currentZoneWidth / 2 && (!cfg.twoMarker ||
      Math.abs(canvas._secondMarkerX - secondZoneCenter) < currentZoneWidth / 2);

    if (hit) {
      const amount = Math.round(cfg.baseAmount * mult);
      if (cfg.pushLuck) {
        feedback = newFeedback(true, `+${amount}`, canvas._markerX, trackY - 14);
        banked += amount;
        step += 1;
        result.textContent = `Solid hit! ${banked} ${cfg.resource} on the line.`;
        offerChoice();
        return;
      }
      if (cfg.comboBonus) {
        step += 1;
        const comboAmount = amount + Math.floor(step / 2);
        feedback = newFeedback(true, `+${comboAmount}`, canvas._markerX, trackY - 14);
        addResource(cfg.resource, comboAmount);
        renderResourceBar();
        result.textContent = `Streak x${step}! +${comboAmount} ${cfg.resource}.`;
        resetRound();
        return;
      }
      feedback = newFeedback(true, `+${amount}`, canvas._markerX, trackY - 14);
      addResource(cfg.resource, amount);
      renderResourceBar();
      result.textContent = `Got it! +${amount} ${cfg.resource}`;
      resetRound();
      return;
    }

    feedback = newFeedback(false, null, canvas._markerX, trackY);
    if (cfg.pushLuck) {
      result.textContent = banked > 0
        ? `Lost the whole ${banked} ${cfg.resource} pool. Ouch.`
        : "Missed. Try again.";
      banked = 0;
      step = 0;
    } else if (cfg.comboBonus) {
      result.textContent = step > 0
        ? "Missed — streak broken, but every catch so far is still yours."
        : "Missed. Try again.";
      step = 0;
    } else {
      result.textContent = "Missed. Try again.";
    }
    resetRound();
  };
}

function startFishing() {
  startTimingGame({
    resource: "fish", label: "Wait for the bite, then reel.",
    speed: 0.06, zoneWidth: 40, baseAmount: 2, verb: "Reel",
    comboBonus: isApproved("repaint_boat"),
    twoMarker: isApproved("old_millwheel"),
  });
}

function startChopping() {
  startTimingGame({
    resource: "wood", label: "Swing when the axe lines up.",
    speed: 0.09, zoneWidth: 34, baseAmount: 2, verb: "Swing",
    pushLuck: true,
  });
}

// ---- mining: click-the-vein grid ----

function startMining() {
  const mult = yieldMultiplier("mining");
  const GRID = 3;
  const TOTAL_SWINGS = 10;

  function newRock() {
    return {
      hits: 1 + Math.floor(Math.random() * 3),
      cracked: false,
      hasOre: Math.random() < 0.5,
    };
  }

  function neighborOreCount(rocks, i) {
    const row = Math.floor(i / GRID), col = i % GRID;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= GRID || c < 0 || c >= GRID) continue;
        if (rocks[r * GRID + c].hasOre) count += 1;
      }
    }
    return count;
  }

  let rocks = Array.from({ length: GRID * GRID }, newRock);
  let swingsLeft = TOTAL_SWINGS;

  const ui = document.getElementById("minigame-ui");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  function render() {
    ui.innerHTML = `
      <p>Click the rocks to break them open. ${swingsLeft} swings left this vein.</p>
      <div id="mine-grid" style="display:grid;grid-template-columns:repeat(${GRID},1fr);gap:6px;max-width:200px;margin:0 auto;"></div>
      <p id="mg-result"></p>
    `;
    const grid = document.getElementById("mine-grid");
    rocks.forEach((rock, i) => {
      const btn = document.createElement("button");
      if (rock.cracked) {
        btn.textContent = rock.hasOre ? "✨" : `🪶${neighborOreCount(rocks, i)}`;
      } else {
        btn.textContent = "🪨";
      }
      btn.className = "secondary";
      btn.disabled = rock.cracked || swingsLeft <= 0;
      btn.onclick = () => {
        rock.hits -= 1;
        swingsLeft -= 1;
        if (rock.hits <= 0) {
          rock.cracked = true;
          if (rock.hasOre) {
            const amount = Math.round((1 + Math.floor(Math.random() * 2)) * mult);
            addResource("ore", amount);
            document.getElementById("mg-result").textContent = `+${amount} ore`;
            renderResourceBar();
            animateFeedback(true, `+${amount}`);
          } else {
            document.getElementById("mg-result").textContent = "Just rubble.";
            animateFeedback(false, null);
          }
        }
        render();
      };
      grid.appendChild(btn);
    });
    if (rocks.every((r) => r.cracked) || swingsLeft <= 0) {
      const again = document.createElement("button");
      again.textContent = "New vein";
      again.onclick = () => {
        rocks = Array.from({ length: GRID * GRID }, newRock);
        swingsLeft = TOTAL_SWINGS;
        render();
      };
      ui.appendChild(again);
    }
  }
  render();
}
