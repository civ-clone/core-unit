import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';

export class Busy extends Rule<any[], void> {}

export default Busy;

export interface IBusyRegistry extends IRuleRegistry<Busy, any[], void> {}
