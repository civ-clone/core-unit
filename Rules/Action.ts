import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import Rule from '@civ-clone/core-rule/Rule';
import { TraitType, isTraitType } from '../UnitTrait';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitAction from '../Action';

/** Thrown by `unitAction` for an entry that is neither a `Unit` class nor a `UnitTrait` class. */
export class UnitActionTypeError extends TypeError {}

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

  classes.forEach((type: typeof Unit): void => {
    // A class from a second copy of core-unit is neither, and would silently never match.
    if (
      typeof type !== 'function' ||
      (type !== Unit && !(type.prototype instanceof Unit))
    ) {
      throw new UnitActionTypeError(
        `unitAction(${ActionType.name}): ${String(
          (type as { name?: string })?.name ?? type
        )} is neither a Unit class nor a UnitTrait class (is a second copy of @civ-clone/core-unit installed?).`
      );
    }
  });

  const matches =
    traits.length === 0
      ? (unit: Unit): boolean =>
          classes.some(
            (UnitType: typeof Unit): boolean => unit instanceof UnitType
          )
      : (unit: Unit): boolean =>
          classes.some(
            (UnitType: typeof Unit): boolean => unit instanceof UnitType
          ) || traits.some((Trait: TraitType): boolean => unit.hasTrait(Trait));

  return [
    new Action(
      new Criterion(matches),
      ...additionalPriorities,
      new Effect(
        (unit: Unit, to: Tile, from: Tile): UnitAction =>
          new ActionType(from, to, unit)
      )
    ),
  ];
};
