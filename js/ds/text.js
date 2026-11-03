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
  // Each entry is one equal-odds line; inside a multi-line group every line is an option.
  born: [
    `{Born|Grew up} {
      in a fishing village
      in a market town
      in a remote hamlet
      in a tenement
      in a forest village
      in a town that's gone now
      in a lumber camp
      in a mining town
      in a salt town
      in a monastery
      in a merchant house
      in a forest camp
      by a river crossing
      in a roadside inn
      in a coastal monastery
      in a manor kitchen
      in a guildhall
      in a monastery orphanage
      on the frontier
      on an island
      on a hill farm
      on an orchard
      over a tavern
      near an old battlefield
      on the king's road
      by a shrine
      under a ruined castle
    }.`,
    `Born {
      during a hard winter
      to {
        traders
        millers
        charcoal burners
        shepherds
        potters
        hunters
        tinkers
        a cooper and a brewer
        the village reeve
      }
    }.`,
    `Grew up {
      on the docks
      by a quarry
      with shepherds
      on a horse farm
      among ferrymen
      on a canal
      in the city
      in the mountains
      among {
        sheep
        cows
        goats
        geese
        thieves
      }
      with {
        an aunt
        grandparents
        traveling players
        an older sibling
        an old soldier
      }
    }.`,
  ],


  trade: {
    farming: [
      "Worked harvests {in the lowlands|for a local lord|from dawn till dusk|across three counties}.",
      "Worked {an apple orchard|a pear orchard|vineyards {up north|down south|along the coast}|a hop farm}.",
      "Plowed {stony fields|heavy clay|behind an ox|from first light}.",
      "Kept {sheep through lambing|goats on the hillside|pigs in the woods|cattle through winter}.",
      "Drove {cattle|sheep|pigs|geese} to {market|the autumn fair|a neighboring town}.",
      "Kept {geese and chickens|a small dairy herd|ducks by the pond|beehives beside the fields}.",
      "Drained {marshland|flooded fields|a boggy pasture} for {a landlord|a village|new farmland}.",
      "Threshed {wheat|barley|rye|oats} for hire.",
      "Ran {a landlord's fields|a manor farm|a tenant's holding|a small orchard}.",
      "Gathered {hay|straw|reeds} before the {rains|first frost|winter storms}.",
      "Mended {fences|stone walls|irrigation ditches|barn roofs} between harvests.",
      "Worked {the spring planting|the autumn harvest|a summer haymaking crew}.",
      "Raised {turnips|cabbages|beans|flax|hemp} on rented land.",
      "Dug {ditches|drainage channels|new garden beds} for {a farmer|a monastery|the village}.",
      "Spent {three summers|a winter|half a lifetime} tending {sheep|cattle|orchards|fields}.",
      "Helped bring in a harvest {before a storm|during a drought|after a hard winter}.",
      "Worked as a {shepherd|cowherd|plowhand|harvest hand|dairy worker}.",
      "Collected {eggs|milk|wool|honey} for {a manor|the village market|a traveling merchant}.",
      "Turned {rocky hillsides|abandoned fields|woodland clearings} into farmland.",
      "Managed {a granary|a seed store|a threshing floor|a village miller's grain}.",
    ],

    woodcutting: [
      "Felled {oak|pine|ash|elm} timber for {shipwrights|carpenters|a monastery|a noble's estate}.",
      "Cut {firewood for a monastery|beams for bridges|timber for a palisade|poles for scaffolding}.",
      "Worked {a charcoal camp|winter logging camps|a sawpit|a forest clearing}.",
      "Floated logs {downriver|through the marshes|to the coastal mills}.",
      "Squared {oak|pine|ash} timber for {carpenters|bridge builders|shipwrights}.",
      "Cleared forest for {farmland|a new road|a village expansion|a watchtower}.",
      "Split {roof shingles|fence rails|kindling|wooden stakes} for hire.",
      "Marked trees for {a forester|a landlord|a timber merchant}.",
      "Worked as a {woodcutter|sawyer|charcoal burner|forest laborer}.",
      "Cut timber through {a bitter winter|the rainy season|three summers}.",
      "Helped build {a timber bridge|a palisade|a barn frame|a wooden watchtower}.",
      "Gathered {fallen branches|deadwood|pine resin|bark} from the forest.",
      "Dragged logs with {oxen|horses|a team of laborers} to {a sawmill|the river|a timber yard}.",
      "Burned charcoal for {smiths|glassmakers|a foundry|a traveling merchant}.",
      "Worked a two-person saw {in a forest camp|beside a river|for a carpenter}.",
      "Cut {wagon axles|fence posts|roof beams|mill timbers} from seasoned wood.",
      "Spent a season {clearing stormfall|cutting coppice|harvesting timber|repairing forest roads}.",
      "Maintained {a woodland track|a logging camp|a timber raft|a charcoal kiln}.",
    ],

    quarrying: [
      "Cut {limestone|sandstone|granite|slate|marble} from the quarry face.",
      "Hauled {quarry rubble|stone for a cathedral|blocks for a fortress|slabs for a bridge}.",
      "Worked {a lime kiln|slate pits|a sandstone quarry|a hillside stoneworks}.",
      "Split {granite|limestone|sandstone|slate} with {wedges|chisels|hammers}.",
      "Cut {paving stones|millstones|foundation blocks|roofing slate|boundary markers}.",
      "Carved {gravestones|milestones|door lintels|stone troughs}.",
      "Opened a new quarry face {in the hills|beside the river|near an old ruin}.",
      "Dressed stone for {city walls|a bridge|a church|a manor house}.",
      "Worked as a {quarryman|stonecutter|mason's assistant|lime burner}.",
      "Hauled stone with {oxen|mules|wooden sledges|a team of laborers}.",
      "Cleared rubble after {a quarry collapse|a landslide|a failed excavation}.",
      "Worked {deep in a quarry|on a cliffside|in flooded stone pits} for {a summer|several years}.",
      "Cut steps into {a hillside|a cliff face|an old stone road}.",
      "Shaped {stone arches|window frames|doorways|foundation stones} for a mason.",
      "Burned limestone into lime for {mortar|plaster|whitewash}.",
      "Repaired {a collapsed quarry road|a broken stone bridge|a crumbling retaining wall}.",
      "Sorted {good building stone|damaged blocks|slate sheets|quarry waste}.",
      "Helped raise {a stone tower|a village wall|a chapel|a bridge pier}.",
    ],

    herbalism: [
      "Gathered {wild herbs|medicinal roots|rare flowers|healing plants} for {a healer|an apothecary|a monastery}.",
      "Picked {mushrooms for an apothecary|moss in the hills|berries along the forest edge|flowers from the marsh}.",
      "Stripped {willow|birch|oak} bark for {medicine|dyes|an herbalist}.",
      "Dried {roots and flowers|herbs in the rafters|mushrooms over a hearth|leaves for winter}.",
      "Kept {a healer's garden|a monastery herb garden|a patch of medicinal plants}.",
      "Sold {herbs|dried flowers|roots|mushrooms|tea blends} at market.",
      "Learned to recognize {poisonous berries|dangerous mushrooms|healing roots|rare wildflowers}.",
      "Made {poultices|salves|herbal teas|soothing balms|simple remedies}.",
      "Worked as {an herbalist's assistant|a forager|a healer's apprentice|a gatherer}.",
      "Collected {mint|sage|rosemary|lavender|chamomile} for {a healer|a cook|an apothecary}.",
      "Spent {a spring|an entire summer|three winters} gathering plants in {the hills|the marshes|the forest}.",
      "Traded {dried herbs|rare roots|flower seeds|medicinal bark} between villages.",
      "Tended {a greenhouse|a walled herb garden|a patch of healing flowers}.",
      "Helped prepare {winter remedies|healing salves|herbal baths|medicinal infusions}.",
      "Searched {marshes|mountain slopes|riverbanks|old forests} for {rare herbs|healing plants|unusual fungi}.",
      "Learned herbal lore from {a village healer|an old hermit|a traveling apothecary|a monastery gardener}.",
      "Gathered plants by {moonlight|the river|the edge of a bog|the old stone road}.",
      "Kept records of {harvest seasons|medicinal plants|poisonous herbs|rare flowers}.",
    ],

    smithing: [
      "Worked {a smithy's bellows|at a village forge|beside a master smith|in a busy ironworks}.",
      "Worked {in a foundry|for an armorer|at a horseshoe forge|for a traveling smith}.",
      "Made {nails|cooking pots|iron hinges|horseshoes|farm tools|door fittings}.",
      "Forged {miners' tools|wagon fittings|plowshares|iron hooks|axe heads|chisels}.",
      "Sharpened {scythes|axes|knives|sickles|plow blades} for {farmers|woodcutters|quarrymen}.",
      "Shoed {horses|mules|cart horses} for {a stable|a merchant|a noble's household}.",
      "Fixed {hinges|locks|wagon axles|broken tools|iron gates}.",
      "Worked as {a blacksmith's apprentice|a farrier|an armorer's assistant|a forge hand}.",
      "Repaired {armor|helmets|shields|chainmail|weapons} for {guards|mercenaries|a local lord}.",
      "Forged {iron nails|copper fittings|bronze buckles|steel blades} in {a village forge|a foundry|a roadside smithy}.",
      "Tended a forge through {a long winter|a busy harvest|a military campaign}.",
      "Cast {bells|cooking pots|simple ornaments|metal fittings} for {a monastery|a merchant|a manor}.",
      "Helped build {an iron gate|a mill mechanism|a wagon frame|a set of farming tools}.",
      "Worked {the hammer|the anvil|the bellows|the quenching trough} under {a master smith|an old armorer}.",
      "Collected {scrap iron|broken tools|old horseshoes} to rework at the forge.",
      "Made {chains|locks|keys|hinges|hooks} for {a merchant|a carpenter|a village guard}.",
      "Repaired {a broken plow|a damaged sword|a wagon wheel fitting|a cracked cooking pot}.",
      "Spent years learning to {forge blades|work iron|shape bronze|temper steel}.",
    ],

    healing: [
      "Learned to set {broken arms|broken legs|dislocated shoulders|fractured ribs}.",
      "Stitched {knife wounds|farm injuries|battle wounds|deep cuts}.",
      "Helped {a village midwife|an old physician|a monastery healer|a traveling surgeon}.",
      "Dressed wounds for {a barber-surgeon|a military camp|a hospice|a village healer}.",
      "Rolled bandages at {a hospice|an infirmary|a field hospital|a monastery}.",
      "Nursed {fever patients|sick children|wounded soldiers|elderly villagers}.",
      "Tended injured {quarrymen|woodcutters|farmhands|miners|soldiers}.",
      "Worked in {a monastery infirmary|a village sickhouse|a roadside hospice|a military infirmary}.",
      "Carried medicine between {villages|monasteries|army camps|isolated farms}.",
      "Trained under {an old physician|a midwife|a barber-surgeon|a monastery healer}.",
      "Worked as {a healer's apprentice|a nurse|a midwife's assistant|a field medic}.",
      "Helped deliver {twins|a difficult birth|a child during a storm|a child on the road}.",
      "Prepared {bandages|herbal washes|healing salves|splints|simple remedies}.",
      "Cared for the sick during {a harsh winter|a fever outbreak|a famine|a long siege}.",
      "Learned to recognize {infection|fever|poisoning|dehydration|dangerous wounds}.",
      "Travelled with {a military surgeon|a wandering healer|a group of pilgrims} tending the injured.",
      "Kept watch over {fever patients|wounded soldiers|the dying|a village infirmary} through the night.",
      "Helped establish {a village sickhouse|a small infirmary|a roadside hospice}.",
      "Treated {burns|broken bones|animal bites|deep cuts|infected wounds} with limited supplies.",
      "Spent years caring for {the elderly|the sick|injured workers|orphaned children}.",
    ],

    scholarship: [
      "Copied {books|religious texts|old chronicles|legal records} at a monastery.",
      "Copied {contracts|land deeds|merchant ledgers|letters|court records}.",
      "Kept {a merchant's accounts|a manor's records|a guild ledger|a monastery's books}.",
      "Taught {rich children|village children|young apprentices} their letters.",
      "Translated {old records|foreign letters|ancient inscriptions|merchant correspondence}.",
      "Worked as {a scribe|a clerk|a tutor|an archivist|a scholar's assistant}.",
      "Catalogued {a monastery library|a noble's books|a collection of old manuscripts}.",
      "Drew maps for {a surveyor|a merchant|a navigator|a local lord}.",
      "Recorded {taxes|court rulings|land disputes|property transfers} for {a magistrate|a lord|a town council}.",
      "Illuminated {manuscripts|religious texts|family histories|important charters}.",
      "Studied {astronomy|mathematics|history|languages|medicine|philosophy} under {a tutor|a monastery scholar|a wandering teacher}.",
      "Taught {reading|writing|arithmetic|bookkeeping} to {apprentices|merchants|children}.",
      "Maintained {a library|an archive|a collection of maps|a merchant's records}.",
      "Prepared {legal documents|marriage contracts|trade agreements|letters of introduction}.",
      "Recorded {births|deaths|marriages|harvests|market prices} for {a village|a church|a magistrate}.",
      "Copied rare texts by {candlelight|winter firelight|a monastery window}.",
      "Helped survey {farmland|roads|forest boundaries|river crossings}.",
      "Spent years studying {old languages|forgotten histories|the stars|herbal texts}.",
      "Worked as a clerk in {a guildhall|a courthouse|a merchant house|a monastery}.",
      "Organized {tax records|guild documents|land registers|old correspondence}.",
    ],

    cooking: [
      "Cooked {at an inn|on a riverboat|for a monastery|for a noble household|at a roadside tavern}.",
      "Worked {in a manor kitchen|in a brewery kitchen|for a butcher|at a busy inn}.",
      "Baked {bread|rye loaves|oatcakes|pastries} before dawn.",
      "Fed {quarry crews|woodcutters|farmhands|soldiers|traveling merchants}.",
      "Sold {pies|stews|sweet rolls|roasted chestnuts|bread} at market.",
      "Ran {a roadside stewpot|a village bakehouse|an inn's kitchen|a market food stall}.",
      "Worked as {a cook|a baker|a kitchen servant|a butcher's assistant|a pastry maker}.",
      "Prepared feasts for {a wedding|a harvest festival|a noble's banquet|a village celebration}.",
      "Learned to cook over {an open fire|a camp hearth|a ship's galley stove}.",
      "Made {cheese|butter|sausages|preserves|pickles} for {a farm|an inn|a merchant}.",
      "Baked {honey cakes|fruit tarts|rye bread|spiced biscuits} for {a market|a monastery|a noble family}.",
      "Helped run {a bakery|a butcher's shop|a tavern kitchen|a village smokehouse}.",
      "Cooked for travelers along {a mountain road|a river crossing|a busy trade route}.",
      "Prepared food during {a long winter|a military campaign|a famine|a village festival}.",
      "Preserved {fish|meat|fruit|vegetables} by {smoking|salting|drying|pickling}.",
      "Worked long nights feeding {a caravan|a hunting party|a group of pilgrims|a military camp}.",
      "Learned recipes from {a traveling cook|a monastery kitchen|a grand household}.",
      "Managed {an inn's pantry|a manor's food stores|a monastery kitchen|a bakehouse}.",
    ],

    guarding: [
      "Watched {a warehouse|a granary|a toll gate|a bridge|a village entrance} by night.",
      "Guarded {a counting house|a merchant's cellar|a noble's treasury|a caravan's supplies}.",
      "Walked the walls of {a border town|a fortress|a walled city|a coastal keep}.",
      "Kept watch over {a lord's treasury|a merchant's goods|a village granary|a monastery's stores}.",
      "Turned thieves from {a grain barn|a market stall|a merchant's wagon|a noble estate}.",
      "Worked as {a night watchman|a caravan guard|a gatekeeper|a town guard|a sentry}.",
      "Escorted {merchants|pilgrims|tax collectors|nobles} through {dangerous roads|the forest|a mountain pass}.",
      "Patrolled {the city walls|a village boundary|a harbor|a trade road}.",
      "Guarded {a bridge|a ford|a mountain pass|a toll road} for {a lord|a town council|a merchant guild}.",
      "Kept watch through {a bitter winter|a long siege|a season of bandit raids}.",
      "Served in {a town watch|a lord's household guard|a merchant escort|a border garrison}.",
      "Protected {a caravan|a grain shipment|a group of travelers|a tax wagon} from {bandits|wild animals|raiders}.",
      "Worked the night shift at {a city gate|a warehouse|a harbor watchtower|a noble estate}.",
      "Helped defend {a village|a bridge|a market town|a mountain outpost} during {a raid|a siege|a border dispute}.",
      "Trained recruits in {spear drills|shield work|watch duties|patrol routes}.",
      "Carried messages between {watchtowers|guard posts|border forts|patrols}.",
      "Investigated {thefts|missing livestock|strange lights|unexplained noises} while on watch.",
      "Maintained {watchfires|signal horns|guard equipment|a town's defenses}.",
    ],

    fishing: [
      "Mended {fishing nets|river traps|boat sails|lobster pots}.",
      "Crewed {a riverboat|a merchant ship|a fishing vessel|a coastal skiff}.",
      "Set {eel traps|fish weirs|river nets|crab pots} in {the marsh|the river|tidal pools}.",
      "Gutted {fish|herring|trout|salmon} at {the docks|a smokehouse|the market}.",
      "Fished {the coast in winter|the river at dawn|the deep lake|the tidal flats}.",
      "Dug bait on {the tidal flats|muddy riverbanks|the beach}.",
      "Built {fish traps|eel baskets|net frames|small fishing boats}.",
      "Smoked {herring|trout|salmon|river fish} for market.",
      "Worked as {a fisherman|a net maker|a boat hand|a fishmonger|a dock laborer}.",
      "Sailed with {a fishing crew|a coastal trader|a river merchant|a harbor pilot}.",
      "Caught {eels|trout|perch|herring|salmon} for {an inn|a monastery|the village market}.",
      "Maintained {a fishing boat|a river dock|a fish weir|a coastal smokehouse}.",
      "Spent {a winter|three summers|half a lifetime} fishing {the river|the coast|the marshes}.",
      "Helped haul {fishing nets|heavy anchors|boats onto shore|cargo from river barges}.",
      "Collected {shellfish|river mussels|crabs|oysters} from {tidal pools|mudflats|rocky shores}.",
      "Salted {fish|herring|cod|river catch} for {winter stores|a merchant|long voyages}.",
      "Navigated {shallow rivers|tidal channels|dangerous reefs|foggy harbors}.",
      "Worked the docks during {the spring catch|the herring season|the autumn storms}.",
      "Taught young fishers to {mend nets|read tides|set traps|handle a boat}.",
      "Traded fresh fish between {river villages|coastal towns|inland markets}.",
    ],
  },



  cls: {
    warrior: [
      "Spent {one|two|three} winters at {a border fort|a mountain garrison|a coastal keep}.",
      "Fought in {a fighting pit|underground tournaments|a noble's arena} for {coin|food|freedom}.",
      "Guarded caravans through {bandit country|the mountains|a border war|the old forest}.",
      "Worked as {a mercenary|a caravan guard|a town watchman|a hired sword}.",
      "Served in {a town watch|a lord's household guard|a border garrison|a merchant's private guard}.",
      "Guarded {a counting house|prisoners|a bridge for three years|pilgrims|a noble's treasury}.",
      "Fought {bandits on the king's road|in someone else's feud|in a border skirmish|beside a foreign army}.",
      "Served {in a lord's levy|on an armed merchant ship|under a disgraced captain|in a mercenary company}.",
      "Escorted {tax collectors|merchants|pilgrims|a noble family} through {dangerous roads|the marshes|the highlands}.",
      "Survived {a siege|an ambush|a disastrous battle|a winter campaign}.",
      "Drilled {militia|new recruits|village guards|a noble's household soldiers}.",
      "Hunted {highwaymen|deserters|bandits|outlaws} for bounty.",
      "Served as household guard to {a noble|a merchant prince|a magistrate|a wealthy landowner}.",
      "Deserted {an army|a mercenary company|a border garrison} after {a lost battle|a cruel order|a winter of fighting}.",
      "Won {a sword|a shield|a suit of armor|a horse} in {a tavern bet|a tournament|a duel}.",
      "Lost {a friend|a commander|an entire patrol} in {a skirmish|an ambush|a siege}.",
      "Learned to fight with {a sword|a spear|an axe|a mace|a shield} from {an old soldier|a veteran mercenary|a village guard}.",
      "Spent a season protecting {a bridge|a granary|a mountain pass|a river crossing}.",
      "Helped defend {a village|a castle|a merchant caravan|a border town} from {raiders|bandits|a siege}.",
      "Carried {a banner|messages|supplies|wounded soldiers} across a battlefield.",
      "Fought in {three duels|a tournament|a border war|a village feud} and {won|barely survived|lost everything}.",
      "Was wounded defending {a stranger|a lord|a merchant|a fellow soldier}.",
      "Served under {a famous captain|a cruel commander|a noble's son|an aging knight}.",
      "Trained with {a retired knight|a master-at-arms|a company of mercenaries|a monastery guard}.",
      "Spent years {patrolling roads|guarding walls|escorting travelers|fighting for pay}.",
      "Was hired to protect {a wedding|a funeral procession|a treasure wagon|a diplomatic envoy}.",
      "Took part in {a failed rebellion|a border raid|a noble's private war|a siege}.",
      "Left the sword behind after {a terrible battle|losing a friend|refusing an order|a near-fatal wound}.",
      "Carried {a broken sword|a dented shield|a fallen comrade's weapon} for years.",
      "Once held {a gate|a bridge|a narrow pass|a watchtower} against overwhelming odds."
    ],

    ranger: [
      "Hunted {for a lord|wolves for bounty|a man-eater|boar in the royal forest}.",
      "Tracked {poachers|a lost child for six days|smugglers through the marshes|bandits through winter snow}.",
      "Guided {travelers over the mountains|caravans through deep forest|pilgrims through a dangerous pass}.",
      "Worked as {a forester|a scout in a border war|a gamekeeper|a wilderness guide|a trapper}.",
      "Raided across {the border|a mountain pass|the river} with {scouts|a lord's men|a band of outlaws}.",
      "Knew {every ford on the river|the old roads|the hidden forest paths|the mountain passes}.",
      "Lived {a year|three winters|an entire season} alone in {the hills|a forest cabin|the mountains}.",
      "Mapped {old trails|forgotten roads|mountain passes|hidden valleys}.",
      "Patrolled {a lord's hunting grounds|a forest boundary|a remote border|the king's woodland}.",
      "Trapped {foxes|rabbits|wolves|beavers} for {three winters|a traveling merchant|a fur trader}.",
      "Kept {wolves|boars|wild dogs|bears} away from {the flocks|a village|travelers}.",
      "Rarely slept indoors during {a summer|a long journey|three winters}.",
      "Ran messages through {bandit country|the mountains|enemy territory|a war-torn forest}.",
      "Searched {a season|three weeks|an entire winter} for {a lost expedition|a missing child|a vanished caravan}.",
      "Learned to read {animal tracks|weather signs|broken branches|bird calls} from {an old hunter|a forester|a hermit}.",
      "Spent years living off {the forest|the mountains|the marshes|the northern plains}.",
      "Tracked {a wounded deer|a dangerous predator|a fugitive|a missing traveler} for {days|weeks|half a season}.",
      "Guided a party through {a blizzard|a flooded forest|a mountain storm|an unfamiliar wilderness}.",
      "Built shelters from {fallen branches|stone and moss|pine boughs|whatever the forest offered}.",
      "Worked as a scout for {a merchant caravan|a noble's army|a border patrol|a group of explorers}.",
      "Knew where to find {fresh water|safe crossings|rare herbs|game trails} in {the hills|the marshes|the forest}.",
      "Watched over {a remote village|a mountain trail|a forest shrine|an abandoned road}.",
      "Followed {an old map|a rumor|animal tracks|a strange trail} into {the mountains|the deep forest|the marshes}.",
      "Taught {hunters|children|travelers|young scouts} how to {track game|read the weather|navigate by stars}.",
      "Spent a winter guarding {a mountain pass|a forest road|a logging camp|a hunting lodge}.",
      "Escaped {a forest fire|a wolf pack|a bandit ambush|a collapsing mountain path}.",
      "Discovered {an abandoned village|a hidden spring|an old watchtower|a forgotten trail} while traveling alone.",
      "Collected {rare feathers|animal bones|unusual stones|old trail markers} from distant places.",
      "Once followed a trail that {vanished at a river|ended at an old grave|led to a ruined shrine|circled back to their own camp}.",
      "Spent {months|years|an entire winter} searching for {a legendary beast|a lost valley|a missing companion|a hidden mountain pass}."
    ],

    mystic: [
      "Learned {from a hedge-witch|charms from a wandering mystic|magic from a teacher who vanished|from spirits|from a forbidden manuscript}.",
      "Studied {banned books|ruins nobody else would enter|forgotten rituals|ancient inscriptions}.",
      "Dreamed {things before they happened|of places they had never seen|of a stranger who later appeared}.",
      "Failed out of {an academy|a secret school|a circle of scholars} for {recklessness|disobedience|asking dangerous questions}.",
      "Assisted {an astrologer|an alchemist|a traveling seer|a court magician}.",
      "Read {a spell|a book|a prophecy|a forbidden inscription} their master had forbidden.",
      "Spent {a winter|three years|a decade} studying {an unknown language|a single spell|an ancient text}.",
      "Joined {a secret circle of scholars|a hidden order|a society of astrologers|a wandering group of mystics}.",
      "Broke {a seal|a ward|an ancient charm|a sacred boundary} they should have left alone.",
      "Lifted {curses|hexes|strange afflictions|unwanted enchantments} for pay.",
      "Collected {scraps of old spellbooks|forgotten charms|strange stones|fragments of ancient tablets}.",
      "Survived {a ritual|an experiment|a summoning|a magical accident} that killed {their teacher|a fellow apprentice|everyone else present}.",
      "Saw {something impossible|a stranger's face|the future|their own death} in {a mirror|a pool of water|a crystal|a dream}.",
      "Hid {their talent|a dangerous gift|a magical secret} for years.",
      "Caused {an accident|a strange illness|a fire|a magical disturbance} they still cannot explain.",
      "Cursed {a man who wronged them|a thief|a cruel noble|an old rival} and later regretted it.",
      "Spent nights listening to {whispers in the walls|voices in the wind|the stars|an unseen presence}.",
      "Learned to draw {protective circles|runes|sigils|ancient symbols} from {a wandering scholar|a hidden book|an old witch}.",
      "Studied under {a blind seer|a disgraced magician|a mysterious hermit|an alchemist}.",
      "Kept {a strange stone|an old charm|a sealed letter|a mysterious key} for years without understanding it.",
      "Followed {a recurring dream|a prophecy|an omen|a strange constellation} to {an abandoned shrine|a forgotten ruin|a distant village}.",
      "Worked as {a fortune teller|an alchemist's assistant|a charm seller|a court astrologer}.",
      "Spent a season attempting to {speak with spirits|read forgotten runes|master a forbidden spell|understand a strange artifact}.",
      "Was accused of {witchcraft|summoning spirits|cursing a harvest|causing a storm}.",
      "Taught themselves magic from {a damaged spellbook|half-remembered lessons|old inscriptions|a dead magician's notes}.",
      "Once heard {their name|a warning|a prophecy|a familiar voice} spoken by {an empty room|a dead tree|a mirror|a falling star}.",
      "Lost {their memory|their voice|their shadow|their sense of time} after {a ritual|a magical accident|an encounter with something unknown}.",
      "Discovered {a forgotten spell|a sealed chamber|an ancient ward|a hidden library} beneath {a ruined tower|an old monastery|a forest shrine}.",
      "Was forbidden to return to {an academy|a wizard's tower|a circle of scholars|a sacred ruin}.",
      "Believes {a dream|an omen|an old prophecy|a voice in the dark} has been guiding them for years."
    ],

    cleric: [
      "Nursed the sick through {a plague|a fever outbreak|a harsh winter|a famine}.",
      "Left {a holy order|a monastery|a temple|the priesthood} after {a disagreement|a fight with a bishop|a crisis of faith|a terrible discovery}.",
      "Served {at a roadside shrine|as chaplain to soldiers|in a monastery|at a remote temple}.",
      "Buried {a village after a fever|soldiers after a battle|victims of a flood|the dead after a siege}.",
      "Walked {a year|three summers|a winter} with {pilgrims|wandering monks|a traveling preacher}.",
      "Sat with {the dying|the sick|the grieving|the condemned} through the night.",
      "Copied {sermons|holy texts|prayers|old teachings} at {a monastery|a temple|a chapel}.",
      "Cooked in {a temple kitchen|a monastery|a roadside hospice|a charity kitchen}.",
      "Carried {relics|holy books|sacred water|offerings} between {shrines|temples|monasteries}.",
      "Took {holy orders|a vow of silence|a vow of poverty|a sacred oath} and {regretted it|kept it faithfully|eventually broke it}.",
      "Kept {a country chapel|a roadside shrine|a remote temple|a small monastery}.",
      "Tended {a graveyard|a monastery garden|a sacred grove|a holy spring}.",
      "Preached in {mining camps|remote villages|border towns|military camps}.",
      "Rebuilt {a burned temple|a ruined chapel|a neglected shrine|a monastery after a siege}.",
      "Fed {the poor|hungry travelers|orphans|refugees} during {a famine|a harsh winter|a time of war}.",
      "Guarded {a holy spring|a sacred relic|an ancient shrine|a forgotten tomb}.",
      "Carried {a mace|a staff|a holy banner|a relic} for {a bishop|a traveling priest|a temple guard}.",
      "Helped establish {a hospice|a village shrine|a monastery school|a refuge for travelers}.",
      "Spent years caring for {orphans|the elderly|the sick|pilgrims}.",
      "Learned {healing prayers|old hymns|sacred rites|burial customs} from {an old priest|a wandering monk|a temple elder}.",
      "Led {funeral rites|harvest blessings|wedding ceremonies|prayers for travelers} in {a village|a remote chapel|a border town}.",
      "Served as spiritual guide to {soldiers|pilgrims|miners|a noble household}.",
      "Walked barefoot to {a distant shrine|a holy mountain|an ancient temple|a sacred spring} as penance.",
      "Spent a winter tending {a dying priest|a sick village|a ruined sanctuary|a forgotten graveyard}.",
      "Lost faith after {a plague|a battle|a personal tragedy|a failed miracle}, but continued serving others.",
      "Was sent to {a remote monastery|a border chapel|a ruined shrine|an isolated village} as punishment.",
      "Collected {donations|food|clothing|medicine} for {the poor|a hospice|an orphanage|a struggling village}.",
      "Once claimed to witness {a miracle|a vision|a divine sign|an impossible healing}.",
      "Helped reconcile {two feuding families|a village dispute|a broken marriage|a quarrel between priests}.",
      "Spent years searching for {a lost relic|a forgotten prayer|an abandoned shrine|a holy text}."
    ],
  },



  bad: [
    // Original
    "Burned down {a library|a forge|a smokehouse|an infirmary|a farm|a church|the stables} {on purpose|by accident}.",
    "Fled {a wedding|debts}.",
    "Stole from a lord.",
    "{Drank|Gambled} away {their family's savings|a fortune|an inheritance|the rent money}.",
    "Carried {the plague|a fever} into a {town|village}{ accidentally|}.",
    "Sold out a {friend|family member} to {the king|the mob|bandits|pirates}.",

    // Crimes and misdeeds
    "Stole {a horse|a family heirloom|the village treasury|a sacred relic|a cart full of grain} from {a neighbor|a noble|a merchant|a monastery}.",
    "Was caught {poaching|smuggling|counterfeiting coins|cheating at cards|selling stolen goods}.",
    "Robbed {a traveling merchant|a pilgrim|a tax collector|a wounded soldier|their own family}.",
    "Forged {a royal decree|a will|a marriage certificate|a deed|a letter of pardon}.",
    "Sold {watered-down ale|spoiled grain|fake medicine|stolen livestock|counterfeit jewelry}.",
    "Bribed {a guard|a magistrate|a priest|a tax collector|a witness}.",
    "Helped {bandits|pirates|smugglers|deserters} escape {capture|prison|the gallows}.",
    "Was banished for {theft|fraud|grave robbing|arson|treason|a crime they refuse to name}.",
    "Kept {a stolen crown|a dead person's ring|a bag of blood money|a forged seal|a wanted criminal} hidden for years.",
    "Betrayed {a guild|a village|a commander|a sworn oath|a childhood friend} for {gold|love|revenge|a promise of safety}.",

    // Betrayal and broken trust
    "Abandoned {a friend|a sibling|a lover|their family|a wounded companion} when they were needed most.",
    "Broke a promise to {their mother|their closest friend|a dying stranger|their child|the village elder}.",
    "Left {a friend|a stranger|a fellow traveler|a soldier} behind during {a fire|a flood|a raid|a bitter winter}.",
    "Blamed {a sibling|a friend|an apprentice|an innocent stranger} for {a theft|a fire|a terrible mistake|a death}.",
    "Revealed {a family secret|a hidden refuge|a secret passage|a friend's hiding place} to {an enemy|the authorities|a rival|a stranger}.",
    "Took credit for {a friend's invention|a stranger's bravery|an apprentice's work|a sibling's sacrifice}.",
    "Married {for money|under a false name|someone they did not love|to escape a debt}.",
    "Left someone waiting at {the altar|the village gate|the harbor|a secret meeting place} and never returned.",
    "Promised {marriage|protection|freedom|a fortune} to someone and never intended to deliver.",
    "Turned away {a hungry child|a wounded traveler|an old friend|a desperate family} in their hour of need.",

    // Tragedies and terrible mistakes
    "Started {a forest fire|a village fire|a feud|a riot|a panic} through {carelessness|pride|anger|curiosity}.",
    "Forgot to {lock the gate|put out the fire|feed the animals|warn the village|deliver a message} when it mattered most.",
    "Lost {a child|a friend|a sibling|an entire caravan} while leading them through {the woods|a mountain pass|a storm|dangerous territory}.",
    "Gave {the wrong medicine|bad directions|a false warning|poor advice} with terrible consequences.",
    "Watched {a friend|a stranger|a neighbor|a sibling} suffer and did nothing.",
    "Mistook {an ally|a friend|an innocent traveler} for an enemy during {a battle|a raid|a night patrol}.",
    "Allowed {a bridge|a dam|a mine|a watchtower|a ship} to collapse after ignoring warnings.",
    "Lost {the harvest|the village livestock|the winter stores|a family's home} through {neglect|recklessness|a foolish gamble}.",
    "Led {a patrol|a caravan|a hunting party|a group of refugees} into an ambush.",
    "Kept silent about {a spreading sickness|a dangerous road|a poisoned well|a coming raid} until it was too late.",

    // Secrets and questionable pasts
    "Lived for years under {a stolen name|a false identity|someone else's title|a dead person's name}.",
    "Once served {a cruel lord|a bandit chief|a pirate captain|a corrupt magistrate}.",
    "Was once {a spy|an informer|a deserter|a smuggler|a grave robber|a mercenary}.",
    "Disappeared for {three days|a month|seven years|an entire winter} and refuses to explain why.",
    "Buried {a chest of stolen coins|a weapon|a forbidden book|a body|a terrible secret} beneath {an old oak|the village well|a ruined chapel|their childhood home}.",
    "Knows who really {started the fire|stole the relic|betrayed the village|killed the magistrate} but has never spoken.",
    "Made a bargain with {a witch|a stranger|a noble|a criminal|someone they should have feared}.",
    "Once belonged to {a secret society|a forbidden cult|a thieves' guild|a disgraced noble house}.",
    "Carries {a stolen signet ring|a bloodstained letter|a false pardon|a key to a forgotten prison}.",
    "Has been running from {a debt|a promise|a crime|a family|an old enemy} for years.",

    // Personal failings
    "Ruined a friendship over {a handful of coins|a petty insult|a misunderstanding|jealousy|pride}.",
    "Spent {their family's savings|an inheritance|the village funds} on {gambling|drink|a foolish scheme|a doomed expedition}.",
    "Refused to apologize for {a cruel remark|a betrayal|a terrible mistake|an old injustice}.",
    "Destroyed {a letter|a portrait|a family heirloom|a treasured keepsake} in a fit of anger.",
    "Let {envy|greed|fear|pride|cowardice} cost someone {their livelihood|their home|their reputation|their life}.",
    "Spread a rumor that ruined {a marriage|a friendship|a career|an innocent person's reputation}.",
    "Cheated {a friend|a sibling|a stranger|a business partner} out of {an inheritance|a fair wage|a valuable discovery}.",
    "Used {a friend's secret|a family tragedy|a stranger's misfortune} for personal gain.",
    "Refused to share {food|medicine|shelter|water|supplies} during {a famine|a plague|a harsh winter|a siege}.",
    "Chose {wealth|status|revenge|comfort|safety} over someone they loved.",

    // Strange, petty, and darkly humorous
    "Was exiled for {insulting a duke|stealing the mayor's trousers|starting a tavern brawl|releasing the royal pigs}.",
    "Accidentally {poisoned a feast|burned a barn|flooded a cellar|destroyed a wedding cake}.",
    "Challenged {a knight|a noble|a priest|a passing stranger} to a duel and immediately fled.",
    "Sold {a fake treasure map|a cursed-looking rock|a worthless relic|someone else's cow} as something valuable.",
    "Convinced an entire village that {the well was haunted|the moon was falling|their mayor was a witch|winter had been canceled}.",
    "Started a feud over {a stolen chicken|a broken fence|a missing spoon|a badly baked pie|a disputed apple tree}.",
    "Stole {the church bell|a noble's wig|a merchant's boots|a wedding ring} on a dare.",
    "Was forbidden from entering {a tavern|a monastery|a market|an entire village} after {one too many fights|a disastrous prank|an unfortunate misunderstanding}.",
    "Lost a bet involving {a goat|a barrel of ale|a noble's daughter|a sacred statue|an entire orchard}.",
    "Once tried to sell {rainwater|moonlight|a bridge they didn't own|the same horse twice}."
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


const FIRESIDE = [
  "told {stories of the old days|about the old days|how things used to be} by the fire",
  "talked about {home|their childhood|the place they grew up} by the fire",
  "told about life before {the village|the journey|they settled here}",
  "told {a story|an old tale|a half-forgotten legend} by the fire",
  "told how it was {back then|in the old days|before everything changed}",
  "recalled {a childhood adventure|an old friend|a long-ago summer|a winter they barely survived}",
  "spoke of {the village they left behind|a home they still miss|the roads that brought them here}",
  "shared {a memory|a tale|an old family story} from {their childhood|years ago|another life}",
  "remembered {an old festival|a family gathering|a harvest long ago|a friend they lost}",
  "told of {a strange traveler|a foolish bet|a narrow escape|an unexpected kindness}",
  "spoke about {their first job|their old trade|a former master|the work they once did}",
  "recounted {a long journey|a terrible storm|a difficult winter|a lucky escape}",
  "told a story about {a mischievous goat|a stubborn mule|a clever fox|a very unfortunate chicken}",
  "remembered {the first snowfall|a particularly good harvest|a summer that seemed endless}",
  "shared a tale of {love|loss|friendship|betrayal|unexpected good fortune}",
  "spoke quietly about {someone they missed|a promise they made|a mistake they regretted}",
  "told how they once {got lost in the woods|met a noble|escaped a flood|won a ridiculous wager}",
  "described {a distant town|an old forest|a mountain village|a place nobody else had seen}",
  "spoke fondly of {an old friend|a beloved teacher|a childhood pet|their first home}",
  "recalled {a wedding|a funeral|a festival|a feast} from long ago",
  "told of {a rumor that proved true|a warning nobody believed|a mystery never solved}",
  "remembered {a kindness they received|a stranger who helped them|a debt they never repaid}",
  "spoke about {the best meal they ever ate|the worst winter they endured|the strangest person they met}",
  "shared {an embarrassing memory|a family secret|a harmless confession|a story they rarely told}",
  "recounted {a village feud|a tavern brawl|a market-day disaster|a poorly planned celebration}",
  "remembered {the smell of their old home|the sound of a familiar voice|a song from childhood}",
  "told of {a road that vanished|a ruined tower|an abandoned village|an old bridge} they once visited",
  "spoke of {their parents|their siblings|the people who raised them|someone who taught them kindness}",
  "recalled {a chance meeting|an unlikely friendship|an old rivalry|a promise kept}",
  "told a tale they learned from {their grandmother|a traveling merchant|an old soldier|a village elder}",
  "remembered {a childhood game|a favorite hiding place|a long-forgotten nickname|a treasured toy}",
  "spoke of {a time they were brave|a time they were foolish|a time they were terribly afraid}",
  "recounted {an encounter with wolves|a night lost in the hills|a dangerous river crossing|a storm at sea}",
  "told everyone about {their finest harvest|their greatest catch|their best bargain|their worst mistake}",
  "shared {a ghost story|a strange dream|a local superstition|an old warning} by the fire",
  "remembered {a friend who moved away|a neighbor they once knew|a teacher they admired}",
  "spoke of {a distant kingdom|a forgotten road|an old battlefield|a town swallowed by the forest}",
  "told how {their family came to the village|they learned their trade|they met an old friend}",
  "recalled {a night of celebration|a day of mourning|a long-awaited reunion|an unexpected farewell}",
  "told a story that made everyone {laugh|fall silent|shake their heads|lean closer}",
  "shared {an old saying|a family proverb|a bit of hard-earned wisdom|advice they once ignored}",
  "remembered {the first person who welcomed them|their first night here|the day they decided to stay}",
  "told about {a place they hoped to return to|a road they never finished traveling|a dream they once had}",
  "spoke of {a lost love|an old rival|a childhood companion|someone they never forgot}",
  "recounted {a funny misunderstanding|an unfortunate accident|a prank gone wrong|a very stubborn argument}",
  "told everyone how {things used to be|the village once looked|the roads were safer|winters were colder}",
  "shared {a quiet memory|a bittersweet story|a small triumph|a hard lesson} from years ago",
  "spoke of {a fire much like this one|a night under unfamiliar stars|a journey without a map}",
  "told {a tale worth remembering|a story they'd kept to themselves|a memory they thought they'd forgotten}"
];

const FIRESIDE_AGAIN = [
  "told it again",
  "told that story again",
  "told it again, {longer|with more detail|with added excitement|from the beginning}",
  "retold the tale with {new details|greater enthusiasm|a slightly different ending}",
  "told it again, as though {nobody had heard it|it had happened yesterday|it was the first time}",
  "repeated the story {word for word|with considerable embellishment|with dramatic pauses}",
  "insisted on telling {the whole thing|the best part|the ending} again",
  "started the story over {before anyone could object|with a knowing smile|after another sip}",
  "told the same tale, but {changed the ending|added a character|made themselves braver}",
  "recounted it again, {this time with gestures|slower than before|with even more conviction}",
  "told it again to {anyone willing to listen|the nearest person|a rather captive audience}",
  "repeated the story, {forgetting they'd already told it|pretending it was new|ignoring the groans}",
  "returned to their favorite story {once more|yet again|for reasons nobody understood}",
  "retold the tale with {a new beginning|an unlikely twist|a suspicious number of details}",
  "told it again, {laughing at their own jokes|pausing for dramatic effect|waiting for the usual reaction}",
  "repeated the best part {twice|three times|until someone laughed}",
  "told the story again, {shorter this time|somehow longer|almost exactly the same}",
  "started telling it again, {despite knowing smiles|to everyone's amusement|before supper was finished}",
  "told it once more, {swearing every word was true|insisting it happened exactly that way}",
  "retold the story, {adding a little mystery|leaving out the embarrassing part|improving their own role}",
  "recounted it again, {to a new listener|as if it were fresh news|with renewed excitement}",
  "told the tale again, though {everyone knew the ending|nobody had asked|the fire was burning low}",
  "repeated the story until {someone finished it for them|the others joined in|the laughter returned}",
  "told it again, and {laughed just as hard|grew quiet at the ending|forgot how it ended}",
  "began the familiar tale with {a grin|a sigh|a very serious expression|a warning not to interrupt}",
  "repeated an old story {they clearly loved|nobody quite believed|everyone secretly enjoyed}",
  "told it again, {getting the names wrong|mixing up the dates|changing the weather entirely}",
  "returned to the same memory, {smiling to themselves|staring into the flames|speaking more softly}",
  "told the story again, and {someone groaned|someone corrected them|someone asked for more}",
  "retold the tale, {making the fish bigger|making the journey longer|making the danger worse}",
  "insisted they'd never told this story before",
  "told it again, {just for the newcomers|because someone missed the ending|because it was worth telling}",
  "began with {the same old words|the familiar opening|a much-practiced sigh}",
  "told it again, and {this time everyone listened|this time nobody interrupted|this time they got it right}",
  "repeated the tale until {the stars came out|the fire burned low|everyone knew it by heart}"
];


const WORDS = [
  "line", "corn", "stan", "wain", "bran", "alla", "mile",
  "tomat", "pieth", "bern", "hart", "lord", "ward", "flow",
  "tard", "hect",

  "ald", "bryn", "cairn", "dun", "eld", "fen", "glen",
  "holm", "keld", "mere", "morn", "rath", "rowan",
  "sel", "thorn", "wold", "wych", "yew", "bracken",
  "hollow", "barrow", "hearth", "croft", "moss",
  "fallow", "harrow", "gorse", "tarn", "fell",
  "quill", "briar", "sedge", "tallow", "burrow",
  "morrow", "willow", "harth", "sallow", "weald"
];

// Prefix fragments for compound place names.
const PLACE_HEAD = [
  "ash", "brack", "thorn", "wil", "ald", "bram", "fen",
  "hol", "marl", "stan", "lang", "kes", "wyn", "wether",
  "elder", "sedge",

  "bryn", "cairn", "carr", "dun", "elm", "fallow", "farn",
  "glen", "gorse", "grims", "har", "harth", "haz",
  "heath", "hel", "holl", "keld", "lark", "low",
  "marsh", "mor", "moss", "neth", "nor", "oak",
  "os", "rath", "rav", "red", "row", "sallow",
  "sel", "sharn", "stow", "tarn", "toll",
  "war", "west", "whit", "wol", "wych", "yew"
];

// Complete words that can appear alone or in compounds.
const PLACE_WORD = [
  "oak", "elm", "crow", "hart", "rush", "cold", "mill",
  "salt", "bell", "rook", "otter", "heron", "willow",
  "alder", "hazel", "moss", "flint", "chalk", "raven",
  "wren", "hawk", "barley", "ember", "frost", "mist",
  "apple", "cinder", "lark", "heath",

  "ash", "birch", "bracken", "briar", "brook", "cairn",
  "cedar", "chestnut", "clay", "clover", "copper",
  "fern", "fox", "gorse", "hare", "hemlock", "honey",
  "ivy", "kestrel", "linden", "maple", "marsh",
  "marten", "meadow", "mole", "morrow", "nettle",
  "owl", "pebble", "pine", "reed", "rose", "rowan",
  "sallow", "sparrow", "stone", "swallow", "thistle",
  "thrush", "tallow", "yew", "badger", "boar",
  "crane", "dove", "falcon", "fallow", "hollow",
  "iron", "silver", "gold", "wolf", "wych"
];

// Geographic and settlement suffixes.
const PLACE_TAIL = [
  "wick", "thorpe", "mere", "holt", "stead", "dale",
  "combe", "wold", "moor", "by", "brook", "beck",
  "burn", "ness", "gate", "fold", "shaw", "hurst",
  "den", "garth", "mead", "hythe", "barrow", "hollow",

  "bury", "caster", "chester", "cliff", "croft",
  "dell", "don", "down", "fell", "field", "ford",
  "ham", "haven", "head", "heath", "hill", "hope",
  "hurst", "land", "ley", "low", "marsh", "mouth",
  "ridge", "side", "stow", "thwaite", "ton",
  "vale", "wall", "water", "well", "worth",
  "wyke", "yard", "bank", "bottom", "edge",
  "end", "fen", "gill", "grave", "pool", "rest"
];

// Separate words, e.g. "Rook Cross", "Alder Bridge".
const PLACE_APART = [
  "Cross", "Hollow", "Green", "End", "Bridge",
  "Ford", "Rise", "Hythe", "Bottom",

  "Bank", "Barrow", "Bend", "Brook", "Common",
  "Corner", "Croft", "Dell", "Down", "Edge",
  "Fell", "Field", "Gate", "Glen", "Grove",
  "Hall", "Haven", "Heath", "Hill", "Landing",
  "Meadow", "Mill", "Moor", "Pass", "Pool",
  "Reach", "Rest", "Ridge", "Row", "Shaw",
  "Spring", "Stone", "Vale", "View", "Walk",
  "Watch", "Water", "Well", "Wick", "Wood"
];

// Positional and descriptive prefixes.
const PLACE_PRE = [
  "Low", "High", "Old", "Nether", "Upper",
  "Little", "Great",

  "Lower", "Middle", "New", "North", "South",
  "East", "West", "Far", "Near", "Long",
  "Broad", "Deep", "Uppermost", "Outer",
  "Inner", "Under", "Over", "Lesser",
  "Greater", "Upper East", "Lower West"
];


const MUSE = [
  // Original
  "Finish what you started.",
  "Don't let the day go to waste.",
  "I'm still here. Get on.",
  "Mind your hands, mind your heart.",
  "You're better at this than you think.",

  // Gentle encouragement
  "One thing at a time.",
  "You've come farther than you know.",
  "There's still daylight left.",
  "A little progress is still progress.",
  "Take the next step. Then another.",
  "You don't have to do it all today.",
  "Even mountains wear down eventually.",
  "The road won't walk itself.",
  "You've handled worse than this.",
  "It's enough to begin.",
  "Slow is better than standing still.",
  "Look how far you've come.",
  "There is no shame in starting again.",
  "The smallest spark can warm a room.",

  // Firm but caring
  "Less worrying. More doing.",
  "You know what needs doing.",
  "Don't leave the hard part for tomorrow.",
  "Get your boots on. There's work to do.",
  "You'll feel better once it's done.",
  "A promise to yourself is still a promise.",
  "Don't mistake thinking for doing.",
  "Well? What are you waiting for?",
  "The first step is yours to take.",
  "You can't mend what you won't touch.",
  "Put that doubt to work.",
  "Enough circling. Choose a path.",
  "You needn't be ready. Just willing.",
  "Finish this bit before chasing another.",
  "A good plan deserves a pair of hands.",

  // Quiet wisdom
  "Not every seed grows in a season.",
  "A crooked path still leads somewhere.",
  "Some doors only open from your side.",
  "The earth doesn't hurry, yet things grow.",
  "A dull blade can be sharpened.",
  "Don't borrow trouble from tomorrow.",
  "Even the longest winter ends.",
  "What you tend will grow.",
  "A small fire needs tending.",
  "The river finds its way around the stone.",
  "You cannot carry every stone.",
  "Leave some room for wonder.",
  "Nothing worth keeping grows without care.",
  "A good day's work needn't be grand.",
  "Every craft begins with clumsy hands.",
  "A quiet hour is not a wasted one.",
  "The stars don't mind if you lose your way.",
  "Let the work teach you.",

  // Companion-like
  "I'm not going anywhere.",
  "I saw that. Well done.",
  "You seem troubled. Want to try anyway?",
  "I'll be here when you're ready.",
  "That was clever. Do it again.",
  "You have a habit of surprising me.",
  "You've got that look again.",
  "Something on your mind?",
  "I wouldn't count you out just yet.",
  "I think you know the answer already.",
  "You're allowed to be proud of that.",
  "Another day, another chance.",
  "I like it when you get curious.",

  // Playful and slightly cryptic
  "That won't build itself, you know.",
  "A fine mess. Shall we make it finer?",
  "The dust isn't going to settle itself.",
  "I've seen snails with more conviction.",
  "Careful. You're beginning to look competent.",
  "The world turns whether you're ready or not.",
  "A wandering mind needs good boots.",
  "Don't stare at the mountain. Climb it.",
  "The day is young. Unlike some of us."
];


const OMENS = {
  bandits: [
    "riders coming",
    "iron on the road",
    "boots at the gate before long",
    "the roads aren't safe tonight",
    "strangers gathering beyond the hills",
    "trouble wearing a friendly face",
    "steel hidden beneath traveling cloaks",
    "hoofbeats where no horses should be",
    "a shadow moving along the old road",
    "men with more blades than bread",
    "the watchfires burning too early",
    "someone counting the village gates",
    "a trail of broken wagons",
    "crows gathering by the roadside",
    "a toll no honest man would ask",
    "dust rising without a caravan",
    "the sound of horses at midnight",
    "strangers asking too many questions",
    "the woods hiding unwelcome company",
    "blood on the road before dawn"
  ],

  pirates: [
    "lanterns on the water",
    "oars in the dark",
    "sails where none should be",
    "the tide bringing unwelcome guests",
    "shadows beneath black canvas",
    "a ship sailing without colors",
    "strange lights beyond the harbor",
    "the gulls fleeing the shoreline",
    "a bell ringing from an empty ship",
    "the sound of oars against the tide",
    "saltwater carrying the smell of iron",
    "a dark sail against the morning sun",
    "anchors falling in shallow water",
    "the harbor watch growing restless",
    "footsteps along the docks at night",
    "a vessel keeping clear of the lighthouse",
    "the sea hiding more than fish",
    "ropes creaking beneath moonless skies",
    "a flag that no honest captain flies",
    "the tide turning against the shore"
  ],

  trader: [
    "wheels on the road",
    "a stranger with wares",
    "the jingle of coins from afar",
    "a wagon heavy with curious things",
    "good bargains beneath dusty canvas",
    "a merchant following the old road",
    "news arriving wrapped in cloth",
    "foreign spices on the morning wind",
    "a traveler carrying more than stories",
    "horses pulling a brightly painted cart",
    "someone willing to trade tales for supper",
    "a familiar road bringing unfamiliar faces",
    "the smell of distant markets",
    "a stranger seeking shelter and customers",
    "bells ringing from an approaching wagon",
    "something rare changing hands",
    "a road-weary traveler with full saddlebags",
    "silver waiting for an eager hand",
    "a peddler with pockets full of wonders",
    "new faces at the market before sundown"
  ],

  boon: [
    "luck is turning",
    "something kind is on its way",
    "a small kindness returning tenfold",
    "the wind changing in your favor",
    "good fortune finding an open door",
    "a burden growing lighter",
    "the harvest yielding more than expected",
    "a lost thing finding its way home",
    "a stranger bringing unexpected kindness",
    "an old worry finally passing",
    "the sun breaking through stubborn clouds",
    "a wish finding fertile ground",
    "a good day hiding just beyond the dawn",
    "help arriving before it's needed",
    "a quiet blessing beneath ordinary things",
    "the road offering an easier path",
    "something broken finding its mending",
    "a little joy where none was expected",
    "fortune smiling upon patient hands",
    "the world giving something back"
  ]
};



const GIFTS = {
  carving: "{a {tiny|little|finely|roughly} carved {wooden|bone} {bird|fox|hare|wolf|bear|owl|horse|cat|fish|badger|mouse}|a {carved|whittled} {spoon|whistle|pendant|comb|walking stick|toy boat}|a {wooden|bone} {charm|figurine|keepsake}}",
  baskets: "{a {small|sturdy|beautifully woven|slightly crooked} {wicker|reed|willow} {basket|tray|box|creel}|a woven basket filled with {berries|flowers|herbs|nuts|fresh bread}|a {reed|rush|wicker} {mat|pouch|container}}",
  pottery: "{a {painted|glazed|plain|slightly lopsided} {clay|earthenware} {bowl|mug|cup|jug|pitcher|vase|flowerpot}|a little clay {bird|fox|cat|frog|mouse|house}|a {blue|green|red|white} glazed {bowl|plate|cup}}",
  knitting: "{a {warm|soft|thick|colorful|slightly itchy} {woolen|knitted} {scarf|shawl|cap|hat|blanket}|a pair of {warm|striped|mismatched|thick} {mittens|socks|gloves}|a little knitted {cat|rabbit|bird|sheep|mouse}}",
  baking: "{a {fresh|warm|golden|slightly burnt} {apple|berry|cherry|plum|meat} pie|a {honey|spice|carrot|apple|walnut|sadness} cake|a {crusty|warm|freshly baked} loaf of {rye|wheat|oat|barley} bread|a basket of {biscuits|oatcakes|sweet rolls|scones}|a {blackberry|apple|pear|plum} {tart|crumble}}",
  brewing: "{a {jug|bottle|flask|small cask} of {ale|mead|cider|stout|berry wine|spiced wine}|a bottle of {sweet|strong|spiced|fruity} {cordial|mead|cider}|a {small|well-aged|freshly brewed} keg of {ale|stout|cider}}",
  embroidery: "{a {finely|carefully|clumsily|beautifully} embroidered {kerchief|handkerchief|ribbon|pouch|bookmark|cloth}|a {linen|silk|cotton} {kerchief|ribbon|patch} stitched with {flowers|birds|stars|leaves|their initials}|a little {flower|bird|star|heart} stitched into {a scrap of linen|a ribbon|a handkerchief}}",
  pressing: "{a {carefully|beautifully} pressed {flower|fern|leaf|clover|blossom}|a {little|handmade} book of pressed {wildflowers|leaves|herbs|ferns}|a pressed {rose|violet|daisy|buttercup|primrose} tucked into {a letter|a notebook|a folded page}|a framed {flower|fern|blossom|sprig of heather}}",
  candles: "{a {hand-dipped|hand-poured|scented|plain} {beeswax|tallow} candle|a pair of {long|short|twisted|colored} {candles|tapers}|a candle scented with {lavender|rosemary|pine|honey|wildflowers}|a bundle of {beeswax|tallow} {candles|tapers}}",
  toys: "{a {painted|carved|little|brightly colored} wooden {horse|boat|soldier|bird|fox|dragon}|a {cloth|rag|wooden} doll|a {spinning|painted|wooden} top|a set of {wooden animals|toy soldiers|carved birds|painted blocks}|a {string|wooden} puppet shaped like {a fox|a king|a dragon|a horse}}",
  bees: "{a jar of {golden|dark|wildflower|clover|heather} honey|a {small|large|fresh} piece of honeycomb|a pot of {beeswax balm|honey salve|honey butter}|a bundle of {hand-dipped|sweet-smelling} beeswax candles|a {honey cake|honeyed oatcake|honey biscuit}}",
  gardening: "{a pot of {mint|rosemary|thyme|basil|lavender|sage}|a basket of {fresh vegetables|ripe tomatoes|carrots|radishes|turnips|berries}|a {flowering|fragrant|little} {rosebush|lavender plant|herb plant|flower}|a packet of {flower|vegetable|herb} seeds|a bunch of {wildflowers|lavender|fresh herbs|roses|daisies}}",
  fishing: "{the {biggest|finest|fattest|freshest} fish of the day|a {fresh|smoked|salted} {trout|perch|pike|herring|salmon}|a basket of {river mussels|fresh fish|smoked fish}|a {hand-carved|painted|lucky} fishing lure|a string of {freshly caught|silver-scaled} fish}",
  painting: "{a {little|beautiful|rough|colorful} painting of {the village|the hills|the river|their home|the sunset|a nearby forest}|a {watercolor|charcoal sketch|painted portrait} of {a friend|the village|the old mill|the market}|a {painted|decorated} wooden {sign|box|plaque|panel}|a tiny landscape painted in {blue|green|gold|soft} tones}",
  poetry: "{a {short|long|handwritten|slightly awkward} poem about {friendship|the seasons|the village|their adventures|a shared memory}|a {folded|carefully written} verse|a little book of {love poems|folk verses|silly rhymes|old ballads}|a {rhyming|thoughtful|funny} couplet|a poem written just for them}",
  maps: "{a {carefully drawn|roughly sketched|beautifully inked} map of {the valley|the village|the surrounding hills|the old roads|the nearby forest}|a chart of {the rivers|the coast|the stars|the mountain paths}|a map showing {a favorite walking trail|a hidden clearing|a quiet fishing spot|an old ruin}|a little map marked with {their favorite places|good berry patches|safe roads}}",
  tanning: "{a {soft|sturdy|finely stitched} leather {pouch|belt|satchel|bag|glove|wallet}|a pair of {soft|well-fitted|durable} leather {gloves|boots}|a {small|decorated|weatherproof} {waterskin|flask holder|leather case}|a leather {bracelet|strap|book cover|tool roll}}",
  fletching: "{a {bundle|fistful|quiver} of {hunting|practice|finely fletched} arrows|a {decorated|well-balanced|carefully made} {arrow|bolt}|a set of arrows feathered with {goose|crow|hawk|raven} feathers|a {small|sturdy|leather} quiver|a {brightly colored|carefully shaped} arrow feather}",
  sewing: "{a {mended|newly sewn|carefully patched} {coat|shirt|tunic|dress|apron|cloak}|a {linen|woolen|patchwork} {blanket|bag|pouch|apron}|a set of {linen napkins|cloth handkerchiefs|stitched patches}|a {soft|sturdy|colorful} cloth {bag|pouch|cap|sash}|a coat with {new buttons|a mended sleeve|fresh stitching}}",
  herbs: "{a {soothing|fragrant|warming|sleepy} tea blend|a bundle of dried {mint|sage|rosemary|thyme|lavender|chamomile}|a jar of {herbal salve|soothing balm|mint ointment}|a {fragrant|little|handmade} sachet of {lavender|rosemary|dried flowers|herbs}|a packet of {medicinal|culinary|wild} herbs}",
  statues: "{a {small|rough|finely carved|polished} {stone|clay|marble} statue of {a bird|a fox|a cat|a villager|a horse|a dragon}|a little {clay|stone} {figure|bust|ornament|figurine}|a {garden|hearth|shelf} ornament shaped like {a frog|an owl|a mushroom|a rabbit}|a tiny clay model of {the village|their house|the old mill}}",
  smithing: "{a {sharp|new|well-balanced|hand-forged} {knife|dagger|chisel|tool}|a {polished|decorated|simple} {iron|copper|bronze} {brooch|pendant|ring|buckle|charm}|a set of {fine nails|sturdy hooks|small hinges|iron fittings}|a {small|ornate|carefully forged} {key|hook|bell|horseshoe}|a little {iron|copper} charm shaped like {a bird|a leaf|a star|a heart}}",
  binding: "{a {leather-bound|cloth-bound|hand-stitched|pocket-sized} {notebook|journal|diary|sketchbook}|a little book filled with {blank pages|old stories|folk tales|poems|recipes}|a {beautifully|carefully|simply} bound {book|journal|collection of stories}|a notebook with {pressed flowers|decorated pages|a painted cover|their initials}}",
  lute: "{a {gentle|cheerful|melancholy|playful} {song|tune|melody|ballad}|a tune written just for them|a {little|beautiful|old-fashioned} {serenade|folk song|lullaby}|a song about {their adventures|the village|a shared memory|the changing seasons}|an evening of {soft music|lively tunes|old folk songs}}",
  singing: "{a {gentle|sweet|cheerful|beautiful} {song|lullaby|ballad|folk tune}|a song about {friendship|the village|their adventures|the old days}|a {short|funny|heartfelt} verse written just for them|a rendition of {an old ballad|a childhood lullaby|a favorite folk song}|a song of {thanks|comfort|celebration|good fortune}}",
  stars: "{a name for {a star|a constellation|a distant light in the sky}|a {carefully drawn|beautifully inked|roughly sketched} chart of {the constellations|the night sky|the heavens}|a story about {a falling star|a distant constellation|the moon|an ancient star}|a map showing {their favorite constellation|the brightest stars|the path of the moon}|a promise made beneath the stars}",
  birds: "{a {beautiful|spotted|striped|brightly colored} {feather|songbird feather|tail feather}|a feather from {a crow|a raven|a hawk|an owl|a songbird}|a {carefully drawn|painted|sketched} picture of {a rare bird|a robin|an owl|a swallow|a kingfisher}|a little collection of {feathers|bird sketches|fallen eggshells}|a feather tucked into {a ribbon|a letter|a little pouch}}",
  kites: "{a {brightly painted|colorful|handmade|sturdy} kite|a kite shaped like {a bird|a dragon|a butterfly|a fish|a star}|a {small|large|paper|cloth} kite with {a long tail|colorful ribbons|painted wings|a painted sun}|a bundle of {kite string|bright ribbons|spare kite paper}|a little kite painted with {clouds|birds|stars|flowers}}"
};


const TROUBLE_TITLE = { bandits: "Bandits!", pirates: "River pirates!", debt: "Debt collectors", fey: "Fey mood", feast: "Feast", wedding: "Wedding!", trader: "Trader",
  royal: "Royal party", refugees: "Runaways", defectors: "Deserters", wildfire: "Fire!" };


const PET_SENDOFF = [
  "fed it and sent it on its way",
  "shooed it back out",
  "said no, firmly",
  "gave it {a scrap of food|a little water|one last pat} and sent it along",
  "walked it back to {the road|the edge of the village|the garden gate|the woods}",
  "pointed it toward {the door|the road|the fields} and hoped it understood",
  "left {a little food|some water|a warm corner} outside for it",
  "gave it a {gentle|reluctant|firm} nudge toward the door",
  "told it to go home, wherever that might be",
  "shooed it away with {a sigh|a wave of the hand|a stern look}",
  "waited until it wandered off on its own",
  "led it outside and {closed the gate|wished it well|watched it leave}",
  "offered it {a crust of bread|some scraps|a bit of supper} before saying goodbye",
  "tried to explain that it couldn't stay",
  "scratched it behind the ears and sent it along",
  "gave it a name, then told it to leave",
  "opened the door and hoped it would take the hint",
  "carried it back outside, {gently|carefully|with some difficulty}",
  "told it there was no room, {kindly|firmly|with a little regret}",
  "sent it off with {a pat|a kind word|a bit of food|a sigh}",
  "followed it to the gate to make sure it left",
  "tried shooing it away, then resorted to bribery",
  "gave it one last look before closing the door",
  "waved it off as though it understood",
  "let it rest awhile before sending it on",
  "made sure it had eaten before turning it away",
  "pretended not to notice when it came back",
  "said goodbye twice before it finally left",
  "watched it disappear {down the lane|into the grass|past the hedgerow|around the corner}",
  "left the gate open and let it make its own choice"
];

const PET_NO_ROOM = [
  "it wasn't for them",
  "it was no use to them",
  "they had no room for it",
  "there was already {too much to tend|enough to feed|little room to spare}",
  "they couldn't afford another mouth to feed",
  "their home was {too small|too crowded|hardly fit for another creature}",
  "they had enough trouble looking after themselves",
  "they weren't ready to care for it",
  "it deserved {more space|a better home|someone with more time}",
  "they had neither the {time|space|food|patience} for it",
  "their days were already full",
  "they feared they couldn't give it a good life",
  "they'd grown too fond of their quiet",
  "they had no proper place to keep it",
  "they weren't much good with animals",
  "there was simply nowhere for it to sleep",
  "they couldn't bear the thought of another goodbye",
  "they had made that mistake once before",
  "it seemed happier roaming free",
  "they had enough mouths waiting at home",
  "the timing was all wrong",
  "they knew someone else could care for it better",
  "it belonged {outdoors|in the fields|among its own kind|somewhere quieter}",
  "they couldn't keep every creature that wandered in",
  "their heart said yes, but their circumstances said no",
  "they'd promised themselves not to take in another",
  "they were afraid of growing attached",
  "there wasn't enough {food in the cupboard|room by the hearth|space in the yard}",
  "they weren't certain it wanted to stay",
  "they had other responsibilities to tend"
];

const PET_DEATH = [
  "passed away in their sleep",
  "slipped away quietly",
  "didn't wake up one morning",
  "grew still during the night",
  "passed peacefully beside the hearth",
  "died {quietly|peacefully|gently} after {a long life|a short illness|many good years}",
  "took its last breath {in the warmth of home|beneath a familiar blanket|in its favorite spot}",
  "grew {weaker|sleepier|quieter} with the passing days, then was gone",
  "fell asleep one evening and never woke",
  "left this world as quietly as it had entered their life",
  "passed on during {a quiet night|the early morning|the last hours before dawn}",
  "went to sleep in its favorite place for the last time",
  "had been slowing down for some time",
  "grew old and finally found its rest",
  "closed its eyes and rested for good",
  "was gone by the time the morning light reached the window",
  "spent its final evening {beside the fire|curled up nearby|in a patch of fading sunlight}",
  "slipped away while the household slept",
  "grew too tired to rise one morning",
  "passed after {many happy seasons|a lifetime of companionship|a long and gentle decline}",
  "was found resting peacefully {by the hearth|beneath the table|in its usual corner}",
  "had one last quiet evening before it was gone",
  "seemed content until the very end",
  "left behind {an empty bed|a quiet corner|a well-worn blanket|a silence by the hearth}",
  "never stirred again after the night's rest"
];

const PET_BURIAL = [
  "the hedge",
  "the old fence post",
  "a flat stone",
  "the apple tree",
  "the {old|great|young} {oak|willow|ash|elm|birch} tree",
  "the {garden wall|stone wall|back fence|wooden gate}",
  "the {rosebush|lavender bed|herb garden|flower patch}",
  "a patch of {wildflowers|clover|soft grass|daisies}",
  "the {village orchard|old orchard|apple grove}",
  "a {small|smooth|weathered} stone",
  "the {garden gate|back doorstep|corner of the yard}",
  "the {old well|stone bench|woodpile|little footbridge}",
  "a {young sapling|flowering bush|patch of moss}",
  "the {cherry tree|pear tree|plum tree|rowan tree}",
  "the {south wall|north fence|back garden|kitchen window}",
  "a bed of {marigolds|primroses|violets|bluebells}",
  "the place where it {liked to sleep|used to play|first appeared}",
  "the {quiet corner of the garden|shaded side of the house|edge of the orchard}",
  "a patch of earth near {the stream|the meadow|the hedgerow|the old path}",
  "the {little hill|grassy mound|sunny bank|sheltered hollow}",
  "a {flat river stone|wooden marker|small cairn}",
  "the tree where it {used to nap|liked to sit|spent its afternoons}",
  "the {familiar path|garden steps|old stone trough}",
  "a cluster of {ferns|wild roses|heather|buttercups}",
  "the {quiet meadow|orchard fence|edge of the woods|village green}"
];


const GIFT_ANY = [
  "a {warm|fresh|crusty} {loaf|roll|oatcake}",
  "a cup of {tea|warm milk|herbal infusion|spiced cider}",
  "a handful of {berries|nuts|cherries|dried fruit|sweet peas}",
  "a {smooth|shiny|strange|pretty} {stone|pebble|shell}",
  "the {last|biggest|ripest|sweetest} {apple|pear|plum|peach}",
  "a {small|fragrant|freshly picked} bunch of {wildflowers|lavender|daisies|herbs}",
  "a {red|yellow|white|pink} {rose|tulip|wildflower}",
  "a piece of {honeycomb|cheese|sweetbread|dried fruit|ginger cake}",
  "a {little|small|well-worn} {book|journal|storybook}",
  "a {pretty|colorful|soft} {ribbon|scarf|kerchief}",
  "a {polished|unusual|smooth} {coin|button|bead|piece of glass}",
  "a {lucky|shiny|old} {penny|button|charm}",
  "a {small|brightly colored|beautiful} {feather|shell|flower}",
  "a {fresh|ripe|perfectly round} {apple|pear|plum|fig}",
  "a basket of {berries|nuts|fruit|fresh vegetables|wildflowers}",
  "a {sweet|fragrant|juicy} {orange|peach|pear|plum}",
  "a jar of {honey|jam|preserves|pickled fruit}",
  "a {warm|soft|thick} {blanket|shawl|cloak}",
  "a handful of {roasted chestnuts|candied nuts|dried berries|sweet almonds}",
  "a {fresh|warm|buttered} {biscuit|scone|oatcake|bread roll}",
  "a {pretty|unusual|colorful} {leaf|flower|stone|shell}",
  "a {small|carefully folded|handwritten} {note|letter|poem}",
  "a {sweet|funny|kind} {message|letter|little note}",
  "a {polished|carved|painted} {wooden bead|button|stone|shell}",
  "a {simple|braided|colorful} {bracelet|ribbon|cord}",
  "a little pouch of {dried lavender|mint leaves|wildflower seeds|roasted nuts}",
  "a {fresh|fragrant|pretty} sprig of {rosemary|lavender|mint|heather}",
  "a {warm|fresh|buttered} slice of {bread|honey cake|fruit loaf}",
  "a handful of {copper coins|old buttons|pretty beads|colored stones}",
  "a {small|delicate|unusual} {seashell|river stone|piece of driftwood}",
  "a {ripe|sweet|freshly picked} {strawberry|blackberry|raspberry|fig}",
  "a {little|tiny|simple} {wooden charm|cloth pouch|keepsake}",
  "a {bright|shiny|polished} {copper coin|brass button|silver trinket}",
  "a bundle of {kindling|firewood|dry herbs|fresh reeds}",
  "a {warm|fragrant|freshly baked} {pie|tart|pastry}",
  "a {little|small|carefully wrapped} parcel of {sweets|biscuits|dried fruit}",
  "a {clean|soft|freshly washed} {handkerchief|linen cloth|napkin}",
  "a {smooth|well-shaped|unusual} {piece of driftwood|river pebble|stone}",
  "a {brightly colored|pretty|well-made} {hair ribbon|belt cord|cloth sash}",
  "a {tiny|little|simple} {bell|brooch|pendant|charm}",
  "a {sweet|fresh|ripe} {melon|apple|pear|bunch of grapes}",
  "a {small|warm|freshly baked} {honey cake|ginger biscuit|fruit tart}",
  "a {soft|well-worn|comfortable} {pair of gloves|scarf|cap}",
  "a {little|small|neatly wrapped} packet of {tea leaves|flower seeds|herbs|spices}",
  "a {pretty|smooth|oddly shaped} stone found by {the river|the old road|the lake|the shore}"
];


const COURT = [
  // Small kindnesses
  "picked {wildflowers|a flower|a bunch of daisies} for",
  "saved {a seat|the best seat|a place by the fire} for",
  "walked home with",
  "fixed {a stool|a chair|a broken latch|a squeaky door} for",
  "carried {water|firewood|a heavy basket|a sack of grain} for",
  "brought {a warm loaf|a cup of tea|fresh berries|a little honey} to",
  "saved {the last apple|a slice of pie|the best biscuit|a sweet roll} for",
  "held the door open for",
  "shared {an umbrella|a cloak|a blanket|a warm scarf} with",
  "helped {gather firewood|carry groceries|mend a fence|tend the garden} with",
  "left {a flower|a kind note|a little gift|a ribbon} for",
  "made sure there was {a warm drink|a good meal|a dry seat} waiting for",

  // Time together
  "took a {long|quiet|evening|sunset} walk with",
  "watched {the stars|the sunset|the rain|the fireflies} with",
  "sat beside {the river|the fire|the old well|the orchard} with",
  "spent {the afternoon|a quiet evening|a rainy morning} with",
  "shared {a picnic|a meal|a quiet moment|an afternoon} with",
  "wandered through {the market|the orchard|the village|the meadow} with",
  "went {berry picking|flower gathering|stargazing|walking} with",
  "watched {the village festivities|a passing storm|the spring blossoms} with",
  "stayed up late talking with",
  "found an excuse to spend more time with",

  // Shy affection
  "found an excuse to sit beside",
  "lingered a little longer near",
  "kept stealing glances at",
  "blushed while speaking to",
  "smiled whenever they saw",
  "tried to impress",
  "stumbled over their words around",
  "forgot what they meant to say to",
  "grew unusually quiet around",
  "laughed a little too hard at a joke from",
  "looked for {an excuse|a reason|an opportunity} to talk to",
  "pretended to need help from",

  // Playful flirting
  "teased {gently|affectionately|playfully} with",
  "traded {jokes|stories|riddles|playful insults} with",
  "challenged {to a game of dice|to a friendly wager|to a race|to a dance}",
  "tried to make {laugh|smile|blush}",
  "made a fool of themselves trying to impress",
  "showed off {their dancing|their singing|their strength|a new trick} for",
  "lost {a game of chess|a game of dice|a silly bet} to",
  "claimed to have saved the best {seat|apple|flower|story} for",
  "invented a ridiculous excuse to visit",
  "tried to act {casual|unimpressed|mysterious} around",

  // Thoughtful gestures
  "remembered {a favorite flower|a favorite meal|a little detail} about",
  "brought {a lucky charm|a smooth river stone|a pretty feather} to",
  "mended {a scarf|a torn sleeve|a worn satchel} for",
  "picked {the ripest berries|the prettiest flowers|the sweetest apples} for",
  "saved {a good story|an interesting book|a funny memory} to share with",
  "offered {their coat|their hand|their arm|their seat} to",
  "walked through {the rain|the cold|the mud} to visit",
  "checked on {after a long day|during an illness|after a difficult morning}",
  "stayed beside {through a difficult evening|during a storm|until the fire burned low}",
  "noticed {seemed tired|looked troubled|needed cheering up} and came to help",

  // More openly romantic
  "held hands with",
  "danced {slowly|awkwardly|beneath the stars|by the fire} with",
  "sang {a gentle song|an old ballad|a silly love song} for",
  "wrote {a little poem|a heartfelt letter|a shy confession} for",
  "left {a flower|a love note|a ribbon} on the doorstep of",
  "shared {a shy kiss|a lingering embrace|a tender moment} with",
  "confessed their feelings to",
  "asked {to dance|to take a walk|to share supper}",
  "promised to meet {at sunset|by the old tree|after the market} with",
  "found the courage to tell {how much they mattered|how they really felt}",
  "rested their head on the shoulder of",
  "watched the moon rise beside"
];


const KEEPSAKE_WEAPON = [
  "Lament", "Grief", "Due",
  "Requiem", "Remembrance", "Sorrow", "Regret",
  "Vengeance", "Reckoning", "Promise", "Oath",
  "Last Word", "Farewell", "Final Wish", "Legacy",
  "Echo", "Silence", "Memory", "Longing",
  "Heartache", "Anguish", "Mourning", "Wrath",
  "Resolve", "Defiance", "Retribution", "Justice",
  "Burden", "Debt", "Penance", "Atonement",
  "Mercy", "Judgment", "Truth", "Witness",
  "Unspoken Word", "Last Stand", "Final Breath",
  "Parting Gift", "Bitter End", "Unfinished Tale",
  "Fallen Star", "Dying Light", "Cold Ember",
  "Broken Oath", "Lost Hope", "Quiet Fury",
  "Fading Echo", "Final Song", "Rest"
];

const KEEPSAKE_ARMOR = [
  "Shroud", "Vigil", "Keepsake",
  "Embrace", "Shelter", "Sanctuary", "Solace",
  "Memory", "Remembrance", "Promise", "Oath",
  "Legacy", "Blessing", "Grace", "Comfort",
  "Refuge", "Haven", "Ward", "Guard",
  "Protection", "Devotion", "Faith", "Hope",
  "Resolve", "Endurance", "Patience", "Strength",
  "Heart", "Spirit", "Touch", "Warmth",
  "Last Embrace", "Final Promise", "Parting Gift",
  "Quiet Rest", "Gentle Memory", "Soft Goodbye",
  "Fading Light", "Eternal Vigil", "Silent Prayer",
  "Unbroken Oath", "Last Shelter", "Old Promise",
  "Kindred Spirit", "Hearthlight", "Homecoming",
  "Safe Harbor", "Everlasting Watch", "Peace",
  "Rest"
];
