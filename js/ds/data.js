// Millhollow — static tables. Nothing in here changes during play.

// Names and faces carried over from the log rebuild (js/sim.js), so a face never
// wears a name that fights it.
const NAMES = {
  f: ["Agatha", "Bridie", "Calla", "Dagny", "Freya", "Gerta", "Ilse", "Jorunn",
    "Linnet", "Lisbet", "Mira", "Orla", "Ottoline", "Quenna", "Rhoswen", "Sela",
    "Tamsin", "Thea", "Ulla", "Valla", "Verity", "Vesna", "Ysolde", "Zora"],
  m: ["Anselm", "Bevan", "Brann", "Clement", "Corvin", "Dorn", "Elric", "Finn",
    "Halvard", "Imre", "Jarl", "Kirwin", "Marek", "Merrick", "Norvel", "Nyle",
    "Odo", "Osric", "Piet", "Rafe", "Tomas", "Tovar", "Wendel", "Yannick"],
  any: ["Adrel", "Alder", "Bellamy", "Cass", "Delwyn", "Edrie", "Fenn", "Harlow",
    "Hesper", "Hollis", "Kestrel", "Mabry", "Perrin", "Pike", "Rowan", "Sorrel",
    "Wren", "Wyn"],
};
const FACES = 36;
const FACE_F = [1, 4, 6, 8, 13, 14, 16, 23, 24, 25, 26, 29, 31, 33, 35];
const FACE_ANY = [9];
const sexOf = (id) => (FACE_F.includes(id) ? "f" : FACE_ANY.includes(id) ? "any" : "m");
const namesFor = (sex) =>
  sex === "any" ? [...NAMES.f, ...NAMES.m, ...NAMES.any] : NAMES[sex].concat(NAMES.any);
const AGES = ["young", "mid", "old"];

const RESOURCES = {
  food: { icon: "🍞", name: "Food" },
  wood: { icon: "🪵", name: "Wood" },
  stone: { icon: "🪨", name: "Stone" },
  ore: { icon: "⛏️", name: "Ore" },
  herbs: { icon: "🌿", name: "Herbs" },
  relics: { icon: "🏺", name: "Relics" },
  research: { icon: "📜", name: "Research" },
  potions: { icon: "🧪", name: "Potions" },
};

// Combat classes. `skill` is the one ability each hero fires on its own.
const CLASSES = {
  warrior: {
    name: "Warrior", icon: "🛡️", hp: 32, atk: 6, def: 3, spd: 8, range: "melee",
    skill: { id: "cleave", name: "Cleave", cd: 10, desc: "70% to all enemies. Draws attacks for 5s." },
  },
  ranger: {
    name: "Ranger", icon: "🏹", hp: 22, atk: 6, def: 1, spd: 10, range: "ranged",
    skill: { id: "volley", name: "Volley", cd: 8, desc: "3 shots at random enemies, 60% each." },
  },
  mystic: {
    name: "Mystic", icon: "🔥", hp: 18, atk: 7, def: 0, spd: 8, range: "ranged",
    skill: { id: "firebolt", name: "Firebolt", cd: 9, desc: "220% to one enemy. Ignores armour." },
  },
  cleric: {
    name: "Cleric", icon: "✚", hp: 24, atk: 4, def: 2, spd: 8, range: "melee",
    skill: { id: "mend", name: "Mend", cd: 8, desc: "Heals the most hurt ally 12 + 2/level." },
  },
};

// Work settlers do at home. Skill grows by doing it.
const JOBS = {
  farming: "Farming", woodcutting: "Woodcutting", quarrying: "Quarrying",
  herbalism: "Herbalism", smithing: "Smithing", healing: "Healing", scholarship: "Scholarship",
};

// Where someone came from before the mill: a birthplace, a trade, what their class made of
// them, and why they took the road. One of each, oldest first.
const PAST = {
  born: ["Born in a fishing village.", "Grew up on a hill farm.", "Raised by an aunt in the city.",
    "Born on the road, to traders.", "Orphaned young, raised at a temple.", "Grew up in a mining town.",
    "Born to a miller's family.", "Raised in a forest camp.", "Grew up above a tavern."],
  trade: {
    farming: "Worked the fields every harvest.", woodcutting: "Felled timber for the shipwrights.",
    quarrying: "Cut stone in a flooded quarry.", herbalism: "Gathered herbs for a village healer.",
    smithing: "Worked the bellows in a smithy.", healing: "Set bones for anyone who asked.",
    scholarship: "Copied books for a monastery.",
  },
  cls: {
    warrior: ["Served two winters in a border fort.", "Fought in the pits for coin.", "Guarded caravans on the salt road."],
    ranger: ["Hunted deer for a lord's table.", "Tracked poachers in the king's wood.", "Lived a year alone in the hills."],
    mystic: ["Apprenticed to a hedge-witch.", "Set a library on fire. Mostly by accident.", "Read a book they shouldn't have."],
    cleric: ["Tended the sick through a plague year.", "Took vows, then left the order.", "Buried half a village after a fever."],
  },
  road: ["Home burned. Walked north.", "Heard the mill stood empty.", "Owed money to the wrong people.",
    "Wanted a quiet life.", "Came for the rumours of the stair.", "Lost family to a hard winter.",
    "Left before the wedding.", "Followed a map that turned out wrong."],
};

// `yields` is per worker per day at skill 0; each skill point adds 10%.
const BUILDINGS = {
  hut: { name: "Hut", icon: "🛖", cost: { wood: 6 }, beds: 2, desc: "2 beds." },
  stonehouse: { name: "Stone house", icon: "🏠", cost: { wood: 4, stone: 8 }, beds: 4, needs: "masonry", desc: "4 beds." },
  farm: { name: "Farm", icon: "🌾", cost: { wood: 4 }, job: "farming", yields: { food: 3 }, desc: "Makes food." },
  lumber: { name: "Lumber camp", icon: "🪓", cost: { wood: 2 }, job: "woodcutting", yields: { wood: 3 }, desc: "Makes wood." },
  quarry: { name: "Quarry", icon: "⛰️", cost: { wood: 6 }, job: "quarrying", yields: { stone: 2, ore: 0.5 }, desc: "Makes stone, some ore." },
  garden: { name: "Herb garden", icon: "🌿", cost: { wood: 4, stone: 2 }, job: "herbalism", yields: { herbs: 1.5 }, desc: "Makes herbs for potions." },
  forge: { name: "Forge", icon: "⚒️", cost: { wood: 8, stone: 6 }, job: "smithing", desc: "Crafts gear and brews potions. Needs a worker." },
  infirmary: { name: "Infirmary", icon: "🩹", cost: { wood: 6, stone: 4 }, job: "healing", desc: "Wounded heal 3× faster. Needs a worker." },
  library: { name: "Library", icon: "📚", cost: { wood: 8, stone: 8 }, job: "scholarship", desc: "1 relic → 1 research per day. Needs a worker." },
};

const RESEARCH = {
  herbalism: { name: "Herbalism", cost: 4, desc: "Brew potions at the forge. 3🌿 each, heals 20." },
  smelting: { name: "Smelting", cost: 6, desc: "Craft iron gear." },
  field_rations: { name: "Field rations", cost: 6, desc: "1 ration lasts 2 rooms." },
  masonry: { name: "Masonry", cost: 8, desc: "Unlocks stone houses (4 beds)." },
  tactics: { name: "Tactics", cost: 10, desc: "Party size 4." },
  lanterns: { name: "Deep lanterns", cost: 12, desc: "See inside rooms next to you." },
};

// Gear is plain stat bonuses; any class can wear any of it.
const RECIPES = [
  { id: "club", name: "Oak club", slot: "weapon", atk: 2, cost: { wood: 4 } },
  { id: "jerkin", name: "Leather jerkin", slot: "armor", def: 1, hp: 5, cost: { wood: 2, herbs: 1 } },
  { id: "sword", name: "Iron sword", slot: "weapon", atk: 5, cost: { ore: 4, wood: 2 }, needs: "smelting" },
  { id: "mail", name: "Iron mail", slot: "armor", def: 3, hp: 10, spd: -1, cost: { ore: 6 }, needs: "smelting" },
  { id: "bow", name: "Yew longbow", slot: "weapon", atk: 4, spd: 1, cost: { wood: 6, ore: 1 }, needs: "smelting" },
];

// Drops found in the dungeon, scaled by floor when rolled.
const LOOT_GEAR = [
  { name: "Rusted blade", slot: "weapon", atk: 3 },
  { name: "Bone charm", slot: "armor", hp: 8 },
  { name: "Cultist's knife", slot: "weapon", atk: 2, spd: 2 },
  { name: "Warden's plate", slot: "armor", def: 4, hp: 6, spd: -1 },
  { name: "Lantern staff", slot: "weapon", atk: 5 },
  { name: "Root-woven cloak", slot: "armor", def: 2, spd: 1 },
];

// Enemies at floor 1 strength. `from` is the first floor they turn up on.
const ENEMIES = {
  rat: { name: "Cellar rat", icon: "🐀", hp: 10, atk: 3, def: 0, spd: 11, from: 1 },
  slime: { name: "Mire slime", icon: "🟢", hp: 18, atk: 4, def: 1, spd: 6, from: 1 },
  skeleton: { name: "Skeleton", icon: "💀", hp: 16, atk: 5, def: 2, spd: 7, from: 1 },
  bat: { name: "Hollow bat", icon: "🦇", hp: 8, atk: 3, def: 0, spd: 13, flying: true, from: 2 },
  cultist: { name: "Cultist", icon: "🕯️", hp: 14, atk: 6, def: 1, spd: 8, flying: true, ranged: true, from: 2 },
  ghoul: { name: "Ghoul", icon: "🧟", hp: 26, atk: 7, def: 2, spd: 7, from: 3 },
  root: { name: "Rootling", icon: "🌱", hp: 20, atk: 5, def: 3, spd: 6, from: 4 },
};
// `flying` enemies ignore the front row and can hit anyone.

const BOSSES = {
  3: { name: "The Bone Warden", icon: "☠️", hp: 130, atk: 12, def: 4, spd: 7, aoeEvery: 4 },
  6: { name: "Mother of Roots", icon: "🌳", hp: 230, atk: 15, def: 5, spd: 6, aoeEvery: 3 },
};
const bossFor = (floor) => BOSSES[floor] || (floor % 3 === 0 && floor > 6
  ? { name: "Hollow Tyrant", icon: "👁️", hp: 120 + floor * 12, atk: 8 + floor, def: 5, spd: 7, aoeEvery: 3 }
  : null);

// Room events: `choices` each have a label and a resolver name handled in game.js.
const EVENTS = [
  {
    id: "prisoner", text: "A chained prisoner begs for water.",
    choices: [{ label: "Free them", act: "recruit" }, { label: "Leave", act: "none" }],
  },
  {
    id: "altar", text: "A black altar. It wants blood.",
    choices: [{ label: "Bleed (−5 HP each)", act: "altar" }, { label: "Leave", act: "none" }],
  },
  {
    id: "cart", text: "An overturned ore cart.",
    choices: [{ label: "Search", act: "cart" }, { label: "Leave", act: "none" }],
  },
  {
    id: "mushrooms", text: "Glowing mushrooms.",
    choices: [{ label: "Harvest", act: "mushrooms" }, { label: "Leave", act: "none" }],
  },
  {
    id: "marker", text: "A millstone carved with Millhollow's mark.",
    choices: [{ label: "Pry it out", act: "marker" }, { label: "Leave", act: "none" }],
  },
];
