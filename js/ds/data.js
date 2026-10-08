
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
const FACES = 60;
const FACE_F = [1, 4, 6, 8, 13, 14, 16, 23, 24, 25, 26, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59];
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

const CLASSES = {
  warrior: {
    name: "Warrior", icon: "🪖", hp: 32, atk: 6, def: 3, spd: 8, range: "melee",
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

const JOBS = {
  farming: "Farming", woodcutting: "Woodcutting", quarrying: "Quarrying",
  herbalism: "Herbalism", smithing: "Smithing", healing: "Healing", scholarship: "Scholarship",
  cooking: "Cooking", fishing: "Fishing",
};
const TRADES = {
  farming: "Farmer", woodcutting: "Woodcutter", quarrying: "Quarrier", herbalism: "Herbalist", smithing: "Smith",
  healing: "Healer", scholarship: "Scholar", cooking: "Cook", fishing: "Fisher",
};

const LENS = {
  woodcutting: ["fight"], fishing: ["fight"], farming: ["event"], cooking: ["treasure"],
  quarrying: ["stairs", "boss"], smithing: ["treasure"], healing: ["shrine"], herbalism: ["shrine"],
  scholarship: ["event"],
};

// Any line can hold {a|b|c}: each new person gets one of them, and braces can nest. A line is
// picked before its braces, so a line with many options is no likelier than one with none.
// Lines that game.js checks with pastHas, and the trade lines PAST_WAS renames old saves to, stay
// plain: those match on the exact text.
const PAST = {
  born: [
    "Born {in a fishing village|by a river crossing|in a market town|in a remote hamlet|in a tenement}.",
    "Born {on the frontier|on an island|in a forest village|in a hard winter|in a town that's gone now}.",
    "Born to {traders|millers|charcoal burners|shepherds|potters}.",
    "Born to {hunters|tinkers|a cooper and a brewer|the village reeve}.",
    "Temple orphan.",
    "Grew up {on a hill farm|on an orchard|among sheep|in a lumber camp|by a quarry}.",
    "Grew up {in a mining town|in a salt town|in a monastery village|on the docks|in a merchant house}.",
    "Grew up {over a tavern|near an old battlefield|on the king's road|by a shrine|under a ruined castle}.",
    "Grew up with {an aunt in the city|grandparents in the mountains|traveling players|an older sibling|an old soldier}.",
    "Grew up {in a forest camp|with shepherds|on a horse farm|among ferrymen|on a canal}.",
    "Grew up in {a roadside inn|a coastal monastery|a manor kitchen|a guildhall|a monastery orphanage}.",
  ],

  trade: {
    farming: [
      "Worked harvests.",
      "Worked {an orchard|vineyards down south}.",
      "Plowed behind an ox.",
      "Kept sheep through lambing.",
      "Drove cattle to market.",
      "Kept geese and chickens.",
      "Drained marshland.",
      "Threshed grain for hire.",
      "Ran a landlord's fields.",
    ],

    woodcutting: [
      "Felled timber for shipwrights.",
      "Cut {firewood for a monastery|beams for bridges}.",
      "Worked {a charcoal camp|winter logging camps}.",
      "Floated logs downriver.",
      "Squared timber for carpenters.",
      "Cleared forest for farmland.",
      "Split shingles.",
      "Marked trees for a forester.",
    ],

    quarrying: [
      "Cut stone.",
      "Hauled {quarry rubble|stone for a cathedral}.",
      "Worked {a lime kiln|slate pits}.",
      "Split granite.",
      "Cut paving stones.",
      "Carved gravestones.",
      "Opened a new quarry face.",
      "Dressed stone for city walls.",
    ],

    herbalism: [
      "Gathered herbs for a healer.",
      "Picked {mushrooms for an apothecary|moss in the hills}.",
      "Stripped willow bark.",
      "Dried roots and flowers.",
      "Kept a healer's garden.",
      "Sold herbs at market.",
      "Knew the poison berries.",
      "Made poultices.",
    ],

    smithing: [
      "Worked a smithy's bellows.",
      "Worked {in a foundry|for an armorer}.",
      "Made {nails|cooking pots}.",
      "Forged {miners' tools|wagon fittings}.",
      "Sharpened farm tools.",
      "Shoed horses.",
      "Fixed hinges and locks.",
    ],

    healing: [
      "Learned how to set bones.",
      "Stitched wounds.",
      "Helped a midwife.",
      "Dressed wounds for a barber-surgeon.",
      "Rolled bandages at a hospice.",
      "Nursed fever patients.",
      "Tended injured quarrymen.",
      "Worked in a monastery infirmary.",
      "Carried medicine between villages.",
      "Trained under an old physician.",
    ],

    scholarship: [
      "Copied books at a monastery.",
      "Copied contracts.",
      "Kept a merchant's accounts.",
      "Taught rich children their letters.",
      "Translated old records.",
      "Worked as a scribe.",
      "Catalogued a monastery library.",
      "Drew maps for a surveyor.",
      "Recorded taxes for a magistrate.",
      "Illuminated manuscripts.",
    ],

    cooking: [
      "Cooked {at an inn|on a riverboat|for a monastery}.",
      "Worked {a manor kitchen|a brewery kitchen|for a butcher}.",
      "Baked bread before dawn.",
      "Fed quarry crews.",
      "Sold pies at market.",
      "Ran a roadside stewpot.",
    ],

    fishing: [
      "Mended nets.",
      "Crewed {a riverboat|a merchant ship}.",
      "Set eel traps.",
      "Gutted fish at the docks.",
      "Fished the coast in winter.",
      "Dug bait on the tidal flats.",
      "Built fish traps.",
      "Smoked fish for market.",
    ],
  },

  cls: {
    warrior: [
      "Two winters at a border fort.",
      "Pit fighter.",
      "Caravan guard.",
      "Mercenary.",
      "Town watchman.",
      "Guarded {a counting house|prisoners|a bridge for three years|pilgrims}.",
      "Fought {bandits on the king's road|in someone else's feud}.",
      "Served {in a lord's levy|on an armed merchant ship}.",
      "Escorted tax collectors.",
      "Survived a siege.",
      "Drilled militia.",
      "Hunted highwaymen for bounty.",
      "Household guard to a noble.",
      "Deserted an army.",
      "Won a sword in a tavern bet.",
    ],

    ranger: [
      "Hunted {for a lord|wolves for bounty|a man-eater}.",
      "Tracked {poachers|a lost child for six days|smugglers through the marshes}.",
      "Guided {travelers over the mountains|caravans through deep forest}.",
      "Worked as {a forester|a scout in a border war}.",
      "Raided across the border.",
      "Knew {every ford on the river|the old roads}.",
      "Lived a year alone in the hills.",
      "Mapped old trails.",
      "Patrolled a lord's hunting grounds.",
      "Trapped for three winters.",
      "Kept wolves off the flocks.",
      "Rarely slept indoors.",
      "Ran messages through bandit country.",
      "Searched a season for a lost expedition.",
    ],

    mystic: [
      "Learned {from a hedge-witch|charms from a wandering mystic|magic from a teacher who vanished|from spirits}.",
      "Studied {banned books|ruins nobody else would enter}.",
      "Dreamed things before they happened.",
      "Failed out of an academy.",
      "Assisted an astrologer.",
      "Read a spell their master forbade.",
      "Spent a winter on an unknown language.",
      "Joined a secret circle of scholars.",
      "Broke a seal they shouldn't have.",
      "Lifted curses for pay.",
      "Collected scraps of old spellbooks.",
      "Survived the ritual that killed their teacher.",
      "Saw something in a mirror.",
      "Hid their talent for years.",
      "Caused an accident they still can't explain.",
      "Cursed a man who wronged them.",
    ],

    cleric: [
      "Nursed the sick through a plague.",
      "Left {a holy order|after a fight with a bishop}.",
      "Served {at a roadside shrine|as chaplain to soldiers}.",
      "Buried {a village after a fever|soldiers after a battle}.",
      "Walked a year with pilgrims.",
      "Sat with the dying.",
      "Copied sermons at a monastery.",
      "Cooked in a temple kitchen.",
      "Carried relics between shrines.",
      "Took orders and regretted it.",
      "Kept a country chapel.",
      "Kept a graveyard.",
      "Preached in mining camps.",
      "Rebuilt a burned temple.",
      "Fed the poor.",
      "Guarded a holy spring.",
      "Carried a mace for a bishop.",
    ],
  },

  bad: [
    "Burned down {a library|a forge|a smokehouse|an infirmary|a farm|a church|the stables} on purpose.",
    "Burned down {a library|a forge|a smokehouse|an infirmary|a farm|a church|the stables} by accident.",
    "Fled a wedding.",
    "Fled debts.",
    "Stole from a lord.",
    "Drank away a fortune.",
    "Carried a fever into a village.",
    "Sold out a friend.",
  ],

  road: [
    "Got lost.",
    "Lost {home to fire|family to winter|everything gambling}.",
    "Won big at dice.",
    "Came for {work|the dungeons|the ruins|an inheritance}.",
    "Came {with a caravan and stayed|to prove someone wrong|because everyone said not to|when a relative wrote for help}.",
    "Looking for {a missing sibling|cheaper rent|a healer|a priest|revenge}.",
    "Wanted {quiet|land|to disappear|a fresh start}.",
    "Wanted {to see the frontier|adventure|to see where the road ended}.",
    "Followed {rumors of good farmland|rumors of treasure|an old friend|a wandering preacher|a drunk's map}.",
    "Heard {there was work|Millhollow needed hands|nobody asks questions here}.",
    "Chased {a job that didn't exist|cheap land|a debtor|a lover}.",
    "Left {after a bad harvest|when their employer died|before the law arrived|after a family fight}.",
    "Inherited {nothing|trouble}.",
    "Running from {someone|an old mistake|a feud}.",
    "{Following|Avoiding} a prophecy.",
    "Needed somewhere nobody knew them.",
    "Family sent them away.",
    "Finished their service.",
    "Tired of the city.",
    "Missed a turn on the king's road.",
    "Nowhere else to go.",
    "Couldn't afford home anymore.",
    "Took the first road out of town.",
    "Survived a shipwreck and kept walking.",
    "Stopped for one night and stayed.",
  ],
};
const PAST_GOOD = new Set(Object.values(PAST.trade).flat());
const PAST_VIOLENT = ["Pit fighter.", "Mercenary.", "Fought {bandits on the king's road|in someone else's feud}.",
  "Hunted highwaymen for bounty.", "Raided across the border.", "Carried a mace for a bishop.", "Cursed a man who wronged them.",
  "Looking for revenge.", PAST.bad[0]];
const PAST_BAD = new Set([...PAST.bad, "Burned down a library by accident."]);
const PAST_PAYS = {
  "Worked harvests.": ["farm", "food", 10, "brought in a bumper harvest"],
  "Plowed behind an ox.": ["farm", "food", 8, "plowed the back field"],
  "Felled timber for shipwrights.": ["lumber", "wood", 12, "felled an old oak"],
  "Cut stone.": ["quarry", "stone", 8, "found a clean seam"],
  "Split granite.": ["quarry", "stone", 6, "split a boulder"],
  "Gathered herbs for a healer.": ["garden", "herbs", 5, "found a wild patch"],
  "Worked a smithy's bellows.": ["forge", "ore", 3, "melted down scrap"],
  "Copied books at a monastery.": ["library", "research", 3, "copied out an old text"],
  "Baked bread before dawn.": ["smokehouse", "meals", 2, "baked trail bread"],
  "Mended nets.": ["dock", "food", 8, "mended the nets"],
  "Set eel traps.": ["dock", "food", 6, "emptied the eel traps"],
};
// Older saves carry the wordier versions of these lines.
const PAST_WAS = {
  "Born on the road, to traders.": "Born to traders.", "Orphaned young, raised at a temple.": "Temple orphan.", "Orphan, raised at a temple.": "Temple orphan.",
  "Born to a miller's family.": "Born to millers.", "Worked the fields every harvest.": "Worked harvests.",
  "Felled timber for the shipwrights.": "Felled timber for shipwrights.", "Cut stone in a flooded quarry.": "Cut stone.",
  "Gathered herbs for a village healer.": "Gathered herbs for a healer.", "Worked the bellows in a smithy.": "Worked a smithy's bellows.",
  "Set bones for anyone who asked.": "Learned how to set bones.", "Set bones.": "Learned how to set bones.", "Copied books for a monastery.": "Copied books at a monastery.",
  "Served two winters in a border fort.": "Two winters at a border fort.", "Fought in the pits for coin.": "Pit fighter.",
  "Guarded caravans on the salt road.": "Caravan guard.", "Hunted deer for a lord's table.": "Hunted for a lord.",
  "Tracked poachers in the king's wood.": "Tracked poachers.", "Set a library on fire. Mostly by accident.": "Burned down a library by accident.",
  "Read a book they shouldn't have.": "Studied banned books.", "Tended the sick through a plague year.": "Nursed the sick through a plague.",
  "Took vows, then left the order.": "Left a holy order.", "Buried half a village after a fever.": "Buried a village after a fever.",
  "Home burned. Walked north.": "Lost home to fire.", "Heard the mill stood empty.": "Came for work.",
  "Owed money to the wrong people.": "Fled debts.", "Wanted a quiet life.": "Wanted quiet.",
  "Came for the rumours of the stair.": "Came for the dungeons.", "Lost family to a hard winter.": "Lost family to winter.",
  "Left before the wedding.": "Fled a wedding.", "Followed a map that turned out wrong.": "Got lost.",
  "Four settlers reach the old mill. A stair under it leads down.": "Arrived.",
  "Raised the town hall. Millhollow is founded.": "Built the town hall.",
};

const TERRAIN = {
  meadow: { name: "Meadow", icon: "" },
  forest: { name: "Woods", icon: "🌲", clear: { wood: 5 } },
  hills: { name: "Hills", icon: "🗻", clear: { stone: 4 } },
  ruins: { name: "Ruins", icon: "🧱", clear: { relics: 2, stone: 2 } },
  water: { name: "Water", icon: "🌊" },
  mountain: { name: "Mountains", icon: "🏔️" },
};
const BESIDE = { farm: ["water"], dock: ["water"], lumber: ["forest"], quarry: ["hills", "mountain"] };
const BESIDE_BOOST = 0.1;
const BESIDE_YIELDS = { quarry: { mountain: { ore: 0.35 } } };

const BUILDINGS = {
  townhall: { name: "Town hall", icon: "🏛️", cost: {}, beds: 4, desc: "4 beds." },
  hut: { name: "Hut", icon: "🛖", cost: { wood: 6 }, beds: 2, desc: "2 beds.", up: { to: "stonehouse", cost: { stone: 8 } } },
  stonehouse: { name: "Stone house", icon: "🏠", cost: { wood: 4, stone: 8 }, beds: 4, needs: "masonry", desc: "4 beds.",
    up: { to: "hall", cost: { wood: 6, stone: 6, ore: 2 } } },
  hall: { name: "Manor", icon: "🏰", cost: { wood: 10, stone: 14, ore: 2 }, beds: 6, needs: "architecture", desc: "6 beds." },
  farm: { name: "Farm", icon: "🌾", cost: { wood: 4 }, job: "farming", yields: { food: 3 }, desc: "Makes food." },
  lumber: { name: "Lumber camp", icon: "🪓", cost: { wood: 2 }, job: "woodcutting", yields: { wood: 3 }, desc: "Makes wood." },
  quarry: { name: "Quarry", icon: "⛰️", cost: { wood: 6 }, job: "quarrying", yields: { stone: 2, ore: 0.15 }, desc: "Makes stone, a little ore. More beside mountains." },
  dock: { name: "Fishing dock", icon: "🎣", cost: { wood: 5 }, job: "fishing", yields: { food: 2.5 }, near: "water", desc: "Makes food." },
  garden: { name: "Herb garden", icon: "🌿", cost: { wood: 4, stone: 2 }, job: "herbalism", yields: { herbs: 1.5 }, desc: "Makes herbs for potions." },
  forge: { name: "Forge", icon: "⚒️", cost: { wood: 8, stone: 6 }, job: "smithing", desc: "Crafts gear and brews potions." },
  infirmary: { name: "Infirmary", icon: "🩹", cost: { wood: 6, stone: 4 }, job: "healing", desc: "Wounded heal 3× faster." },
  library: { name: "Library", icon: "📚", cost: { wood: 8, stone: 8 }, job: "scholarship", desc: "1 relic → research each day." },
  graveyard: { name: "Graveyard", icon: "⛪", cost: { wood: 4, stone: 6 }, desc: "Lays the dead to rest." },
  park: { name: "Park", icon: "🏞", cost: { wood: 4, stone: 2 }, needs: "green", desc: "Evenings out." },
  playground: { name: "Playground", icon: "🛝", cost: { wood: 6 }, needs: "green", desc: "Evenings out." },
  fountain: { name: "Fountain", icon: "⛲", cost: { stone: 10 }, needs: "square", desc: "Evenings out." },
  range: { name: "Archery range", icon: "🏹", cost: { wood: 6, stone: 2 }, needs: "square", desc: "Lets off steam. Grudges fade faster." },
  axeyard: { name: "Axe yard", icon: "🎯", cost: { wood: 8, stone: 2 }, needs: "games", desc: "Lets off steam. Grudges fade faster." },
  chapel: { name: "Chapel", icon: "🛐", cost: { wood: 4, stone: 6 }, needs: "green", desc: "Evenings out." },
  bandstand: { name: "Bandstand", icon: "🎻", cost: { wood: 8 }, needs: "green", desc: "Evenings out." },
  workshop: { name: "Workshop", icon: "🪚", cost: { wood: 8, stone: 2 }, needs: "square", desc: "Evenings out." },
  stables: { name: "Stables", icon: "🐎", cost: { wood: 10 }, needs: "square", desc: "Evenings out." },
  alehouse: { name: "Alehouse", icon: "🍺", cost: { wood: 8, stone: 4 }, needs: "games", desc: "Evenings out." },
  smokehouse: { name: "Smokehouse", icon: "🍖", cost: { wood: 8, stone: 2 }, job: "cooking", needs: "smoking", desc: "3🍞 → 1🥪 trail meal per day." },
};
const IMPROVABLE = (type) => !!(BUILDINGS[type].yields || ["library", "smokehouse", "forge"].includes(type));
const IMPROVE = [
  { boost: 0.25, cost: { ore: 3, wood: 4 }, upkeep: { wood: 1 }, needs: "smelting" },
  { boost: 0.5, cost: { silver: 3, stone: 4 }, upkeep: { stone: 1 }, needs: "silverwork" },
  { boost: 0.8, cost: { starmetal: 2, silver: 2 }, upkeep: { silver: 1 }, needs: "starforging" },
];

const RESEARCH = {
  scouting: { name: "Scouting", cost: 5, desc: "See 1 further from the town hall." },
  herbalism: { name: "Herbalism", cost: 4, desc: "Brew potions at the forge. 3🌿 each, heals 20." },
  salvage: { name: "Salvage", cost: 6, desc: "Demolishing returns ¾ of what it cost." },
  smelting: { name: "Smelting", cost: 6, desc: "Iron gear. Workplaces improve to +25%." },
  field_rations: { name: "Foraging", cost: 6, desc: "Won fights sometimes turn up 1🍞." },
  smoking: { name: "Smoking", cost: 6, desc: "Smokehouse: 3🍞 → 1🥪." },
  camping: { name: "Camping", cost: 8, desc: "Rest once a floor: 1🍞 each, heals half. Uncleared rooms may come for you." },
  altar_lore: { name: "Altar lore", cost: 8, desc: "Altars always pay, but take 10 HP each." },
  rope: { name: "Climbing rope", cost: 10, desc: "Half the ambushes on the way home." },
  nightwatch: { name: "Night watch", cost: 8, desc: "Two can keep watch." },
  masonry: { name: "Masonry", cost: 8, desc: "Stone houses (4 beds)." },
  surveying: { name: "Surveying", cost: 10, after: "scouting", desc: "See 1 further again." },
  tactics: { name: "Tactics", cost: 10, desc: "Party size 4." },
  silverwork: { name: "Silverwork", cost: 12, after: "smelting", desc: "Silver gear. Workplaces to +50%. Silver lies below floor 3." },
  lanterns: { name: "Deep lanterns", cost: 12, desc: "See inside rooms next to you." },
  walls: { name: "Fortified walls", cost: 14, after: "nightwatch", desc: "Half the bandits." },
  architecture: { name: "Architecture", cost: 14, after: "masonry", desc: "Manors (6 beds)." },
  cartography: { name: "Cartography", cost: 16, after: "surveying", desc: "See 2 further again." },
  green: { name: "Village green", cost: 6, desc: "Parks, playgrounds, chapels, bandstands." },
  square: { name: "Town square", cost: 10, after: "green", desc: "Fountains, archery ranges, workshops, stables." },
  games: { name: "Games", cost: 14, after: "square", desc: "Axe yards, alehouses." },
  starforging: { name: "Starforging", cost: 18, after: "silverwork", desc: "Starmetal gear. Workplaces to +80%. Starmetal lies below floor 6." },
};
const ORE_FLOOR = { silver: 3, starmetal: 6 };

const RECIPES = [
  { id: "club", name: "Oak club", slot: "weapon", cls: "warrior", atk: 2, cost: { wood: 4 } },
  { id: "staff", name: "Yew staff", slot: "weapon", cls: "mystic", atk: 3, cost: { wood: 5, herbs: 1 } },
  { id: "rod", name: "Ash rod", slot: "weapon", cls: "cleric", atk: 2, hp: 4, cost: { wood: 4, herbs: 1 } },
  { id: "jerkin", name: "Leather jerkin", slot: "armor", def: 1, hp: 5, cost: { wood: 2, herbs: 1 } },
  { id: "sword", name: "Iron sword", slot: "weapon", cls: "warrior", atk: 5, cost: { ore: 4, wood: 2 }, needs: "smelting" },
  { id: "bow", name: "Yew longbow", slot: "weapon", cls: "ranger", atk: 4, spd: 1, cost: { wood: 6, ore: 1 }, needs: "smelting" },
  { id: "istaff", name: "Iron-shod staff", slot: "weapon", cls: "mystic", atk: 6, cost: { wood: 3, ore: 3 }, needs: "smelting" },
  { id: "mace", name: "Iron mace", slot: "weapon", cls: "cleric", atk: 4, def: 1, cost: { ore: 4, wood: 1 }, needs: "smelting" },
  { id: "mail", name: "Iron mail", slot: "armor", def: 3, hp: 10, spd: -1, cost: { ore: 6 }, needs: "smelting" },
  { id: "ssword", name: "Silver blade", slot: "weapon", cls: "warrior", atk: 8, cost: { silver: 4, ore: 2 }, needs: "silverwork" },
  { id: "sbow", name: "Silver-strung bow", slot: "weapon", cls: "ranger", atk: 7, spd: 1, cost: { silver: 3, wood: 4 }, needs: "silverwork" },
  { id: "wand", name: "Silver wand", slot: "weapon", cls: "mystic", atk: 9, spd: 1, cost: { silver: 3, wood: 2 }, needs: "silverwork" },
  { id: "smace", name: "Silver mace", slot: "weapon", cls: "cleric", atk: 7, def: 1, cost: { silver: 4, ore: 2 }, needs: "silverwork" },
  { id: "smail", name: "Silver mail", slot: "armor", def: 5, hp: 14, cost: { silver: 6, ore: 2 }, needs: "silverwork" },
  { id: "starblade", name: "Star blade", slot: "weapon", cls: "warrior", atk: 12, spd: 1, cost: { starmetal: 4, silver: 2 }, needs: "starforging" },
  { id: "starbow", name: "Star-strung bow", slot: "weapon", cls: "ranger", atk: 11, spd: 2, cost: { starmetal: 3, wood: 4 }, needs: "starforging" },
  { id: "starstaff", name: "Star staff", slot: "weapon", cls: "mystic", atk: 13, spd: 1, cost: { starmetal: 4, wood: 2 }, needs: "starforging" },
  { id: "starmace", name: "Star mace", slot: "weapon", cls: "cleric", atk: 11, def: 2, cost: { starmetal: 4, silver: 2 }, needs: "starforging" },
  { id: "starplate", name: "Star plate", slot: "armor", def: 7, hp: 20, cost: { starmetal: 6, silver: 2 }, needs: "starforging" },
];

const LOOT_GEAR = [
  { name: "Rusted blade", slot: "weapon", cls: "warrior", atk: 3 },
  { name: "Bone charm", slot: "armor", hp: 8 },
  { name: "Cultist's knife", slot: "weapon", cls: "ranger", atk: 2, spd: 2 },
  { name: "Warden's plate", slot: "armor", def: 4, hp: 6, spd: -1 },
  { name: "Lantern staff", slot: "weapon", cls: "mystic", atk: 5 },
  { name: "Chapel censer", slot: "weapon", cls: "cleric", atk: 3, hp: 4 },
  { name: "Root-woven cloak", slot: "armor", def: 2, spd: 1 },
];

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

const BOSSES = {
  3: { name: "The Bone Warden", icon: "☠️", hp: 130, atk: 12, def: 4, spd: 7, aoeEvery: 4 },
  6: { name: "Mother of Roots", icon: "🌳", hp: 230, atk: 15, def: 5, spd: 6, aoeEvery: 3 },
};
const SITES = {
  mill: { name: "The old mill", icon: "🌬", foes: ["rat", "slime", "skeleton", "bat", "cultist", "ghoul", "root"], loot: [] },
  barrow: { icon: "🪦", on: ["hills"], foes: ["skeleton", "ghoul", "bat", "cultist"], loot: ["relics", "relics", "stone"],
    nouns: ["Barrow", "Howe", "Cairn"], adj: ["Cold", "Grey", "Crooked"], epithet: ["Unburied", "Pale", "Grey"], boss: "☠️" },
  mine: { icon: "🛒", on: ["hills"], by: ["mountain"], foes: ["rat", "spider", "bat", "ghoul"], loot: ["ore", "ore", "silver", "stone"],
    nouns: ["Delving", "Pit", "Workings"], adj: ["Flooded", "Deep", "Old"], epithet: ["Deep", "Blind", "Hungry"], boss: "👹" },
  thornwood: { icon: "🎄", on: ["forest"], foes: ["wolf", "root", "spider", "slime"], loot: ["wood", "herbs", "herbs"],
    nouns: ["Tangle", "Weald", "Thicket"], adj: ["Black", "Crooked", "Weeping"], epithet: ["Rootbound", "Thorned", "Green"], boss: "🌳" },
  shrine: { icon: "⛩️", on: ["meadow", "forest"], by: ["water"], foes: ["wisp", "slime", "cultist", "skeleton"], loot: ["herbs", "relics", "potions"],
    nouns: ["Font", "Chapel", "Well"], adj: ["Sunken", "Drowned", "Weeping"], epithet: ["Drowned", "Weeping", "Pale"], boss: "🕯️" },
};

const bossFor = (floor) => BOSSES[floor] || (floor % 3 === 0 && floor > 6
  ? { name: "Hollow Tyrant", icon: "👁️", hp: 120 + floor * 12, atk: 8 + floor, def: 5, spd: 7, aoeEvery: 3 }
  : null);

const EVENTS = [
  {
    id: "prisoner", text: "A chained prisoner begs for water.",
    choices: [{ label: "Free them", act: "free" }, { label: "Leave", act: "none" }],
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

const FIRESIDE = ["told the old days by the fire", "talked about home by the fire", "told about before Millhollow",
  "told a story by the fire", "told how it was back then"];
const FIRESIDE_AGAIN = ["told it again", "told that story again", "told it again, longer"];
const PASTIMES = {
  carving:    { icon: "🪵", name: "wood carving", from: /timber|shingle|carpent|forest|lumber/i, after: ["made", "victory"], does: ["carved a little {fox|owl|bear|horse}", "carved a spoon for {o}", "whittled a whistle"] },
  baskets:    { icon: "🧺", name: "basket weaving", from: /willow|marsh|harvest|market/i, after: ["wed"], does: ["wove a basket", "wove a fish trap", "wove {o} a sewing basket"] },
  smithing:   { icon: "🔨", name: "tinkering at the forge", needs: "forge", from: /smith|forge|foundry|armorer|nails|hinge|horses/i, after: ["made", "armed"], does: ["hammered out a {hook|buckle|bell}", "mended {o}'s pot", "made a ring from a nail"] },
  riding:     { icon: "🐎", name: "riding", needs: "stables", from: /horse|cattle|caravan|messages|frontier/i, after: ["victory", "levelup"], does: ["rode out to the ridge", "rode the long way round", "taught {o} to sit a horse"] },
  binding:    { icon: "📕", name: "bookbinding", from: /book|librar|scribe|manuscript|copied|illumin/i, after: ["made", "grief"], does: ["bound a book", "stitched a cover for {o}", "rebound a torn spine"] },
  reading:    { icon: "📖", name: "reading", from: /book|librar|letters|scribe|manuscript|records|sermon/i, after: ["grief", "neardeath"], does: ["read by the fire", "read to {o}", "read the same page twice"] },
  teaching:   { icon: "🧑‍🏫", name: "teaching", from: /taught|drilled|trained|teacher/i, after: ["levelup", "victory"], does: ["practiced a lesson aloud", "taught {o} their letters", "taught {o} a knot", "taught {o} a song"] },
  learning:   { icon: "✏️", name: "learning", from: /academy|studied|failed|language/i, after: ["neardeath", "blamed"], does: ["asked {o} a hundred questions", "practiced letters in the dirt", "learned a {knot|song|word of old tongue} from {o}"] },
  pottery:    { icon: "🏺", name: "pottery", from: /potter|kiln|clay/i, after: ["wed", "made"], does: ["threw a pot", "shaped a clay {cat|bird|face}", "made {o} a cup"] },
  statues:    { icon: "🗿", name: "clay figures", from: /gravestone|stone|granite|cathedral/i, after: ["grief"], does: ["shaped a clay {soldier|saint|dog}", "made a little figure of {o}", "set a clay bird on the sill"] },
  fishing:    { icon: "🎣", name: "fishing", needs: "water", from: /net|eel|fish|river|coast|bait|ferry|canal/i, after: ["grief", "jilted"], does: ["fished till dark", "caught nothing and didn't mind", "fished with {o}"] },
  embroidery: { icon: "🪡", name: "embroidery", from: /manor|noble|merchant house|guild/i, after: ["wed"], does: ["stitched a {flower|bird|star} on a sleeve", "embroidered {o}'s collar", "stitched names on a cloth"] },
  singing:    { icon: "🎶", name: "singing", from: /players|tavern|inn|pilgrim|chapel/i, after: ["wed", "feast"], does: ["sang at the gate", "sang with {o}", "sang an old ballad wrong"] },
  lute:       { icon: "🪕", name: "the lute", from: /players|tavern|inn|noble/i, after: ["jilted", "wed"], does: ["played the lute", "wrote a tune for {o}", "broke a lute string"] },
  dice:       { icon: "🎲", name: "dice", from: /dice|gambl|bet|tavern|debt/i, after: ["victory"], does: ["won a button off {o} at dice", "lost at dice", "beat {o} at dice", "taught {o} a dice game"] },
  checkers:   { icon: "🔘", name: "checkers", from: /tavern|inn|farm|market|tax|clerk|ferry/i, after: ["blamed", "bored"], does: ["beat {o} at checkers", "lost to {o} at checkers", "jumped three of {o}'s men", "cut a checkerboard from a plank"] },
  backgammon: { icon: "🀄", name: "backgammon", from: /tavern|inn|ferry|market|merchant|sail|trade|gambl/i, after: ["blamed", "bored"], does: ["beat {o} at backgammon", "lost to {o} at backgammon", "doubled the stakes at backgammon", "rolled double sixes at backgammon"] },
  chess:      { icon: "♟️", name: "chess", from: /siege|fort|tactic|lord|accounts/i, after: ["blamed", "levelup"], does: ["beat {o} at chess", "lost to {o} at chess", "carved a missing chess piece"] },
  gardening:  { icon: "🌱", name: "gardening", from: /orchard|farm|garden|vineyard|herb/i, after: ["wed", "grief"], does: ["weeded the beds", "planted {beans|onions|a rosebush}", "gave {o} a cutting"] },
  birds:      { icon: "🐦", name: "birdwatching", from: /hills|forest|marsh|alone|trap/i, after: ["neardeath"], does: ["watched the swallows", "counted herons on the river", "showed {o} a nest"] },
  stars:      { icon: "✨", name: "star-gazing", from: /astrolog|dream|mirror|spirits|prophecy/i, after: ["grief", "neardeath"], does: ["named the stars", "watched for falling stars", "showed {o} the hunter in the sky"] },
  brewing:    { icon: "🍺", name: "brewing", from: /brew|tavern|inn|vineyard|grain/i, after: ["feast", "jilted"], does: ["brewed a small beer", "brewed something too strong", "shared a jug with {o}"] },
  baking:     { icon: "🥧", name: "baking", from: /bake|bread|pie|kitchen|cook/i, after: ["wed", "grief"], does: ["baked {honey cakes|a pie|black bread}", "baked {o} a cake", "burned the bread"] },
  poetry:     { icon: "🪶", name: "poetry", from: /illumin|scribe|copied|letters/i, after: ["grief", "jilted", "wed"], does: ["wrote a poem", "wrote a poem for {o}", "burned a poem"] },
  painting:   { icon: "🎨", name: "painting", from: /illumin|manuscript|map/i, after: ["made", "grief"], does: ["painted the river", "painted {o}", "painted a door blue"] },
  knitting:   { icon: "🧶", name: "knitting", from: /sheep|lambing|shepherd|winter/i, after: ["wed", "grief"], does: ["knitted a scarf", "knitted {o} mittens", "knitted socks"] },
  fletching:  { icon: "🏹", name: "fletching", from: /hunt|poacher|bounty|wolves/i, after: ["victory", "raided"], does: ["fletched arrows", "trimmed goose feathers", "made {o} a bow"] },
  archery:    { icon: "🎯", name: "archery", from: /hunt|scout|patrol|levy/i, after: ["victory", "neardeath"], does: ["shot at a straw target", "outshot {o}", "lost an arrow in the reeds"] },
  tanning:    { icon: "👜", name: "leatherwork", from: /butcher|cattle|trap|hunter/i, after: ["made"], does: ["stitched a belt", "mended {o}'s boots", "tooled a pouch"] },
  candles:    { icon: "🪔", name: "candle-making", from: /chapel|shrine|temple|monaster|church/i, after: ["grief", "haunted"], does: ["dipped candles", "lit a candle for the dead", "made {o} a candle"] },
  maps:       { icon: "🗺️", name: "map-drawing", from: /map|surveyor|trail|road|ford/i, after: ["levelup", "victory"], does: ["drew a map of the valley", "drew the dungeon from memory", "drew the dungeon from {o}'s telling", "argued about a map with {o}"] },
  pressing:   { icon: "🌼", name: "pressing flowers", from: /herb|flower|root|moss|healer/i, after: ["wed", "grief"], does: ["pressed flowers", "pressed a flower for {o}", "dried lavender"] },
  prayer:     { icon: "🙏", name: "prayer", from: /temple|shrine|bishop|chapel|holy|preach|orders/i, after: ["grief", "neardeath", "haunted"], does: ["prayed at dusk", "prayed for {o}", "prayed for the dead"] },
  tales:      { icon: "🏕", name: "telling tales", from: /soldier|caravan|players|sailor|ship|road/i, after: ["victory", "neardeath"], does: ["told a tale by the fire", "told {o} about the old days", "told a ghost story"] },
  wrestling:  { icon: "🤼", name: "wrestling", from: /pit|guard|fort|watchman|mercenar/i, after: ["blamed", "jilted"], does: ["wrestled {o} in the mud", "threw {o} twice", "lost a match to {o}"] },
  dancing:    { icon: "💃", name: "dancing", from: /players|festival|market|tavern/i, after: ["wed", "feast"], does: ["danced by the fire", "danced with {o}", "taught {o} a reel"] },
  kites:      { icon: "🪁", name: "kite-making", from: /island|coast|hill|frontier/i, after: ["levelup"], does: ["flew a kite over the fields", "made {o} a kite", "lost a kite in a tree"] },
  bees:       { icon: "🐝", name: "beekeeping", from: /orchard|honey|monaster|garden/i, after: ["wed"], does: ["followed bees to a wild hive", "got stung", "brought {o} a comb of wild honey"] },
  puzzles:    { icon: "🧩", name: "puzzle boxes", from: /lock|hinge|seal|secret|circle/i, after: ["made"], does: ["built a puzzle box", "stumped {o} with a puzzle box", "opened an old box"] },
  swimming:   { icon: "🏊", name: "swimming", needs: "water", from: /river|dock|canal|island|shipwreck|coast/i, after: ["victory", "jilted"], does: ["swam the river", "raced {o} across the pond", "floated on their back a while"] },
  walking:    { icon: "🥾", name: "long walks", from: /road|pilgrim|wander|guide|travel/i, after: ["grief", "jilted", "blamed"], does: ["walked to the old oak", "walked the fields at dusk", "walked with {o}"] },
  herbs:      { icon: "🍵", name: "brewing teas", from: /herb|bark|apothecar|poultice|midwife/i, after: ["neardeath", "mended"], does: ["brewed a mint tea", "brewed {o} a tea for sleep", "dried nettles"] },
  sewing:     { icon: "🧵", name: "mending clothes", from: /bandage|stitch|wound|hospice/i, after: ["mended"], does: ["patched a cloak", "mended {o}'s shirt", "darned socks"] },
  cards:      { icon: "🃏", name: "cards", from: /bet|tax|merchant|account|contract/i, after: ["victory"], does: ["played cards with {o}", "beat {o} at cards", "lost to {o} at cards", "cheated at cards", "built a house of cards"] },
  toys:       { icon: "🧸", name: "toy-making", from: /orphan|aunt|sibling|grandparent/i, after: ["wed", "grief"], does: ["made a rag doll", "carved a top", "made {o} a wooden duck"] },
  shells:     { icon: "🐚", name: "collecting stones", from: /quarry|mine|salt|tidal|slate/i, after: ["grief"], does: ["found a striped stone", "sorted stones by color", "gave {o} a lucky stone"] },
  cooking:    { icon: "🍲", name: "cooking for friends", from: /stew|kitchen|cook|fed/i, after: ["feast", "wed"], does: ["made stew for {o}", "tried a new spice", "fed the stray dog"] },
  sparring:   { icon: "🤺", name: "sparring", from: /sword|levy|militia|fought|army/i, after: ["neardeath", "raided"], does: ["sparred with {o}", "practiced cuts at dawn", "oiled a blade"] },
  music:      { icon: "🥁", name: "drumming", from: /soldier|levy|players|camp/i, after: ["victory", "feast"], does: ["drummed on a barrel", "kept time for {o}", "made a drum"] },
};
const VENUES = {
  park: { for: ["walking", "birds", "gardening", "herbs", "bees", "kites", "stars", "painting"], does: ["walked the park with {o}", "napped under a tree in the park", "fed the ducks"] },
  playground: { for: ["toys"], does: ["played tag with {o}", "fixed the swing", "went down the slide, twice"] },
  fountain: { for: ["swimming", "shells"], does: ["sat by the fountain with {o}", "tossed a coin in the fountain", "dozed on the fountain bench"] },
  library: { for: ["reading", "binding", "learning", "poetry", "maps", "teaching"], does: ["read in the library", "fell asleep in the library", "read {o} a chapter"] },
  range: { steam: true, for: ["archery", "fletching"], does: ["shot at the butts till their arms ached", "outshot {o} at the range", "put three arrows in the red"] },
  axeyard: { steam: true, for: ["wrestling", "sparring"], does: ["threw axes till the anger went", "split the target, {o} cheering", "threw axes with {o}"] },
  chapel: { for: ["prayer", "candles"], does: ["prayed in the chapel", "lit a candle in the chapel", "sat in the chapel with {o}"] },
  bandstand: { for: ["singing", "lute", "dancing", "music"], does: ["played the bandstand", "danced with {o} by the bandstand", "sang on the bandstand till dark"] },
  workshop: { for: ["carving", "pottery", "statues", "tanning", "baskets", "embroidery", "sewing", "knitting"], does: ["made something in the workshop", "mended {o}'s {boots|chair|bucket} in the workshop", "worked late in the workshop"] },
  stables: { for: ["riding"], does: ["rode out and back", "brushed down the horses", "taught {o} to ride"] },
  alehouse: { for: ["dice", "cards", "checkers", "backgammon", "chess", "brewing", "tales", "puzzles", "cooking", "baking"], does: ["drank a quiet one at the alehouse", "beat {o} at the alehouse table", "told stories at the alehouse"] },
};
