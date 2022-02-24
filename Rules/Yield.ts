import { Attack, Defence, Movement, Visibility } from '../Yields';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
import YieldValue from '@civ-clone/core-yield/Yield';

type BaseYieldArgs = [typeof Unit, YieldValue];

export class BaseYield extends Rule<BaseYieldArgs, void> {}

export interface IBaseYieldRegistry
  extends IRuleRegistry<BaseYield, BaseYieldArgs, void> {}

type YieldArgs = [Unit, YieldValue];

export class Yield extends Rule<YieldArgs, void> {}

export default Yield;

export interface IYieldRegistry extends IRuleRegistry<Yield, YieldArgs, void> {}

export const unitYield: (
  UnitType: typeof Unit,
  attack: number,
  defence: number,
  movement: number,
  visibility: number
) => (Yield | BaseYield)[] = (
  UnitType: typeof Unit,
  attack: number = 1,
  defence: number = 1,
  movement: number = 1,
  visibility: number = 1
): (Yield | BaseYield)[] => [
  ...(
    [
      [Attack, attack],
      [Defence, defence],
      [Movement, movement],
      [Visibility, visibility],
    ] as [typeof YieldValue, number][]
  ).flatMap(
    ([YieldType, value]: [typeof YieldValue, number]): (
      | Yield
      | BaseYield
    )[] => [
      new Yield(
        new Criterion((unit: Unit): boolean => unit instanceof UnitType),
        new Criterion(
          (unit: Unit, unitYield: YieldValue): boolean =>
            unitYield instanceof YieldType
        ),
        new Effect((unit: Unit, unitYield: YieldValue): void =>
          unitYield.set(value)
        )
      ),
      new BaseYield(
        new Criterion(
          (BaseUnitType: typeof Unit): boolean => BaseUnitType === UnitType
        ),
        new Criterion(
          (BaseUnitType: typeof Unit, unitYield: YieldValue): boolean =>
            unitYield instanceof YieldType
        ),
        new Effect((BaseUnitType: typeof Unit, unitYield: YieldValue): void =>
          unitYield.set(value)
        )
      ),
    ]
  ),
];
