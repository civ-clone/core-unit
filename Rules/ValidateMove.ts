import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

export class ValidateMove extends Rule<[Unit, number], boolean> {}

export default ValidateMove;
