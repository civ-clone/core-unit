import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
export declare class Defeated extends Rule<[Unit, Unit], void> {}
export default Defeated;
export interface IDefeatedRegistry
  extends IRuleRegistry<Defeated, [Unit, Unit], void> {}
