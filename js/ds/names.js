
const NAME_CORPUS = {
  f: [...NAMES.f, ..."Aldith Ailsa Brenna Edith Elswyth Eira Gwenna Hilde Ingrid Isolde Maude Morwen Nessa Rowena Sigrid Tilda Wynne Astrid Branwen Cerys Delia Elowen Gisela Hedda Ione Kerensa Lenna Mabyn Nia Oriel Petra Rhian Senna Tova Una Wilda Aveline Beatrix Cressida Emmeline Greer Hester Imogen Liesel Marit Odile Runa Solveig Thora".split(" ")],
  m: [...NAMES.m, ..."Aldric Bertram Cadoc Dunstan Edwin Gareth Godric Hamond Ivor Leofric Madoc Oswin Ranulf Sigurd Torben Ulric Wystan Alaric Berin Cenric Duncan Emrys Gawain Harald Ingram Jory Kenrick Lorcan Mathis Nils Oskar Roald Sten Tancred Wulfric Aled Bram Destan Egil Garrow Hob Kell Lachlan Mungo Ned Perran Rook Soren Tamlin Wat".split(" ")],
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
const WORDS = new Set("line corn stan wain bran alla mile tomat pieth bern hart lord ward".split(" "));

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

const PLACE_HEAD = "ash brack thorn wil oak elm hart crow wether ald bram fen hol cold marl stan lang kes rush wyn".split(" ");
// Tails like -ton, -ley, -field turned into surnames, so they read as people; these stay places.
const PLACE_TAIL = "wick thorpe mere holt stead dale combe wold moor by cross hollow".split(" ");
function makePlace(rng = Math.random) {
  const pickR = (xs) => xs[Math.floor(rng() * xs.length)];
  const tail = pickR(PLACE_TAIL), apart = tail === "cross" || tail === "hollow";
  const head = pickR(apart ? ["ash", "oak", "elm", "crow", "thorn", "hart", "fen", "rush", "cold"] : PLACE_HEAD);
  const name = head + (apart ? " " : "") + tail;
  if (/([^aeiou ])\1[^aeiou]|[^aeiouy ]{4}|^[^ ]{10}/.test(name) || tail.startsWith(head.slice(0, 3))) return makePlace(rng);
  const cap = (w) => w[0].toUpperCase() + w.slice(1), out = name.split(" ").map(cap).join(" ");
  return !out.includes(" ") && rng() < 0.15 ? `${pickR(["Low", "High", "Old", "Nether"])} ${out}` : out;
}
