// Millhollow — names. People get names that sound like the ones in NAMES without being them:
// an order-2 letter chain trained on a longer list, with anything awkward thrown back.
// Places are an old word or a made-up root, plus an English ending.

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
// Three consonants or vowels running, a tripled letter, or an ending no one would say.
const AWKWARD = /[^aeiouy]{3}|[aeiou]{3}|(.)\1\1|x|[jqz][^aeiou]|w[^aeiouyrh]|[^aeiouy](wr|kn|gn)/;
// Plain words that come out of the chain now and then.
const WORDS = new Set("line corn stan wain bran alla mile tomat pieth bern hart lord ward".split(" "));

// A made-up first name for a face of this sex ("f", "m" or "any"), not already in `taken`.
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
const PLACE_TAIL = "ford ley wick thorpe mere holt stead dale combe wold ham ton well moor bury field".split(" ");
function makePlace(rng = Math.random) {
  const pickR = (xs) => xs[Math.floor(rng() * xs.length)];
  let head = pickR(PLACE_HEAD);
  if (rng() < 0.4) head = makeName("m", new Set(), rng).toLowerCase().slice(0, 4).replace(/[aeiouy]+$/, "").replace(/([^aeiouy])[^aeiouy]+$/, "$1");
  const name = head + pickR(PLACE_TAIL);
  return /([^aeiou])\1[^aeiou]|[^aeiouy]{4}|^.{9}/.test(name) ? makePlace(rng) : name[0].toUpperCase() + name.slice(1);
}
