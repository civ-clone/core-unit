import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
export declare class Destroyed extends Rule<[Unit, Player | null], void> {}
export default Destroyed;
export interface IDestroyedRegistry
  extends IRuleRegistry<Destroyed, [Unit, Player | null], void> {}
