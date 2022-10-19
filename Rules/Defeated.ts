import Action from '../Action';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

export class Defeated extends Rule<[Unit, Unit, Action], void> {}

export default Defeated;
