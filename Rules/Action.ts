import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import Rule from '@civ-clone/core-rule/Rule';
import { TraitType, isTraitType } from '../UnitTrait';
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

/**
 * An `Action` rule offering `ActionType` to a unit that is one of `unitTypes` or has one of the traits among them
 *  (`unitAction(Fortify, [Fortifies])`), when `additionalPriorities` agree.
 */
export const unitAction = (
  ActionType: typeof UnitAction,
  unitTypes: (typeof Unit | TraitType)[],
  ...additionalPriorities: (Criterion | Priority)[]
): Action[] => {
  const traits = unitTypes.filter((type): type is TraitType =>
      isTraitType(type)
    ),
    classes = unitTypes.filter(
      (type): type is typeof Unit => !isTraitType(type)
    );

  return [
    new Action(
      new Criterion(
        (unit: Unit): boolean =>
          classes.some(
            (UnitType: typeof Unit): boolean => unit instanceof UnitType
          ) || traits.some((Trait: TraitType): boolean => unit.hasTrait(Trait))
      ),
      ...additionalPriorities,
      new Effect(
        (unit: Unit, to: Tile, from: Tile): UnitAction =>
          new ActionType(from, to, unit)
      )
    ),
  ];
};
