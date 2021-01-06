import Action from '../Action';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

export class MovementCost extends Rule<[Unit, Action], number> {}

export default MovementCost;

export interface IMovementCostRegistry
  extends IRuleRegistry<MovementCost, [Unit, Action], number> {}
