const assert = require("assert");
const { parseManifest } = require("../utils/parser");

const sample = `[2026-03-29] || CRG-002 :: 17 >> Lunar Outpost Delta
[2026-03-29] || CRG-005 :: 20 >> Sector-7 Mining Rig
[2026-03-29] || CRG-012 :: 100 >> Sector-7 Command Center
[2026-03-29] || CRG-001 :: 500 >> Mars Base Alpha`;

const { saved, skipped } = parseManifest(sample);

assert.strictEqual(skipped.length, 2, "prime weights should be skipped");
assert.strictEqual(saved.length, 2, "non-prime records should be saved");

const crg005 = skipped.find((r) => r.cargoCode === "CRG-005");
assert.strictEqual(crg005.weight, 29, "Sector-7 weight should be 20 * 1.45 rounded");

const crg012 = saved.find((r) => r.cargoCode === "CRG-012");
assert.strictEqual(crg012.weightKg, 145, "Sector-7 weight should be 100 * 1.45 rounded");

console.log("Task 2 parser tests passed");
