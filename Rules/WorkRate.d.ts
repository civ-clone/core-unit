import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
/**
 * How many turns' work `unit` does in one turn on a `DelayedAction`: 2 finishes work in half the turns, rounded up. The
 *  first answer is the rate. With no rule answering, a unit works at 1, and a rate that isn't above 0 and finite is
 *  ignored.
 *
 * A rule declines through its `Criterion`, not by returning `undefined`: `process` runs every rule whose criteria
 *  match and returns all their answers. The first answer that isn't `undefined` is used, but every matching rule's
 *  effect still runs, so only one rule should answer for a unit.
 */
export declare class WorkRate extends Rule<[Unit], number> {}
export default WorkRate;
