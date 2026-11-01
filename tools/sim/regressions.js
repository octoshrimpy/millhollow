// Deterministic in-memory checks for the reviewed simulation regressions.
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const R = path.join(__dirname, "../../js/ds/");
const ctx = { console, assert, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
vm.runInContext(["data.js", "names.js", "game.js", "combat.js"].map((f) => fs.readFileSync(path.join(R, f), "utf8")).join("\n"), ctx);
vm.runInContext(`
const reset = () => { newGame(); settleIn(S.recruits.slice(0, 4).map((s) => s.id)); };

// grow moves every location-bearing personal field, including suspended work and beds.
reset();
const p = S.settlers[0], old = S.size, at = S.hall;
p.job = at; p.wasJob = { i: at, type: "farm" }; p.was = { i: at, type: "farm" }; p.laid = at;
grow(1); const moved = (Math.floor(at / old) + 1) * (old + 2) + at % old + 1;
assert.equal(p.job, moved); assert.equal(p.wasJob.i, moved); assert.equal(p.was.i, moved); assert.equal(p.laid, moved);

// Build/reveal may grow the map, but the object raised before reveal remains valid.
reset();
S.land.fill("meadow"); S.seen.fill(true); S.sites = []; S.grid.fill(null); S.hall = null;
S.res.wood = S.res.stone = 999;
build(0, "townhall"); assert.equal(S.grid.some((b) => b?.type === "townhall"), true);

// Old scavenger maps return to the scav map, not the keeper map.
reset();
const site = S.sites[0]; S.expedition = { site: 0, scav: true, map: { floor: 1, rooms: {}, at: "0,0" } };
migrate(); assert.equal(site.scav[1], S.expedition.map); assert.equal(site.floors?.[1], undefined);

// Same-room remains use an unoccupied fallback and never replace the first body.
reset();
const ruin = S.sites[0], map = { floor: 1, rooms: { "0,0": { type: "entrance" }, "1,0": { type: "event" }, "2,0": { type: "event" } } };
S.remains = [{ id: 1, site: 0, floor: 1, at: "below", room: "1,0" }, { id: 2, site: 0, floor: 1, at: "below", room: "1,0" }];
lay(map, ruin); assert.equal(map.rooms["1,0"].body, 1); assert.equal(map.rooms["2,0"].body, 2); assert.equal(S.remains[0].room, "1,0"); assert.equal(S.remains[1].room, "2,0");

// Transfer both clock directions. Negative rebased dates are valid; zero and absence stay distinct.
reset();
S.grid[0] = { type: "wonder" }; S.wonder = {}; S.day = 7301;
const traveler = S.settlers[0], id = traveler.id;
traveler.born = 0; traveler.graft = 7302; traveler.pet = { kind: Object.keys(PETS)[0], name: "Ash", since: 10, age0: 0 };
traveler.thoughts = [{ k: "dayoff", until: 7305, n: 0 }, { k: "built", until: 7290, n: 3 }];
traveler.fought = { 999: 7310 }; traveler.parents = [999];
const petAge = petOld(traveler.pet), personAge = ageOf(traveler);
const target = openTown("Other"); others[target].S.day = 1; others[target].S.grid[0] = { type: "wonder" }; others[target].S.wonder = {};
assert.equal(sendThrough([id], target), 1); const movedPerson = others[target].S.settlers.find((s) => s.id === id);
assert.equal(movedPerson.born, -7300); assert.equal(movedPerson.graft, 2); assert.equal(movedPerson.pet.since, -7290);
switchTo(target);
assert.equal(ageOf(movedPerson), personAge); assert.equal(petOld(movedPerson.pet), petAge);
assert.equal(movedPerson.thoughts[0].until, 5); assert.equal(movedPerson.thoughts[1].until, -10);
assert.equal(movedPerson.thoughts[0].n, 0); assert.equal(movedPerson.thoughts[1].n, 3);
assert.equal(movedPerson.fought[999], 10); assert.deepEqual(movedPerson.parents, [999]); assert.equal(movedPerson.guest, undefined);
S.settlers.push(makeSettler()); assert.equal(sendThrough([id], 0), 1);
const homePerson = others[0].S.settlers.find((s) => s.id === id); assert.equal(homePerson.born, 0); assert.equal(homePerson.graft, 7302); assert.equal(homePerson.pet.since, 10);
`, ctx);
