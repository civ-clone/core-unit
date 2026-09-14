import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { BusyRegistry } from './BusyRegistry';
import { Action } from './Action';
import Busy from './Rules/Busy';
import Unit from './Unit';
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
export declare class MissingPendingEffectError extends Error {}
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
export declare const registerDelayedAction: (
  { action, BusyRule, complete, handler }: DelayedActionDefinition,
  pendingEffects?: PendingEffectRegistry,
  busyRegistry?: BusyRegistry,
  ruleRegistry?: RuleRegistry,
  turn?: Turn
) => void;
export default registerDelayedAction;
