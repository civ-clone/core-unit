"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatResolver = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Fights one battle between `attacker` and `defender`, at the strengths `strength` gave them (`attack`, `defence`),
 *  with `power` the share of a full attack the attacker has the moves for (at most 1), drawing on
 *  `randomNumberGenerator`. The first answer is the result.
 *
 * With no rule answering, an attack is a single roll: `attack × power × random ≥ defence × random`, with the
 *  attacker's draw first.
 */
class CombatResolver extends Rule_1.default {
}
exports.CombatResolver = CombatResolver;
exports.default = CombatResolver;
//# sourceMappingURL=CombatResolver.js.map