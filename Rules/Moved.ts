import Action from '../Action';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

export class Moved extends Rule<[Unit, Action], void> {}

export default Moved;

export interface IMovedRegistry
  extends IRuleRegistry<Moved, [Unit, Action], void> {}
