// Millhollow — colour themes. Each one is a surface set (bg, card, line, ink, dim, accent) and an
// eight-hue palette. The palette tints the icons (icons.js names a hue, never a hex), and the
// portraits get a two-tone wash from the theme's own darkest and lightest ink. Loaded in <head>
// so the first paint is already in the chosen colours; the choice lives outside the save.

const THEMES = [
  // dark
  { id: "millhollow", name: "Millhollow", dark: true, bg: "#14110e", card: "#1d1814", line: "#2e2721", ink: "#d9cbb4", dim: "#8a7c68", accent: "#c08a4e",
    red: "#e05a5a", orange: "#e0a458", yellow: "#e8c04e", green: "#7cc46a", teal: "#8fc0c9", blue: "#9fb4d8", purple: "#b9a4d6", pink: "#ef5f7c", gray: "#a39d93", brown: "#b07a48",
    good: "#8fb573", bad: "#c9655a", faces: false },
  { id: "tomorrow-night", name: "Tomorrow Night", dark: true, bg: "#1d1f21", card: "#282a2e", line: "#373b41", ink: "#c5c8c6", dim: "#969896", accent: "#81a2be",
    red: "#cc6666", orange: "#de935f", yellow: "#f0c674", green: "#b5bd68", teal: "#8abeb7", blue: "#81a2be", purple: "#b294bb", pink: "#d77a9a", gray: "#a2a4a3" },
  { id: "dracula", name: "Dracula", dark: true, bg: "#282a36", card: "#313341", line: "#44475a", ink: "#f8f8f2", dim: "#6272a4", accent: "#bd93f9",
    red: "#ff5555", orange: "#ffb86c", yellow: "#f1fa8c", green: "#50fa7b", teal: "#8be9fd", blue: "#8fa2ff", purple: "#bd93f9", pink: "#ff79c6", gray: "#a4a8c0" },
  { id: "mocha", name: "Catppuccin Mocha", dark: true, bg: "#1e1e2e", card: "#26263a", line: "#45475a", ink: "#cdd6f4", dim: "#7f849c", accent: "#cba6f7",
    red: "#f38ba8", orange: "#fab387", yellow: "#f9e2af", green: "#a6e3a1", teal: "#94e2d5", blue: "#89b4fa", purple: "#cba6f7", pink: "#f5c2e7", gray: "#9399b2" },
  { id: "one-dark", name: "One Dark", dark: true, bg: "#282c34", card: "#2f343e", line: "#3e4451", ink: "#abb2bf", dim: "#5c6370", accent: "#61afef",
    red: "#e06c75", orange: "#d19a66", yellow: "#e5c07b", green: "#98c379", teal: "#56b6c2", blue: "#61afef", purple: "#c678dd", pink: "#e0779f", gray: "#8b919c" },
  { id: "ayu-dark", name: "Ayu Dark", dark: true, bg: "#0d1017", card: "#141821", line: "#232834", ink: "#bfbdb6", dim: "#636a76", accent: "#e6b450",
    red: "#f07178", orange: "#ff8f40", yellow: "#e6b450", green: "#aad94c", teal: "#95e6cb", blue: "#59c2ff", purple: "#d2a6ff", pink: "#f29aa8", gray: "#9aa3ad" },
  { id: "gruvbox-dark", name: "Gruvbox Dark", dark: true, bg: "#282828", card: "#32302f", line: "#504945", ink: "#ebdbb2", dim: "#928374", accent: "#fe8019",
    red: "#fb4934", orange: "#fe8019", yellow: "#fabd2f", green: "#b8bb26", teal: "#8ec07c", blue: "#83a598", purple: "#d3869b", pink: "#f28b9b", gray: "#a89984" },
  { id: "solarized-dark", name: "Solarized Dark", dark: true, bg: "#002b36", card: "#073642", line: "#124654", ink: "#93a1a1", dim: "#657b83", accent: "#b58900",
    red: "#dc322f", orange: "#cb4b16", yellow: "#b58900", green: "#859900", teal: "#2aa198", blue: "#268bd2", purple: "#6c71c4", pink: "#d33682", gray: "#839496" },
  // light
  { id: "parchment", name: "Parchment", dark: false, bg: "#f3ead8", card: "#fbf5e8", line: "#d8cbb0", ink: "#3a2e22", dim: "#8a7a62", accent: "#9a5f24",
    red: "#c0392b", orange: "#c46a1a", yellow: "#a87f00", green: "#4f8a3a", teal: "#2f8a88", blue: "#3d6aa8", purple: "#7a52b0", pink: "#c0406a", gray: "#7a7266", brown: "#8a5a2e" },
  { id: "tomorrow", name: "Tomorrow", dark: false, bg: "#ffffff", card: "#f5f5f5", line: "#d6d6d6", ink: "#4d4d4c", dim: "#8e908c", accent: "#4271ae",
    red: "#c82829", orange: "#f5871f", yellow: "#c89c00", green: "#718c00", teal: "#3e999f", blue: "#4271ae", purple: "#8959a8", pink: "#c2457a", gray: "#7d7f7b" },
  { id: "alucard", name: "Alucard", dark: false, bg: "#fffbeb", card: "#f5f0dc", line: "#cfcfde", ink: "#1f1f1f", dim: "#6c664b", accent: "#644ac9",
    red: "#cb3a2a", orange: "#a34d14", yellow: "#846e15", green: "#14710a", teal: "#036a96", blue: "#3a5cc9", purple: "#644ac9", pink: "#a3144d", gray: "#6c664b" },
  { id: "latte", name: "Catppuccin Latte", dark: false, bg: "#eff1f5", card: "#e6e9ef", line: "#ccd0da", ink: "#4c4f69", dim: "#8c8fa1", accent: "#8839ef",
    red: "#d20f39", orange: "#fe640b", yellow: "#df8e1d", green: "#40a02b", teal: "#179299", blue: "#1e66f5", purple: "#8839ef", pink: "#ea76cb", gray: "#7c7f93" },
  { id: "one-light", name: "One Light", dark: false, bg: "#fafafa", card: "#f0f0f1", line: "#dbdbdc", ink: "#383a42", dim: "#a0a1a7", accent: "#4078f2",
    red: "#e45649", orange: "#c18401", yellow: "#b08000", green: "#50a14f", teal: "#0184bc", blue: "#4078f2", purple: "#a626a4", pink: "#ca1243", gray: "#80828a" },
  { id: "ayu-light", name: "Ayu Light", dark: false, bg: "#fcfcfc", card: "#f3f4f5", line: "#e1e4e8", ink: "#5c6166", dim: "#8a9199", accent: "#fa8d3e",
    red: "#e65050", orange: "#fa8d3e", yellow: "#e59a1c", green: "#86b300", teal: "#4cbf99", blue: "#399ee6", purple: "#a37acc", pink: "#e0629a", gray: "#8a9199" },
  { id: "gruvbox-light", name: "Gruvbox Light", dark: false, bg: "#fbf1c7", card: "#f2e5bc", line: "#d5c4a1", ink: "#3c3836", dim: "#7c6f64", accent: "#af3a03",
    red: "#9d0006", orange: "#af3a03", yellow: "#b57614", green: "#79740e", teal: "#427b58", blue: "#076678", purple: "#8f3f71", pink: "#b3325f", gray: "#7c6f64" },
  { id: "solarized-light", name: "Solarized Light", dark: false, bg: "#fdf6e3", card: "#eee8d5", line: "#d9d2bf", ink: "#586e75", dim: "#93a1a1", accent: "#268bd2",
    red: "#dc322f", orange: "#cb4b16", yellow: "#b58900", green: "#859900", teal: "#2aa198", blue: "#268bd2", purple: "#6c71c4", pink: "#d33682", gray: "#839496" },
];

const HUES = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "gray", "brown"];
const THEME_KEY = "millhollow-theme";

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, t) => "#" + hexRgb(a).map((x, i) => Math.round(x + (hexRgb(b)[i] - x) * t)
  .toString(16).padStart(2, "0")).join("");
const luma = (h) => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

let theme = THEMES[0];

function applyTheme(id) {
  theme = THEMES.find((t) => t.id === id) || THEMES[0];
  const t = theme, root = document.documentElement, set = (k, v) => root.style.setProperty(k, v);
  for (const k of ["bg", "card", "line", "ink", "dim", "accent"]) set(`--${k}`, t[k]);
  set("--good", t.good || t.green);
  set("--bad", t.bad || t.red);
  set("--story", t.purple);
  set("--on-accent", luma(t.accent) > 0.5 ? mixHex(t.bg, "#000000", t.dark ? 0.3 : 0.85) : "#ffffff");
  for (const h of HUES) set(`--c-${h}`, t[h] || mixHex(t.orange, t.gray, 0.45));
  root.style.colorScheme = t.dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.content = t.dark ? "dark" : "light";
  try { localStorage.setItem(THEME_KEY, t.id); } catch (e) {}
  tintFaces();
}

// Portraits are sepia engravings; map their light and shade onto this theme's two inks.
function tintFaces() {
  const root = document.documentElement;
  if (theme.faces === false) { root.style.setProperty("--face-filter", "saturate(1)"); return; }
  if (!document.body) return;
  let svg = document.getElementById("face-tint");
  if (!svg) {
    document.body.insertAdjacentHTML("afterbegin", `<svg id="face-tint" width="0" height="0" style="position:absolute" aria-hidden="true">
      <filter id="duo" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values=".3 .59 .11 0 0  .3 .59 .11 0 0  .3 .59 .11 0 0  0 0 0 1 0"/>
        <feComponentTransfer><feFuncR type="table"/><feFuncG type="table"/><feFuncB type="table"/></feComponentTransfer>
      </filter></svg>`);
    svg = document.getElementById("face-tint");
  }
  // Dark themes: shadow sinks into the background, highlights take the ink warmed by the accent.
  // Light themes: printed in ink on the page.
  const t = theme;
  const lo = t.dark ? mixHex(t.bg, "#000000", 0.35) : mixHex(t.ink, "#000000", 0.2);
  const hi = t.dark ? mixHex(t.ink, t.accent, 0.3) : mixHex(t.bg, t.accent, 0.12);
  const mid = mixHex(lo, t.accent, 0.55);
  const [l, m, h] = [lo, mid, hi].map(hexRgb);
  ["R", "G", "B"].forEach((c, i) => svg.querySelector(`feFunc${c}`)
    .setAttribute("tableValues", [l[i], m[i], h[i]].map((x) => (x / 255).toFixed(3)).join(" ")));
  root.style.setProperty("--face-filter", "url(#duo)");
}

let saved = null;
try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
applyTheme(saved || "millhollow");
if (!document.body) document.addEventListener("DOMContentLoaded", tintFaces);
