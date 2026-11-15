"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefenderRank = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * How well `candidate`, one of the units on the attacked square, would defend it against `attacker`, given the
 *  strengths `strength` gives the pair (`attack`, `defence`). The highest score defends; units with the same score keep
 *  the square's order. The first answer is a unit's score.
 *
 * With no rule answering, the unit with the highest `defence` defends.
 */
class DefenderRank extends Rule_1.default {
}
exports.DefenderRank = DefenderRank;
exports.default = DefenderRank;
//# sourceMappingURL=DefenderRank.js.map