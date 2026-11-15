import Action from '../Action';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

/**
 * `unit` survived a battle against `by` but took damage in it (see `Unit.damage()`). `action` is the attack. A unit
 *  that loses is `Defeated` instead.
 */
export class Damaged extends Rule<[Unit, Unit, Action], void> {}

export default Damaged;
