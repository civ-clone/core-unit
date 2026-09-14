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
import { BusyRegistry, instance as busyRegistryInstance } from './BusyRegistry';
import { Action } from './Action';
import Busy from './Rules/Busy';
import Unit from './Unit';
import { delayedBusy } from './delayedBusy';

export type DelayedActionDefinition = {
  /** The `Busy` rule this action puts its unit into. */
  BusyRule: typeof Busy;
  /**
   * Rebuild the action, so a restored completion still has one to hand to the
   * `Moved` rules.
   *
   * A factory rather than the class, because the constructors genuinely differ
   * — `ClearForest` takes a `TerrainFeatureRegistry` as its fifth argument
   * where `BuildIrrigation` takes a `Turn`. `civ1-unit` already handles that by
   * constructing each group separately; a single `new ActionType(...)` here
   * would pass a `Turn` where a registry was expected for four of the eight.
   */
  action: (unit: Unit) => Action;
  /** `package:name`, recorded in the save in place of the closure. */
  handler: string;
  /** What finishing actually does — build the irrigation, clear the forest. */
  complete: (unit: Unit, pendingEffect: PendingEffect) => void;
};

export class MissingPendingEffectError extends Error {}

/**
 * Everything a delayed action needs in order to survive a save, in one call.
 *
 * ```ts
 * registerDelayedAction({
 *   BusyRule: BuildingIrrigation,
 *   handler: 'base-unit-action-build-irrigation:complete',
 *   action: (unit) => new BuildIrrigation(unit.tile(), unit.tile(), unit),
 *   complete: (unit) => new Irrigation(unit.tile()),
 * });
 * ```
 *
 * Two registrations, deliberately paired here rather than left to each
 * package: the **handler**, which says what finishing does, and the
 * **`Busy` factory**, which rebuilds the in-progress rule after a load. Split
 * across two call sites they would be easy to half-do, and a package with a
 * handler but no factory produces a unit that loads idle while still owing the
 * work.
 *
 * The rebuilt action can use the unit's own tile for both `from` and `to`,
 * because every delayed action in the engine is performed in place —
 * `isCurrentTile` is one of their criteria. It exists only to be handed to the
 * `Moved` rules, which read `action instanceof Move` and emit `unit:moved`;
 * without it a restored completion would skip the renderer's redraw and the
 * visibility reapply.
 */
export const registerDelayedAction = (
  { action, BusyRule, complete, handler }: DelayedActionDefinition,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance,
  busyRegistry: BusyRegistry = busyRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  turn: Turn = turnInstance
): void => {
  pendingEffects.handler(handler, (pendingEffect: PendingEffect): void =>
    complete(pendingEffect.target() as Unit, pendingEffect)
  );

  busyRegistry.register(BusyRule, (unit: Unit): Busy => {
    const [pendingEffect] = pendingEffects
      .getByTarget(unit)
      .filter(
        (candidate: PendingEffect): boolean => candidate.handler() === handler
      );

    if (!pendingEffect) {
      // The unit saved as busy with this action but the debt that says when it
      // finishes is missing, so there is no honest rule to build. Failing names
      // the unit and the action; the alternative is inventing a completion turn.
      throw new MissingPendingEffectError(
        `${unit.id()} is busy with '${handler}' but carries no pending ` +
          'effect for it, so there is nothing to say when it finishes.'
      );
    }

    return delayedBusy(
      BusyRule,
      action(unit),
      pendingEffect,
      pendingEffects,
      ruleRegistry,
      turn
    );
  });
};

export default registerDelayedAction;
