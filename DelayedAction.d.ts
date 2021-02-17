import { Action, IAction } from './Action';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Unit from './Unit';
import Tile from '@civ-clone/core-world/Tile';
export interface IDelayedAction extends IAction {
  perform(turns: number, action: (...args: any[]) => void): void;
}
export declare class DelayedAction extends Action implements IDelayedAction {
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
