import { Action, IAction } from './Action';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Busy from './Rules/Busy';
import Tile from '@civ-clone/core-world/Tile';
import Unit from './Unit';
export interface IDelayedAction extends IAction {
  perform(turns: number, handler: string, BusyRule?: typeof Busy): void;
}
export declare class DelayedAction extends Action implements IDelayedAction {
  private _pendingEffects;
  private _turn;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry?: RuleRegistry,
    turn?: Turn,
    pendingEffects?: PendingEffectRegistry
  );
  /**
   * Start work that finishes in `turns` turns.
   *
   * **`handler` is an identifier, where it used to be a callback.** That is the
   * whole change, and it is why a unit part-way through building a road can be
   * saved at all: a callback is a closure, and `Unit._busy` — the only field in
   * the engine that holds a `Rule` — is what `core-save-game` refused to encode.
   *
   * What is recorded instead is a `PendingEffect`: the debt this unit owes,
   * naming the handler that discharges it and carrying the turn it comes due.
   * The `Busy` rule is derived from that rather than from a closure, so it can
   * be derived again after a load — see `registerDelayedAction`, which pairs
   * the handler with the factory that rebuilds it.
   */
  perform(turns: number, handler: string, BusyRule?: typeof Busy): void;
}
export default DelayedAction;
