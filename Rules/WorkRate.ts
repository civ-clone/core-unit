import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

/**
 * How many turns' work `unit` does in one turn on a `DelayedAction`: 2 finishes work in half the turns, rounded up. The
 *  first answer is the rate. With no rule answering, a unit works at 1.
 */
export class WorkRate extends Rule<[Unit], number> {}

export default WorkRate;
