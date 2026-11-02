
const NAME_CORPUS = {
  f: [...NAMES.f, ...NAMES.more.f],
  m: [...NAMES.m, ...NAMES.more.m],
};

const chainOf = (names) => {
  const t = {};
  for (const n of names) {
    const w = "^^" + n.toLowerCase() + "$";
    for (let i = 0; i + 2 < w.length; i++) (t[w.slice(i, i + 2)] ||= []).push(w[i + 2]);
  }
  return t;
};
const CHAINS = { f: chainOf(NAME_CORPUS.f), m: chainOf(NAME_CORPUS.m) };
const REAL = new Set([...NAME_CORPUS.f, ...NAME_CORPUS.m].map((n) => n.toLowerCase()));
const AWKWARD = /[^aeiouy]{3}|[aeiou]{3}|(.)\1\1|x|[jqz][^aeiou]|w[^aeiouyrh]|[^aeiouy](wr|kn|gn)/;

function makeName(sex, taken = new Set(), rng = Math.random) {
  const chain = CHAINS[sex === "any" ? (rng() < 0.5 ? "f" : "m") : sex];
  for (let tries = 0; tries < 300; tries++) {
    let ctx = "^^", out = "";
    while (out.length < 10) {
      const next = chain[ctx.slice(-2)];
      const ch = next[Math.floor(rng() * next.length)];
      if (ch === "$") break;
      out += ch;
      ctx += ch;
    }
    if (out.length < 4 || out.length > 7 || REAL.has(out) || WORDS.has(out) || AWKWARD.test(out)) continue;
    const name = out[0].toUpperCase() + out.slice(1);
    if (!taken.has(name)) return name;
  }
  return pick(namesFor(sex).filter((n) => !taken.has(n)).concat(NAMES.any));
}

function makePlace(rng = Math.random) {
  const pickR = (xs) => xs[Math.floor(rng() * xs.length)], cap = (w) => w[0].toUpperCase() + w.slice(1);
  if (rng() < 0.2) return `${cap(pickR(PLACE_WORD))} ${pickR(PLACE_APART)}`;
  const head = pickR(rng() < 0.5 ? PLACE_HEAD : PLACE_WORD), tail = pickR(PLACE_TAIL), name = head + tail;
  if (/([^aeiou])\1[^aeiou]|[^aeiouy]{4}|^.{12}|(.)\2\2/.test(name) || tail.startsWith(head.slice(-3)) || head.endsWith(tail[0]) && tail[0] === "h") return makePlace(rng);
  return rng() < 0.12 ? `${pickR(PLACE_PRE)} ${cap(name)}` : cap(name);
}
// n distinct names.
function places(n = 3, rng = Math.random) {
  const out = new Set();
  while (out.size < n) out.add(makePlace(rng));
  return [...out];
}
