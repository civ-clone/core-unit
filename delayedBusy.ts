import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import { Action } from './Action';
import Busy from './Rules/Busy';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from './Rules/Moved';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Unit from './Unit';

/**
 * The `Busy` rule for a delayed action, built from its `PendingEffect`.
 *
 * One function, used from two places, which is the point: `perform` calls it
 * when the action starts and `BusyRegistry` calls it when a save is loaded. If
 * the two built the rule separately they would drift, and the drift would only
 * show up in a loaded game.
 *
 * Everything the rule needs now comes from arguments rather than a closure:
 * the completion turn from the effect's data, the completion behaviour from the
 * handler the effect names, and the action from the caller. That is what makes
 * it reconstructible at all.
 */
export const delayedBusy = (
  BusyRule: typeof Busy,
  action: Action,
  pendingEffect: PendingEffect,
  pendingEffects: PendingEffectRegistry,
  ruleRegistry: RuleRegistry,
  turn: Turn
): Busy =>
  new BusyRule(
    // `>=`, not `===`. The original compared exactly, which means a unit whose
    // completion turn slips past — a turn skipped, or a save loaded on a later
    // turn — stays busy for ever with nothing to say why. `>=` cannot get
    // stuck, and on the turn it is due the two agree.
    new Criterion(
      (): boolean => turn.value() >= Number(pendingEffect.data().endTurn)
    ),
    new Effect((): void => {
      const unit: Unit = action.unit();

      unit.setActive();
      unit.setBusy();

      // Discharging runs the handler the effect names, which is where the
      // completion behaviour now lives — `new Irrigation(unit.tile())` and so
      // on. It used to be a closure passed to `perform`, which is exactly why
      // a part-built road could not be saved.
      //
      // With the action, so completion writes to the registries it was
      // constructed with — see `registerDelayedAction`'s `complete`.
      pendingEffects.discharge(pendingEffect, action);

      ruleRegistry.process(Moved, unit, action);
    })
  );

export default delayedBusy;
