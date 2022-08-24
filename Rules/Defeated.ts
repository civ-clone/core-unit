import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Action from '../Action';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

type defeatedArgs = [Unit, Unit, Action];

export class Defeated extends Rule<defeatedArgs, void> {}

export default Defeated;

export interface IDefeatedRegistry
  extends IRuleRegistry<Defeated, defeatedArgs, void> {}
