import Yield from '@civ-clone/core-yield/Yield';

/**
 * How much damage a unit can take before it is destroyed: its maximum. What it has left is this less its `damage()`
 *  (see `Unit.hitPoints()`). A game that registers no `Yield` rule for it leaves it at 0, and its units never take
 *  damage.
 */
export class HitPoints extends Yield {}

export default HitPoints;
