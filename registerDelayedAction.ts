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
import {
  BusyContext,
  BusyRegistry,
  instance as busyRegistryInstance,
} from './BusyRegistry';
import { Action } from './Action';
import Busy from './Rules/Busy';
import Unit from './Unit';
import { delayedBusy } from './delayedBusy';

export type DelayedActionDefinition<A extends Action = Action> = {
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
  action: (unit: Unit) => A;
  /** `package:name`, recorded in the save in place of the closure. */
  handler: string;
  /**
   * What finishing actually does — build the irrigation, clear the forest.
   *
   * `action` is the action that was **performed**, when there is one: the
   * `Busy` rule that discharges the effect holds it, and passes it through.
   * Use its collaborators rather than reaching for singletons. The original
   * completions were closures bound to `this`, so they wrote to the registries
   * the action was constructed with; the first conversion to `PendingEffect`
   * swapped seven of them for `…Instance` singletons, which the game never
   * noticed (it uses the singletons) and every test with its own registries
   * did — `Fortified` landed in a registry the test was not looking at.
   *
   * After a load there is no performed action, so it is rebuilt with the
   * `action` factory above — defaults, which is all a load can do until
   * plugins register against a game rather than at import.
   *
   * Third rather than first so that packages written against the two-argument
   * form keep working: they ignore it.
   */
  complete: (unit: Unit, pendingEffect: PendingEffect, action: A) => void;
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
export const registerDelayedAction = <A extends Action = Action>(
  { action, BusyRule, complete, handler }: DelayedActionDefinition<A>,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance,
  busyRegistry: BusyRegistry = busyRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  turn: Turn = turnInstance
): void => {
  const apply = (pendingEffect: PendingEffect, performed?: unknown): void => {
    const unit = pendingEffect.target() as Unit;

    complete(unit, pendingEffect, (performed as A | undefined) ?? action(unit));
  };

  pendingEffects.handler(handler, apply);

  busyRegistry.register(BusyRule, (unit: Unit, context?: BusyContext): Busy => {
    // The loading game's registries where the loader supplies them. The ones
    // this was registered with are the singletons, which belong to whichever
    // game was booted at import: loaded into another `Game`, the effect is in
    // that game's registry and nowhere else (civ-clone/web-renderer#245).
    const {
      pendingEffects: loadingPendingEffects = pendingEffects,
      rules: loadingRules = ruleRegistry,
      turn: loadingTurn = turn,
    } = context ?? {};

    const [pendingEffect] = loadingPendingEffects
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

    // The rebuilt rule discharges through the loading registry, so that is
    // where the handler has to be known, or the unit fails when its work comes
    // due. A loading game's registry is fresh, and handlers are registered at
    // import, so only into the singleton.
    if (!loadingPendingEffects.handlers().includes(handler)) {
      loadingPendingEffects.handler(handler, apply);
    }

    // Built when the work finishes, not now: see `delayedBusy`.
    return delayedBusy(
      BusyRule,
      (): A => action(unit),
      pendingEffect,
      loadingPendingEffects,
      loadingRules,
      loadingTurn
    );
  });
};

export default registerDelayedAction;
