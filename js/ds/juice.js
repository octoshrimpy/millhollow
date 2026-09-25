// Millhollow — juice. Particles on one full-screen canvas, floating text as DOM,
// shakes and lunges through the Web Animations API. Everything here is
// decoration: if any of it is missing (no canvas, no animate), the game plays the same.

const Juice = (() => {
  const cv = document.getElementById("fx");
  const ctx = cv.getContext && cv.getContext("2d");
  const layer = document.getElementById("floats");
  const toasts = document.getElementById("toasts");
  const calm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let parts = [], shots = [], raf = 0, last = 0, dpr = 1;

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
  }
  size();
  addEventListener("resize", size);

  function center(el, jitter = 0) {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 + (Math.random() - 0.5) * jitter * r.width,
      y: r.top + r.height / 2 + (Math.random() - 0.5) * jitter * r.height,
    };
  }

  // ---------- particles ----------
  function burst(x, y, o = {}) {
    if (!ctx) return;
    const { n = 12, colors = ["#fff"], speed = 180, life = 0.6, size = 3, gravity = 300,
      spark = false, up = 0, spread = Math.PI * 2, angle = 0, drag = 0.9 } = o;
    for (let i = 0; i < (calm ? Math.ceil(n / 3) : n); i++) {
      const a = angle + (Math.random() - 0.5) * spread, v = speed * (0.4 + Math.random() * 0.8);
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, t: 0,
        life: life * (0.6 + Math.random() * 0.6), size: size * (0.6 + Math.random() * 0.8),
        color: colors[Math.floor(Math.random() * colors.length)], gravity, spark, drag,
      });
    }
    loop();
  }

  // Something thrown from a to b: an arrow, an orb, a fireball. onHit fires on arrival.
  function shot(from, to, o = {}) {
    if (!ctx) { if (o.onHit) o.onHit(); return; }
    shots.push({ from, to, t: 0, dur: 0.2, color: "#ffe9a8", size: 3, trail: 0, arc: 0, ...o });
    loop();
  }

  function loop() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = "lighter";

    shots = shots.filter((s) => {
      s.t += dt;
      const k = Math.min(1, s.t / s.dur);
      const x = s.from.x + (s.to.x - s.from.x) * k;
      const y = s.from.y + (s.to.y - s.from.y) * k - Math.sin(k * Math.PI) * s.arc;
      if (s.trail) burst(x, y, { n: s.trail, colors: [s.color], speed: 30, life: 0.3, size: s.size * 0.7, gravity: -40 });
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(x, y, s.size * 2.2, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x, y, s.size, 0, 7); ctx.fill();
      if (k < 1) return true;
      if (s.onHit) s.onHit();
      return false;
    });

    parts = parts.filter((p) => {
      p.t += dt;
      if (p.t >= p.life) return false;
      const f = Math.pow(p.drag, dt * 10);
      p.vx *= f; p.vy = p.vy * f + p.gravity * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = ctx.strokeStyle = p.color;
      if (p.spark) {
        ctx.lineWidth = p.size * 0.7;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
      }
      return true;
    });
    ctx.globalAlpha = 1;

    if (parts.length || shots.length) raf = requestAnimationFrame(frame);
    else { raf = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  // ---------- DOM effects ----------
  // Plain text in, with its emoji drawn from the icon sprite when that's loaded.
  function setText(d, text) {
    if (typeof iconize !== "function") { d.textContent = text; return; }
    d.textContent = text;
    d.innerHTML = iconize(d.innerHTML);
  }

  function float(x, y, text, cls = "") {
    const d = document.createElement("div");
    d.className = "float " + cls;
    setText(d, text);
    d.style.left = `${x + (Math.random() - 0.5) * 16}px`;
    d.style.top = `${y}px`;
    layer.append(d);
    setTimeout(() => d.remove(), 1200);
  }

  const anim = (el, frames, opts) => el && el.animate && !calm ? el.animate(frames, opts) : null;

  function shake(el, px = 5, ms = 260) {
    const f = [];
    for (let i = 0; i < 6; i++) {
      const k = 1 - i / 6;
      f.push({ transform: `translate(${(Math.random() - 0.5) * 2 * px * k}px, ${(Math.random() - 0.5) * 2 * px * k}px)` });
    }
    f.push({ transform: "translate(0,0)" });
    anim(el, f, { duration: ms });
  }

  function lunge(el, dy) {
    anim(el, [{ transform: "none" }, { transform: `translateY(${dy}px) scale(1.06)`, offset: 0.35 }, { transform: "none" }],
      { duration: 240, easing: "ease-out" });
  }

  function pop(el, scale = 1.2) {
    anim(el, [{ transform: "scale(1)" }, { transform: `scale(${scale})`, offset: 0.3 }, { transform: "scale(1)" }],
      { duration: 320, easing: "ease-out" });
  }

  function toast(text, cls = "") {
    const d = document.createElement("div");
    d.className = "toast " + cls;
    setText(d, text);
    toasts.append(d);
    setTimeout(() => d.remove(), 2600);
  }

  // A full-screen curtain that starts opaque and lifts, hiding an instant scene change.
  function veil(title, sub = "") {
    const v = document.createElement("div");
    v.className = "veil";
    v.innerHTML = `<b>${title}</b>${sub ? `<small>${sub}</small>` : ""}`;
    if (typeof iconize === "function") v.innerHTML = iconize(v.innerHTML);
    document.body.append(v);
    setTimeout(() => v.remove(), calm ? 400 : 1300);
  }

  return { center, burst, shot, float, shake, lunge, pop, toast, veil };
})();

const PAL = {
  gold: ["#ffe08a", "#ffc94d", "#fff4c2"],
  blood: ["#ff6b5a", "#c9655a", "#ffb199"],
  steel: ["#fff4d6", "#ffd27a", "#c08a4e"],
  fire: ["#ff8a3d", "#ffcf5a", "#ff5a2a"],
  heal: ["#9fe07a", "#d4ffb8", "#6fcf6f"],
  arcane: ["#b9a4d6", "#e2d4ff", "#8f74c9"],
  dust: ["#8a7c68", "#b3a38a", "#5e5244"],
  shadow: ["#6b5a8a", "#3d3350", "#9a8aa8"],
};
