"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefenderRank = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * How well `candidate`, one of the units on the attacked square, would defend it against `attacker`, given the
 *  strengths `strength` gives the pair (`attack`, `defence`). The highest score defends; units with the same score keep
 *  the square's order. The first answer is a unit's score. A `NaN` score counts as `-Infinity`.
 *
 * A rule declines through its `Criterion`, not by returning `undefined`: `process` runs every rule whose criteria
 *  match and returns all their answers. The first answer that isn't `undefined` is used, but every matching rule's
 *  effect still runs, so only one rule should score a unit.
 *
 * With no rule answering, the unit with the highest `defence` defends.
 */
class DefenderRank extends Rule_1.default {
}
exports.DefenderRank = DefenderRank;
exports.default = DefenderRank;
//# sourceMappingURL=DefenderRank.js.map