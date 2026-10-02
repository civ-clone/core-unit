import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import { Action } from './Action';
import Busy from './Rules/Busy';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
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
 *
 * `action` may be a function that builds the action, called only when the work
 * finishes. A load has no performed action to hand over and has to build one,
 * and an `Action` is an entity: constructing it during the load takes the next
 * id from a counter `hydrate` has just restored, so saving the loaded game
 * again wrote a different file (civ-clone/web-renderer#245).
 */
export declare const delayedBusy: (
  BusyRule: typeof Busy,
  action: Action | (() => Action),
  pendingEffect: PendingEffect,
  pendingEffects: PendingEffectRegistry,
  ruleRegistry: RuleRegistry,
  turn: Turn
) => Busy;
export default delayedBusy;
