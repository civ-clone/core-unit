import Criterion from '@civ-clone/core-rule/Criterion';
import Priority from '@civ-clone/core-rule/Priority';
import Rule from '@civ-clone/core-rule/Rule';
import { TraitType } from '../UnitTrait';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitAction from '../Action';
export declare class Action extends Rule<[Unit, Tile, Tile], UnitAction> {}
export default Action;
export declare const hasMovesLeft: Criterion<[unit: Unit]>;
export declare const isCurrentTile: Criterion;
export declare const isNeighbouringTile: Criterion;
/**
 * An `Action` rule offering `ActionType` to a unit that is one of `unitTypes` or has one of the traits among them
 *  (`unitAction(Fortify, [Fortifies])`), when `additionalPriorities` agree.
 */
export declare const unitAction: (
  ActionType: typeof UnitAction,
  unitTypes: (typeof Unit | TraitType)[],
  ...additionalPriorities: (Criterion | Priority)[]
) => Action[];
