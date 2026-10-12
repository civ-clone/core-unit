import { Attack, Defence } from '../Yields';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
/**
 * Changes an attacker's `Attack` or a defender's `Defence` for one battle between them: the bonuses that depend on
 * where the defender stands or on who is attacking (terrain, City Walls, a fortified defender), which aren't part of
 * either unit's own strength.
 */
export declare class Strength extends Rule<
  [Unit, Unit, Attack, Defence],
  void
> {}
export default Strength;
