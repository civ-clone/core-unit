import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
import YieldValue from '@civ-clone/core-yield/Yield';
declare type BaseYieldArgs = [typeof Unit, YieldValue];
export declare class BaseYield extends Rule<BaseYieldArgs, void> {}
export interface IBaseYieldRegistry
  extends IRuleRegistry<BaseYield, BaseYieldArgs, void> {}
declare type YieldArgs = [Unit, YieldValue];
export declare class Yield extends Rule<YieldArgs, void> {}
export default Yield;
export interface IYieldRegistry extends IRuleRegistry<Yield, YieldArgs, void> {}
export declare const unitYield: (
  UnitType: typeof Unit,
  attack: number,
  defence: number,
  movement: number,
  visibility: number
) => (Yield | BaseYield)[];
