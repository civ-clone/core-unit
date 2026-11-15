import { Attack, Defence } from '../Yields';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
export type DefenderRankArgs = [
  attacker: Unit,
  candidate: Unit,
  attack: Attack,
  defence: Defence
];
/**
 * How well `candidate`, one of the units on the attacked square, would defend it against `attacker`, given the
 *  strengths `strength` gives the pair (`attack`, `defence`). The highest score defends; units with the same score keep
 *  the square's order. The first answer is a unit's score.
 *
 * With no rule answering, the unit with the highest `defence` defends.
 */
export declare class DefenderRank extends Rule<DefenderRankArgs, number> {}
export default DefenderRank;
