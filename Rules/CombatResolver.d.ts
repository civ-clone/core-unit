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
 * With no rule answering, an attack is a single roll: `attack × power × random ≥ defence × random`, with the
 *  attacker's draw first.
 */
export declare class CombatResolver extends Rule<
  CombatResolverArgs,
  CombatResult
> {}
export default CombatResolver;
