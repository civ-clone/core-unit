import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Action from './Action';
import Unit from './Unit';
import Tile from '@civ-clone/core-world/Tile';
export declare class DelayedAction extends Action {
  #private;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry?: RuleRegistry,
    turn?: Turn
  );
  perform(turns: number, action?: (...args: any[]) => void): void;
}
export default DelayedAction;
