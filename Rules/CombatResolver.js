"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatResolver = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Fights one battle between `attacker` and `defender`, at the strengths `strength` gave them (`attack`, `defence`),
 *  with `power` the share of a full attack the attacker has the moves for (at most 1), drawing on
 *  `randomNumberGenerator`. The first answer is the result.
 *
 * A rule declines through its `Criterion`, not by returning `undefined`: `process` runs every rule whose criteria
 *  match and returns all their answers. The first answer that isn't `undefined` is used, but every matching rule's
 *  effect still runs, so only one resolver should match a battle: a second one would fight it again, drawing on the
 *  generator.
 *
 * The result must name the attacker and the defender as the winner and the loser, one each, and must leave the
 *  winner alive: its damage after the battle must stay below its `HitPoints`. `Attack` throws on a result that
 *  doesn't, as a bug in the ruleset.
 *
 * With no rule answering, an attack is a single roll: `attack × power × random ≥ defence × random`, with the
 *  attacker's draw first.
 */
class CombatResolver extends Rule_1.default {
}
exports.CombatResolver = CombatResolver;
exports.default = CombatResolver;
//# sourceMappingURL=CombatResolver.js.map