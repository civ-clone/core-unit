import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Action from './Action';
export declare class DelayedAction extends Action {
  perform(turns: number, action?: (...args: any[]) => void, turn?: Turn): void;
}
export default DelayedAction;
