import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitAction from '../Action';

export class Action extends Rule<[Unit, Tile, Tile], UnitAction> {}

export default Action;

export const hasMovesLeft = new Criterion(
  (unit: Unit): boolean => unit.moves().value() >= 0.1
);

export const isCurrentTile: Criterion = new Criterion(
  (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
);

export const isNeighbouringTile: Criterion = new Criterion(
  (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
    to.isNeighbourOf(from)
);

export const unitAction: (
  ActionType: typeof UnitAction,
  unitTypes: typeof Unit[],
  ...additionalProperties: (Criterion | Priority)[]
) => Action[] = (
  ActionType: typeof UnitAction,
  unitTypes: typeof Unit[],
  ...additionalPriorities: (Criterion | Priority)[]
): Action[] => [
  new Action(
    new Criterion((unit: Unit): boolean =>
      unitTypes.some(
        (UnitType: typeof Unit): boolean => unit instanceof UnitType
      )
    ),
    ...additionalPriorities,
    new Effect(
      (unit: Unit, to: Tile, from: Tile): UnitAction =>
        new ActionType(from, to, unit)
    )
  ),
];
