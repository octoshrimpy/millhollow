// Millhollow — icons. The game's text keeps its emoji (tables, log lines, saves); iconize()
// swaps each one for a tinted SVG from the sprite at render time, so no string anywhere has
// to know about markup. Ids prefixed lu- are Lucide, ra- are RPG Awesome, mh- are drawn in the build script; tools/build_icons.py
// reads this table and writes only the icons it names into js/ds/sprite.js.

const ICONS = {
  // resources
  "🍞": ["lu-croissant", "orange"],
  "🪵": ["mh-log", "brown"],
  "🪨": ["lu-stone", "gray"],
  "⛏": ["lu-pickaxe", "blue"],
  "🌿": ["lu-leaf", "green"],
  "🏺": ["lu-amphora", "orange"],
  "📜": ["lu-scroll-text", "yellow"],
  "🧪": ["lu-flask-round", "pink"],
  "🥪": ["lu-sandwich", "orange"],
  "🥈": ["ra-gold-bar", "teal"],
  "💎": ["ra-crystal-cluster", "purple"],
  "🔧": ["lu-wrench", "gray"],
  "⏫": ["lu-circle-arrow-up", "currentColor"],
  "♻": ["lu-recycle", "green"],
  // classes
  "🛡": ["lu-shield", "blue"],
  "🏹": ["lu-bow-arrow", "green"],
  "🔥": ["lu-flame", "orange"],
  "✚": ["lu-cross", "yellow"],
  // buildings
  "🛖": ["lu-tent", "brown"],
  "🏠": ["lu-house", "brown"],
  "🌾": ["lu-wheat", "yellow"],
  "🪓": ["lu-axe", "brown"],
  "⛰": ["lu-mountain", "gray"],
  "⚒": ["ra-anvil", "gray"],
  "🩹": ["lu-bandage", "pink"],
  "📚": ["lu-library-big", "purple"],
  "🌲": ["lu-tree-pine", "green"],
  "🏰": ["lu-castle", "brown"],
  "🏛": ["lu-landmark", "yellow"],
  "🍖": ["lu-ham", "red"],
  // stats and state
  "⚔": ["lu-sword", "ink"],
  "💨": ["lu-wind", "teal"],
  "❤": ["lu-heart", "red"],
  "🛏": ["lu-bed", "blue"],
  "🔒": ["lu-lock", "gray"],
  "✓": ["lu-check", "currentColor"],
  "✕": ["lu-x", "currentColor"],
  "❯": ["lu-chevron-right", "currentColor"],
  "▸": ["lu-chevron-right", "currentColor"],
  "▶": ["lu-play", "currentColor"],
  "⏸": ["lu-pause", "currentColor"],
  // navigation
  "🏘": ["lu-tent-tree", "brown"],
  "👥": ["lu-users", "ink"],
  "🧭": ["lu-compass", "teal"],
  "⚙": ["lu-settings", "currentColor"],
  "📖": ["lu-book-open-text", "ink"],
  "🎯": ["lu-locate-fixed", "currentColor"],
  "📋": ["lu-clipboard-copy", "currentColor"],
  "💾": ["lu-download", "currentColor"],
  "📂": ["lu-folder-open", "currentColor"],
  "📥": ["lu-log-in", "currentColor"],
  // thoughts and morale
  "🍽": ["lu-utensils-crossed", "orange"],
  "🪦": ["ra-tombstone", "gray"],
  "💔": ["lu-heart-crack", "red"],
  "🏆": ["lu-trophy", "yellow"],
  "⭐": ["lu-star", "yellow"],
  "🔨": ["lu-hammer", "brown"],
  "👣": ["lu-footprints", "gray"],
  "😄": ["lu-laugh", "green"],
  "🙂": ["lu-smile", "teal"],
  "😐": ["lu-meh", "gray"],
  "😠": ["lu-angry", "red"],
  // enemies
  "🐀": ["lu-rat", "brown"],
  "🟢": ["ra-gloop", "green"],
  "💀": ["ra-skull", "ink"],
  "🦇": ["ra-batwings", "purple"],
  "🕯": ["ra-hood", "purple"],
  "🧟": ["ra-monster-skull", "green"],
  "🌱": ["ra-thorny-vine", "green"],
  "☠": ["ra-death-skull", "ink"],
  "🌳": ["ra-dead-tree", "brown"],
  "👁": ["ra-eye-monster", "red"],
  // dungeon map
  "🚪": ["lu-door-open", "brown"],
  "💰": ["lu-coins", "yellow"],
  "⛲": ["ra-ankh", "teal"],
  "❔": ["lu-circle-question-mark", "purple"],
  "🪜": ["ra-hole-ladder", "gray"],
  "🔦": ["ra-torch", "orange"],
};

// Each icon names a hue; the theme decides what that hue looks like. "ink" and "currentColor"
// follow the text.
const ic = (e) => {
  const [id, hue] = ICONS[e];
  const color = hue === "currentColor" ? hue : hue === "ink" ? "var(--ink)" : `var(--c-${hue})`;
  return `<svg class="i" style="color:${color}" aria-hidden="true"><use href="#${id}"/></svg>`;
};

// Any emoji, with or without its trailing variation selector. Longest first so nothing
// shorter eats the start of a longer one.
const ICON_RE = new RegExp(`(${Object.keys(ICONS).sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\uFE0F?`, "gu");

// Only text between tags is touched; attributes (alt, title) keep their emoji.
const iconize = (html) => String(html).split(/(<[^>]*>)/).map((part) =>
  part[0] === "<" ? part : part.replace(ICON_RE, (_, e) => ic(e))).join("");

if (typeof SPRITE === "string") document.body.insertAdjacentHTML("afterbegin", SPRITE);
