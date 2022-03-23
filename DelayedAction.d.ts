import { Action, IAction } from './Action';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Busy from './Rules/Busy';
import Tile from '@civ-clone/core-world/Tile';
import Unit from './Unit';
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
  perform(
    turns: number,
    action?: (...args: any[]) => void,
    BusyRule?: typeof Busy
  ): void;
}
export default DelayedAction;
