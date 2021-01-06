import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

export class ValidateMove extends Rule<[Unit, number], boolean> {}

export default ValidateMove;

export interface IValidateMoveRegistry
  extends IRuleRegistry<ValidateMove, [Unit, number], boolean> {}
