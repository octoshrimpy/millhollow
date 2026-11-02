// Flavor text: every pool of names and prose variants. Logic that reads them lives in data.js, names.js, game.js and ui.js.


const NAMES = {
  f: [
    "Agatha", "Bridie", "Calla", "Dagny", "Freya", "Gerta", "Ilse", "Jorunn", "Lisbet",
    "Mira", "Orla", "Ottoline", "Quenna", "Rhoswen", "Sela", "Tamsin", "Thea", "Ulla",
    "Valla", "Verity", "Vesna", "Ysolde", "Zora", "Aldith", "Ailsa", "Brenna", "Edith",
    "Elswyth", "Eira", "Gwenna", "Hilde", "Ingrid", "Isolde", "Maude", "Morwen", "Nessa",
    "Rowena", "Sigrid", "Tilda", "Astrid", "Branwen", "Cerys", "Delia", "Elowen",
    "Gisela", "Hedda", "Ione", "Kerensa", "Lenna", "Mabyn", "Nia", "Oriel", "Petra",
    "Rhian", "Senna", "Tova", "Una", "Wilda", "Aveline", "Beatrix", "Cressida",
    "Emmeline", "Hester", "Imogen", "Liesel", "Marit", "Odile", "Runa", "Solveig", "Thora",

    // Additional
    "Adela", "Aderyn", "Alina", "Althea", "Amabel", "Anwen", "Ardis", "Arwen",
    "Asta", "Audra", "Bera", "Berit", "Blythe", "Bronwen", "Brynja", "Catrin",
    "Celia", "Clodagh", "Delyth", "Disa", "Dorothea", "Edda", "Eleri", "Elfrida",
    "Elspeth", "Enid", "Erla", "Estrid", "Eydis", "Ffion", "Frieda", "Gilda",
    "Githa", "Griselda", "Gudrun", "Halla", "Halwen", "Helga", "Hilda", "Ida",
    "Idunn", "Ismay", "Janna", "Keira", "Liora", "Lowri", "Maren", "Martha",
    "Melisende", "Meriel", "Morrigan", "Nerys", "Olwen", "Ragna", "Rhiannon",
    "Rosamund", "Sibyl", "Sigrun", "Sioned", "Sunniva", "Sybil", "Tegan", "Thyra",
    "Vigdis", "Willa", "Winifred", "Ylva", "Yvette", "Zelda"
  ],

  m: [
    "Anselm", "Bevan", "Brann", "Clement", "Corvin", "Dorn", "Elric", "Halvard",
    "Imre", "Jarl", "Kirwin", "Marek", "Merrick", "Norvel", "Nyle", "Odo", "Osric",
    "Piet", "Rafe", "Tomas", "Tovar", "Wendel", "Yannick", "Aldric", "Bertram",
    "Cadoc", "Dunstan", "Edwin", "Gareth", "Godric", "Hamond", "Ivor", "Leofric",
    "Madoc", "Oswin", "Ranulf", "Sigurd", "Torben", "Ulric", "Wystan", "Alaric",
    "Berin", "Cenric", "Duncan", "Emrys", "Gawain", "Harald", "Ingram", "Kenrick",
    "Lorcan", "Mathis", "Nils", "Oskar", "Roald", "Sten", "Tancred", "Wulfric",
    "Aled", "Bram", "Destan", "Egil", "Garrow", "Hob", "Lachlan", "Mungo", "Ned",
    "Perran", "Soren", "Wat",

    // Additional
    "Aelfric", "Alban", "Albin", "Alfred", "Alwin", "Ambrose", "Aric", "Arvid",
    "Asger", "Auberon", "Baldric", "Bastian", "Benedict", "Bjorn", "Borin",
    "Brandt", "Cedric", "Conall", "Cormac", "Darian", "Darragh", "Dieter", "Eamon",
    "Eirik", "Eldric", "Elias", "Esmond", "Everard", "Falk", "Ferdinand", "Fintan",
    "Florian", "Garrick", "Gideon", "Goran", "Hadrian", "Hakon", "Haldor", "Hector",
    "Henrik", "Heron", "Hrothgar", "Ilan", "Jasper", "Jorn", "Kasper", "Kieran",
    "Leander", "Lennart", "Lucan", "Magnus", "Malcolm", "Merrion", "Nestor",
    "Oberon", "Orson", "Oswald", "Padrig", "Ragnar", "Reynard", "Roderic",
    "Rurik", "Silas", "Sverre", "Thane", "Theodric", "Tristan", "Viggo", "Wilfred",
    "Wolfram"
  ],

  any: [
    "Adrel", "Alder", "Bellamy", "Cass", "Delwyn", "Edrie", "Fenn", "Harlow",
    "Hesper", "Hollis", "Kestrel", "Mabry", "Perrin", "Pike", "Rowan", "Sorrel",
    "Wren", "Wyn", "Finn", "Greer", "Jory", "Kell", "Linnet", "Rook", "Tamlin", "Wynne",

    // Additional
    "Aeron", "Ainsley", "Alwen", "Arden", "Ash", "Aster", "Aubrey", "Briar",
    "Bryn", "Caelan", "Celyn", "Cinder", "Dara", "Ellery", "Ember", "Ever",
    "Garnet", "Glen", "Hadley", "Hart", "Indigo", "Irie", "Jules", "Kit",
    "Larkin", "Linden", "Lior", "Lumi", "Marlowe", "Merrin", "Mica", "Morgan",
    "Neryn", "Oak", "Onyx", "Quill", "Reed", "Ren", "Riven", "Robin",
    "Sage", "Sable", "Shale", "Sparrow", "Taran", "Vale", "Vesper", "Winter",
    "Wynn", "Yarrow", "Zephyr"
  ]
};


const PET_NAMES = [
  // Original names
  "Biscuit", "Pepper", "Nettle", "Bramble", "Clover", "Moss",
  "Pip", "Dumpling", "Sorrel", "Juniper", "Tansy", "Button",
  "Mudge", "Pudding", "Rook", "Sprout", "Thimble", "Wren",
  "Hazel", "Barley", "Fennel", "Cobb", "Nutmeg", "Posy",
  "Tuppence", "Mabel", "Ember", "Gruff", "Sage", "Turnip",
  "Whistle", "Ash", "Crumb", "Dill", "Flint", "Marrow", "Olive", 
  "Pickle", "Stoat", "Winkle", "Thistle", "Cookie","Toot",

  // Food & treats
  "Muffin", "Toffee", "Truffle", "Waffle", "Custard",
  "Noodle", "Tater", "Honey", "Crumble",
  "Peaches", "Gingersnap", "Porridge", "Chutney", "Fig",
  "Bean", "Scone", "Butterscotch", "Plum", "Taffy",

  // Woodland & garden
  "Acorn", "Fern", "Briar", "Willow",
  "Dandelion", "Poppy", "Pebble", "Chestnut",
  "Basil", "Yarrow", "Maple", "Lichen",
  "Rue", "Bracken", "Mallow", "Sedge",

  // Small, silly & affectionate
  "Nib", "Nibbles", "Wiggle", "Tumble", "Bumble",
  "Puddle", "Twitch", "Pips", "Snuffle", "Wobble",
  "Tizzy", "Doodle", "Scamp", "Boggle", "Fidget",
  "Mopsy", "Tiddle", "Poppet", "Squidge", "Bumpkin",

  // Old-fashioned & storybook
  "Barnaby", "Hobnob", "Tibby", "Gubbins", "Wilbur",
  "Digby", "Bertie", "Fergus", "Hettie", "Puck",
  "Mimsy", "Boffin", "Nim", "Tilly", "Wicket",
  "Wimble", "Nod", "Bungo", "Dobby", "Tumblewick"
];


// Any line can hold {a|b|c}: each new person gets one of them, and braces can nest. A line is
// picked before its braces, so a line with many options is no likelier than one with none.
// Lines that game.js checks with pastHas, and the trade lines PAST_WAS renames old saves to, stay
// plain: those match on the exact text.
const PAST = {
  born: [
    "Born {in a fishing village|by a river crossing|in a market town|in a remote hamlet|in a tenement}.",
    "Born {on the frontier|on an island|in a forest village|during a hard winter|in a town that's gone now}.",
    "Born to {traders|millers|charcoal burners|shepherds|potters}.",
    "Born to {hunters|tinkers|a cooper and a brewer|the village reeve}.",
    "{Temple|monastery} orphan.",
    "Grew up {on a hill farm|on an orchard|among sheep|in a lumber camp|by a quarry}.",
    "Grew up {in a mining town|in a salt town|in a monastery|on the docks|in a merchant house}.",
    "Grew up {over a tavern|near an old battlefield|on the king's road|by a shrine|under a ruined castle}.",
    "Grew up with {{an aunt|grandparents|traveling players|an older sibling|an old soldier} in the city| in the mountains}.",
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

    guarding: [
      "Watched {a warehouse|a granary|a toll gate} by night.",
      "Guarded {a counting house|a merchant's cellar}.",
      "Walked the walls of a border town.",
      "Kept a lord's treasury.",
      "Turned thieves from a grain barn.",
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
    "Burned down {a library|a forge|a smokehouse|an infirmary|a farm|a church|the stables} {on purpose|by accident}.",
    "Fled {a wedding|debts}.",
    "Stole from a lord.",
    "{Drank|Gambled} away {theid family|a fortune}.",
    "Carried {the plague|a fever} into a {town|village}{ accidentally|}.",
    "Sold out a {friend|family member} to {the king|the mob|bandits|pirates}.",
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
    "Heard {there was work|the village needed hands|nobody asks questions here}.",
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

const PAST_VIOLENT = ["Pit fighter.", "Mercenary.", "Fought {bandits on the king's road|in someone else's feud}.",
  "Hunted highwaymen for bounty.", "Raided across the border.", "Carried a mace for a bishop.", "Cursed a man who wronged them.",
  "Looking for revenge.", PAST.bad[0]];

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

const FIRESIDE = ["told the old days by the fire", "talked about home by the fire", "told about life before the village",
  "told a story by the fire", "told how it was back then"];
const FIRESIDE_AGAIN = ["told it again", "told that story again", "told it again, longer"];
const WORDS = new Set("line corn stan wain bran alla mile tomat pieth bern hart lord ward flow tard hect".split(" "));
// Old-English-ish fragments and whole landscape words. Whole words can also stand alone ("Rook Cross").

const PLACE_HEAD = "ash brack thorn wil ald bram fen hol marl stan lang kes wyn wether elder sedge".split(" ");
const PLACE_WORD = "oak elm crow hart rush cold mill salt bell rook otter heron willow alder hazel moss flint chalk raven wren hawk barley ember frost mist apple cinder lark heath".split(" ");
// Tails like -ton, -ley, -field turned into surnames, so they read as people; these stay places.
const PLACE_TAIL = "wick thorpe mere holt stead dale combe wold moor by brook beck burn ness gate fold shaw hurst den garth mead hythe barrow hollow".split(" ");
const PLACE_APART = "Cross Hollow Green End Bridge Ford Rise Hythe Bottom".split(" ");
const PLACE_PRE = "Low High Old Nether Upper Little Great".split(" ");

const MUSE = ["Finish what you started.", "Don't let the day go to waste.", "I'm still here. Get on.", "Mind your hands, mind your heart.", "You're better at this than you think."];

const OMENS = {
  bandits: ["riders coming", "iron on the road", "boots at the gate before long"],
  pirates: ["lanterns on the water", "oars in the dark"],
  trader: ["wheels on the road", "a stranger with wares"],
  boon: ["luck is turning", "something kind is on its way"],
};

const GIFTS = { carving: "a carved bird", baskets: "a basket", pottery: "a bowl", knitting: "a scarf", baking: "a pie", brewing: "a jug of ale",
  embroidery: "a stitched kerchief", pressing: "pressed flowers", candles: "a candle", toys: "a wooden horse", bees: "a jar of honey",
  gardening: "a pot of herbs", fishing: "the best fish of the day", painting: "a little painting", poetry: "a poem", maps: "a map of the valley",
  tanning: "a leather pouch", fletching: "a fistful of arrows", sewing: "a mended coat", herbs: "a tea blend", statues: "a clay figure",
  smithing: "a new knife", binding: "a notebook", lute: "a song", singing: "a song", stars: "a name for a star", birds: "a feather", kites: "a kite" };

const TROUBLE_TITLE = { bandits: "Bandits!", pirates: "River pirates!", debt: "Debt collectors", fey: "Fey mood", feast: "Feast", wedding: "Wedding!", trader: "Trader",
  royal: "Royal party", refugees: "Runaways", defectors: "Deserters", wildfire: "Fire!" };

const PET_SENDOFF = ["fed it and sent it on its way", "shooed it back out", "said no, firmly"];
const PET_NO_ROOM = ["it wasn't for them", "it was no use to them", "they had no room for it"];
const PET_DEATH = ["passed away in their sleep", "slipped away quietly", "didn't wake up one morning"];
const PET_BURIAL = ["the hedge", "the old fence post", "a flat stone", "the apple tree"];
const GIFT_ANY = ["a warm loaf", "a cup of tea", "a handful of berries", "a smooth stone", "the last apple"];
const COURT = ["picked flowers for", "saved a seat for", "walked home with", "fixed a stool for"];
const KEEPSAKE_WEAPON = ["Lament", "Grief", "Due"];
const KEEPSAKE_ARMOR = ["Shroud", "Vigil", "Keepsake"];
