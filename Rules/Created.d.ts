import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
export declare class Created extends Rule<[Unit], void> {}
export default Created;
export interface ICreatedRegistry
  extends IRuleRegistry<Created, [Unit], void> {}
