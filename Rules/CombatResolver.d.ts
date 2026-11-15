import { Attack, Defence } from '../Yields';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
/**
 * How a battle ended: who won and who lost, and the damage each side took in it (in `HitPoints`, added to the unit's
 *  `damage()`). The loser is destroyed, so only the winner's damage is kept.
 */
export interface CombatResult {
  winner: Unit;
  loser: Unit;
  attackerDamage: number;
  defenderDamage: number;
}
export type CombatResolverArgs = [
  attacker: Unit,
  defender: Unit,
  attack: Attack,
  defence: Defence,
  power: number,
  randomNumberGenerator: () => number
];
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
export declare class CombatResolver extends Rule<
  CombatResolverArgs,
  CombatResult
> {}
export default CombatResolver;
