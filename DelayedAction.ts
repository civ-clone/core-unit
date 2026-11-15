import { Action, IAction } from './Action';
import {
  PendingEffect,
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import Busy from './Rules/Busy';
import Tile from '@civ-clone/core-world/Tile';
import Unit from './Unit';
import WorkRate from './Rules/WorkRate';
import { delayedBusy } from './delayedBusy';

export interface IDelayedAction extends IAction {
  perform(turns: number, handler: string, BusyRule?: typeof Busy): void;
}

export class DelayedAction extends Action implements IDelayedAction {
  private _pendingEffects: PendingEffectRegistry;
  private _turn: Turn;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    turn: Turn = turnInstance,
    pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this._pendingEffects = pendingEffects;
    this._turn = turn;
  }

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
   *
   * `turns` is the work at a rate of 1. The first `WorkRate` answer (that
   * isn't `undefined`) for the unit, a rate `r` above 0, makes it
   * `ceil(turns / r)` turns: at 2,
   * 5 turns' work takes 3, as a team that does twice the work a turn finishes
   * in the first turn its work reaches what is needed. With no answer, `turns`
   * is used as given.
   */
  perform(turns: number, handler: string, BusyRule: typeof Busy = Busy): void {
    const rate = this.ruleRegistry()
        .process(WorkRate, this.unit())
        .find((answer: number | undefined): boolean => answer !== undefined),
      pendingEffect = new PendingEffect(handler, this.unit(), {
        endTurn: String(
          this._turn.value() +
            (rate !== undefined && rate > 0 && Number.isFinite(rate)
              ? Math.ceil(turns / rate)
              : turns)
        ),
      });

    this._pendingEffects.register(pendingEffect);

    this.unit().setActive(false);
    this.unit().moves().set(0);

    this.unit().setBusy(
      delayedBusy(
        BusyRule,
        this,
        pendingEffect,
        this._pendingEffects,
        this.ruleRegistry(),
        this._turn
      )
    );
  }
}

export default DelayedAction;
