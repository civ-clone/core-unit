import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
export declare class Activate extends Rule<[Unit], void> {}
export default Activate;
export interface IActivateRegistry
  extends IRuleRegistry<Activate, [Unit], void> {}
