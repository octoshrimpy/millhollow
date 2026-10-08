
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

  // A ring that slows to a stop on the square of radius r (drag sets where it settles).
  function wave(x, y, r, o = {}) {
    if (!ctx) return;
    const { n = 96, colors = ["#fff"], life = 1.6, size = 2.5, drag = 0.85 } = o, k = -Math.log(drag) * 10;
    for (let i = 0; i < (calm ? n / 3 : n); i++) {
      const a = (i / n) * Math.PI * 2, d = r / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))) * (0.95 + Math.random() * 0.1);
      parts.push({ x, y, vx: Math.cos(a) * d * k, vy: Math.sin(a) * d * k, t: 0, life, size, color: colors[i % colors.length], gravity: 0, spark: false, drag });
    }
    loop();
  }

  // Something won, bobbing mid-screen until tapped; then it flies to the top bar.
  function prize(icon, to, done) {
    const d = document.createElement("div");
    d.className = "prize";
    d.innerHTML = iconize(`<b>${icon}</b>`);
    document.body.append(d);
    const b = d.querySelector("b");
    d.addEventListener("click", () => {
      const from = b.getBoundingClientRect(), at = to.getBoundingClientRect();
      d.classList.add("gone");
      const fly = anim(b, [{ transform: "none" }, { transform: `translate(${at.left + at.width / 2 - from.left - from.width / 2}px, ${at.top + at.height / 2 - from.top - from.height / 2}px) scale(.25)`, opacity: 0.6 }],
        { duration: 600, easing: "ease-in", fill: "forwards" });
      const end = () => { d.remove(); if (done) done(); };
      if (fly) fly.onfinish = end; else end();
    }, { once: true });
  }

  // icon flies from one element to another, then calls done.
  function carry(icon, from, to, done) {
    const d = document.createElement("div"), a = center(from), z = center(to);
    d.className = "carry";
    d.innerHTML = iconize(icon);
    d.style.left = `${a.x}px`; d.style.top = `${a.y}px`;
    document.body.append(d);
    const fly = anim(d, [{ transform: "translate(-50%, -50%) scale(.6)" }, { transform: `translate(calc(${z.x - a.x}px - 50%), calc(${z.y - a.y}px - 50%)) scale(1.4)`, offset: 0.6 },
      { transform: `translate(calc(${z.x - a.x}px - 50%), calc(${z.y - a.y}px - 50%)) scale(.2)`, opacity: 0 }], { duration: 1300, easing: "ease-in-out", fill: "forwards" });
    const end = () => { d.remove(); if (done) done(); };
    if (fly) fly.onfinish = end; else end();
  }

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

  function setText(d, text) {
    d.textContent = text;
    d.innerHTML = iconize(d.innerHTML);
  }

  function float(x, y, text, cls = "", ms = 1200) {
    const d = document.createElement("div");
    d.className = "float " + cls;
    setText(d, text);
    d.style.left = `${x + (Math.random() - 0.5) * 16}px`;
    d.style.top = `${y}px`;
    if (ms !== 1200) d.style.animationDuration = `${ms}ms`;
    layer.append(d);
    setTimeout(() => d.remove(), ms);
    return d;
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

  function veil(title, sub = "") {
    const v = document.createElement("div");
    v.className = "veil";
    v.innerHTML = iconize(`<b>${title}</b>${sub ? `<small>${sub}</small>` : ""}`);
    document.body.append(v);
    setTimeout(() => v.remove(), calm ? 400 : 1300);
  }

  function solitaire(text, x, y) {
    if (calm || !ctx) return false;
    const c = document.createElement("canvas"), g = c.getContext("2d");
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:24;transition:opacity 1s";
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    g.scale(dpr, dpr);
    g.font = "bold 40px Georgia, serif";
    g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 3;
    const w = g.measureText(text).width, h = 40, cards = [];
    let thrown = 0, prev = performance.now();
    const throwOne = () => {
      const dir = thrown++ % 2 ? -1 : 1;
      cards.push({ x, y, vx: dir * (120 + Math.random() * 160), vy: -150 - Math.random() * 250 });
      if (thrown < 6) setTimeout(throwOne, 700);
    };
    throwOne();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      for (const k of cards) {
        k.vy += 900 * dt; k.x += k.vx * dt; k.y += k.vy * dt;
        if (k.y > innerHeight - h / 2) { k.y = innerHeight - h / 2; k.vy *= -0.82; }
        k.out = k.x < -w || k.x > innerWidth + w;
        if (k.out) continue;
        g.strokeStyle = "#3a2a10"; g.fillStyle = "#ffe08a";
        g.strokeText(text, k.x, k.y); g.fillText(text, k.x, k.y);
      }
      if (thrown < 6 || cards.some((k) => !k.out)) return requestAnimationFrame(tick);
      setTimeout(() => { c.style.opacity = 0; setTimeout(() => c.remove(), 1000); }, 1500);
    };
    document.body.append(c);
    requestAnimationFrame(tick);
    return true;
  }

  return { center, burst, wave, prize, carry, shot, float, solitaire, shake, lunge, pop, toast, veil };
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
