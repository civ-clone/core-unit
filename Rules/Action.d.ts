import Criterion from '@civ-clone/core-rule/Criterion';
import Priority from '@civ-clone/core-rule/Priority';
import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitAction from '../Action';
export declare class Action extends Rule<[Unit, Tile, Tile], UnitAction> {}
export default Action;
export declare const hasMovesLeft: Criterion<[unit: Unit]>;
export declare const isCurrentTile: Criterion;
export declare const isNeighbouringTile: Criterion;
export declare const unitAction: (
  ActionType: typeof UnitAction,
  unitTypes: (typeof Unit)[],
  ...additionalPriorities: (Criterion | Priority)[]
) => Action[];
