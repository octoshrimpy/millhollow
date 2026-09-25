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
  meals: { icon: "🥪", name: "Trail meals" },
  silver: { icon: "🥈", name: "Silver" },
  starmetal: { icon: "💎", name: "Starmetal" },
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
  cooking: "Cooking",
};

// Where someone came from before Millhollow: a birthplace, a trade, what their class made of
// them, and why they took the road. One of each, oldest first.
const PAST = {
  born: ["Born in a fishing village.", "Grew up on a hill farm.", "Raised by an aunt in the city.",
    "Born to traders.", "Orphan, raised at a temple.", "Grew up in a mining town.",
    "Born to millers.", "Raised in a forest camp.", "Grew up above a tavern."],
  trade: {
    farming: "Worked harvests.", woodcutting: "Felled timber for shipwrights.",
    quarrying: "Cut stone.", herbalism: "Gathered herbs for a healer.",
    smithing: "Worked a smithy's bellows.", healing: "Set bones.",
    scholarship: "Copied books at a monastery.", cooking: "Cooked at an inn.",
  },
  cls: {
    warrior: ["Two winters at a border fort.", "Pit fighter.", "Caravan guard."],
    ranger: ["Hunted for a lord.", "Tracked poachers.", "Lived a year alone in the hills."],
    mystic: ["Apprenticed to a hedge-witch.", "Burned down a library.", "Studied banned books."],
    cleric: ["Nursed the sick through a plague.", "Left a holy order.", "Buried a village after a fever."],
  },
  road: ["Lost home to fire.", "Came for work.", "Fled debts.", "Wanted quiet.", "Came for the dungeons.",
    "Lost family to winter.", "Fled a wedding.", "Got lost."],
};
// Older saves carry the wordier versions of these lines.
const PAST_WAS = {
  "Born on the road, to traders.": "Born to traders.", "Orphaned young, raised at a temple.": "Orphan, raised at a temple.",
  "Born to a miller's family.": "Born to millers.", "Worked the fields every harvest.": "Worked harvests.",
  "Felled timber for the shipwrights.": "Felled timber for shipwrights.", "Cut stone in a flooded quarry.": "Cut stone.",
  "Gathered herbs for a village healer.": "Gathered herbs for a healer.", "Worked the bellows in a smithy.": "Worked a smithy's bellows.",
  "Set bones for anyone who asked.": "Set bones.", "Copied books for a monastery.": "Copied books at a monastery.",
  "Served two winters in a border fort.": "Two winters at a border fort.", "Fought in the pits for coin.": "Pit fighter.",
  "Guarded caravans on the salt road.": "Caravan guard.", "Hunted deer for a lord's table.": "Hunted for a lord.",
  "Tracked poachers in the king's wood.": "Tracked poachers.", "Set a library on fire. Mostly by accident.": "Burned down a library.",
  "Read a book they shouldn't have.": "Studied banned books.", "Tended the sick through a plague year.": "Nursed the sick through a plague.",
  "Took vows, then left the order.": "Left a holy order.", "Buried half a village after a fever.": "Buried a village after a fever.",
  "Home burned. Walked north.": "Lost home to fire.", "Heard the mill stood empty.": "Came for work.",
  "Owed money to the wrong people.": "Fled debts.", "Wanted a quiet life.": "Wanted quiet.",
  "Came for the rumours of the stair.": "Came for the dungeons.", "Lost family to a hard winter.": "Lost family to winter.",
  "Left before the wedding.": "Fled a wedding.", "Followed a map that turned out wrong.": "Got lost.",
  "Four settlers reach the old mill. A stair under it leads down.": "Arrived.",
  "Raised the town hall. Millhollow is founded.": "Built the town hall.",
};

// `yields` is per worker per day at skill 0; each skill point adds 10%. `up` is what it can be
// rebuilt into where it stands, and what that costs on top.
// What the land is. Land with `clear` can be cleared to meadow for what it gives; water and
// mountains stay as they are.
const TERRAIN = {
  meadow: { name: "Meadow", icon: "" },
  forest: { name: "Woods", icon: "🌲", clear: { wood: 5 } },
  hills: { name: "Hills", icon: "🗻", clear: { stone: 4 } },
  ruins: { name: "Ruins", icon: "🧱", clear: { relics: 2, stone: 2 } },
  water: { name: "Water", icon: "🌊" },
  mountain: { name: "Mountains", icon: "🏔️" },
};
// Workplaces that do better beside certain land.
const BESIDE = { farm: ["water"], lumber: ["forest"], quarry: ["hills", "mountain"] };
const BESIDE_BOOST = 0.25;

const BUILDINGS = {
  townhall: { name: "Town hall", icon: "🏛️", cost: {}, beds: 4, desc: "4 beds." },
  hut: { name: "Hut", icon: "🛖", cost: { wood: 6 }, beds: 2, desc: "2 beds.", up: { to: "stonehouse", cost: { stone: 8 } } },
  stonehouse: { name: "Stone house", icon: "🏠", cost: { wood: 4, stone: 8 }, beds: 4, needs: "masonry", desc: "4 beds.",
    up: { to: "hall", cost: { wood: 6, stone: 6, ore: 2 } } },
  hall: { name: "Manor", icon: "🏰", cost: { wood: 10, stone: 14, ore: 2 }, beds: 6, needs: "architecture", desc: "6 beds." },
  farm: { name: "Farm", icon: "🌾", cost: { wood: 4 }, job: "farming", yields: { food: 3 }, desc: "Makes food." },
  lumber: { name: "Lumber camp", icon: "🪓", cost: { wood: 2 }, job: "woodcutting", yields: { wood: 3 }, desc: "Makes wood." },
  quarry: { name: "Quarry", icon: "⛰️", cost: { wood: 6 }, job: "quarrying", yields: { stone: 2, ore: 0.5 }, desc: "Makes stone, some ore." },
  garden: { name: "Herb garden", icon: "🌿", cost: { wood: 4, stone: 2 }, job: "herbalism", yields: { herbs: 1.5 }, desc: "Makes herbs for potions." },
  forge: { name: "Forge", icon: "⚒️", cost: { wood: 8, stone: 6 }, job: "smithing", desc: "Crafts gear and brews potions. Needs a worker." },
  infirmary: { name: "Infirmary", icon: "🩹", cost: { wood: 6, stone: 4 }, job: "healing", desc: "Wounded heal 3× faster. Needs a worker." },
  library: { name: "Library", icon: "📚", cost: { wood: 8, stone: 8 }, job: "scholarship", desc: "1 relic → 1 research per day. Needs a worker." },
  smokehouse: { name: "Smokehouse", icon: "🍖", cost: { wood: 8, stone: 2 }, job: "cooking", needs: "smoking", desc: "3🍞 → 1🥪 trail meal per day." },
};
// Workplaces improve in place; each level raises what the worker turns out (boost is the total).
const IMPROVABLE = (type) => !!(BUILDINGS[type].yields || ["library", "smokehouse"].includes(type));
const IMPROVE = [
  { boost: 0.25, cost: { ore: 3, wood: 4 }, needs: "smelting" },
  { boost: 0.5, cost: { silver: 3, stone: 4 }, needs: "silverwork" },
  { boost: 0.8, cost: { starmetal: 2, silver: 2 }, needs: "starforging" },
];

// `after` is the research that has to come first.
const RESEARCH = {
  scouting: { name: "Scouting", cost: 5, desc: "See 1 further from the town hall." },
  herbalism: { name: "Herbalism", cost: 4, desc: "Brew potions at the forge. 3🌿 each, heals 20." },
  salvage: { name: "Salvage", cost: 5, desc: "Demolishing returns ½ of what it cost." },
  smelting: { name: "Smelting", cost: 6, desc: "Iron gear. Workplaces improve to +25%." },
  field_rations: { name: "Field rations", cost: 6, desc: "Food and meals last one room longer." },
  smoking: { name: "Smoking", cost: 6, desc: "Smokehouse: trail meals last 3 rooms and heal." },
  rosters: { name: "Duty rosters", cost: 5, desc: "Back from a dungeon, settlers return to their jobs." },
  masonry: { name: "Masonry", cost: 8, desc: "Stone houses (4 beds). Huts can be rebuilt." },
  reclaim: { name: "Reclamation", cost: 10, after: "salvage", desc: "Demolishing returns ¾." },
  surveying: { name: "Surveying", cost: 10, after: "scouting", desc: "See 1 further again." },
  tactics: { name: "Tactics", cost: 10, desc: "Party size 4." },
  silverwork: { name: "Silverwork", cost: 12, after: "smelting", desc: "Silver gear. Workplaces to +50%. Silver lies below floor 3." },
  lanterns: { name: "Deep lanterns", cost: 12, desc: "See inside rooms next to you." },
  architecture: { name: "Architecture", cost: 14, after: "masonry", desc: "Manors (6 beds)." },
  cartography: { name: "Cartography", cost: 16, after: "surveying", desc: "See 2 further again." },
  starforging: { name: "Starforging", cost: 18, after: "silverwork", desc: "Starmetal gear. Workplaces to +80%. Starmetal lies below floor 6." },
};
// Where each ore first turns up in the dungeon.
const ORE_FLOOR = { silver: 3, starmetal: 6 };

// Gear is plain stat bonuses; any class can wear any of it.
const RECIPES = [
  { id: "club", name: "Oak club", slot: "weapon", atk: 2, cost: { wood: 4 } },
  { id: "jerkin", name: "Leather jerkin", slot: "armor", def: 1, hp: 5, cost: { wood: 2, herbs: 1 } },
  { id: "sword", name: "Iron sword", slot: "weapon", atk: 5, cost: { ore: 4, wood: 2 }, needs: "smelting" },
  { id: "mail", name: "Iron mail", slot: "armor", def: 3, hp: 10, spd: -1, cost: { ore: 6 }, needs: "smelting" },
  { id: "bow", name: "Yew longbow", slot: "weapon", atk: 4, spd: 1, cost: { wood: 6, ore: 1 }, needs: "smelting" },
  { id: "ssword", name: "Silver blade", slot: "weapon", atk: 8, cost: { silver: 4, ore: 2 }, needs: "silverwork" },
  { id: "smail", name: "Silver mail", slot: "armor", def: 5, hp: 14, cost: { silver: 6, ore: 2 }, needs: "silverwork" },
  { id: "sbow", name: "Silver-strung bow", slot: "weapon", atk: 7, spd: 1, cost: { silver: 3, wood: 4 }, needs: "silverwork" },
  { id: "starblade", name: "Star blade", slot: "weapon", atk: 12, spd: 1, cost: { starmetal: 4, silver: 2 }, needs: "starforging" },
  { id: "starplate", name: "Star plate", slot: "armor", def: 7, hp: 20, cost: { starmetal: 6, silver: 2 }, needs: "starforging" },
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
  wolf: { name: "Grey wolf", icon: "🐺", hp: 12, atk: 4, def: 0, spd: 12, from: 1 },
  spider: { name: "Cave spider", icon: "🕷️", hp: 11, atk: 5, def: 1, spd: 10, from: 1 },
  wisp: { name: "Marsh wisp", icon: "👻", hp: 9, atk: 4, def: 0, spd: 12, flying: true, ranged: true, from: 1 },
};
// `flying` enemies ignore the front row and can hit anyone.

const BOSSES = {
  3: { name: "The Bone Warden", icon: "☠️", hp: 130, atk: 12, def: 4, spd: 7, aoeEvery: 4 },
  6: { name: "Mother of Roots", icon: "🌳", hp: 230, atk: 15, def: 5, spd: 6, aoeEvery: 3 },
};
// Places with a way down. None of them end: each goes as deep as anyone dares, and its keeper
// is waiting again every third floor. `on` is the land a site sits on, `by` land it must touch.
const SITES = {
  mill: { name: "The old mill", icon: "🌀", foes: ["rat", "slime", "skeleton", "bat", "cultist", "ghoul", "root"], loot: [] },
  barrow: { icon: "🪦", on: ["hills"], foes: ["skeleton", "ghoul", "bat", "cultist"], loot: ["relics", "relics", "stone"],
    nouns: ["Barrow", "Howe", "Cairn"], adj: ["Cold", "Grey", "Crooked"], epithet: ["Unburied", "Pale", "Grey"], boss: "☠️" },
  mine: { icon: "🛒", on: ["hills"], by: ["mountain"], foes: ["rat", "spider", "bat", "ghoul"], loot: ["ore", "ore", "silver", "stone"],
    nouns: ["Delving", "Pit", "Workings"], adj: ["Flooded", "Deep", "Old"], epithet: ["Deep", "Blind", "Hungry"], boss: "👁️" },
  thornwood: { icon: "🎄", on: ["forest"], foes: ["wolf", "root", "spider", "slime"], loot: ["wood", "herbs", "herbs"],
    nouns: ["Tangle", "Weald", "Thicket"], adj: ["Black", "Crooked", "Weeping"], epithet: ["Rootbound", "Thorned", "Green"], boss: "🌳" },
  shrine: { icon: "⛩️", on: ["meadow", "forest"], by: ["water"], foes: ["wisp", "slime", "cultist", "skeleton"], loot: ["herbs", "relics", "potions"],
    nouns: ["Font", "Chapel", "Well"], adj: ["Sunken", "Drowned", "Weeping"], epithet: ["Drowned", "Weeping", "Pale"], boss: "🕯️" },
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
