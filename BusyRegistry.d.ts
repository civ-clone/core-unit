import Busy from './Rules/Busy';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Unit from './Unit';
/**
 * The game a unit is being rebuilt into, as far as a factory needs to know it.
 *
 * Named after `Game`'s own slots, so a loader hands over the `Game` itself —
 * this package cannot import `core-game`, which depends on it.
 *
 * **Why a factory needs it at all.** Factories are registered at import, so
 * the registries they close over are the module singletons. That is the right
 * game only when the load is into `defaultGame`. Loaded into any other `Game` —
 * `core-save-game`'s `gameForLoad`, which has fresh runtime registries — a
 * delayed action's factory looked for the unit's `PendingEffect` in the
 * singleton registry, while `hydrate` had registered it in the loading game's.
 * The singleton held only the *saved* game's effect, owed to the saved unit
 * rather than the restored one, so a unit part-way through fortifying failed
 * to load with `MissingPendingEffectError`, naming an effect the file did
 * contain (civ-clone/web-renderer#245).
 *
 * Every field is optional: a factory falls back to what it was registered
 * with, which is what a caller passing nothing has always had.
 */
export type BusyContext = {
  pendingEffects?: PendingEffectRegistry;
  rules?: RuleRegistry;
  turn?: Turn;
};
/**
 * How to rebuild a `Busy` rule for a unit after a load.
 *
 * A factory rather than the class, because construction is where the meaning
 * is: `Fortified` is built with `new Criterion(() => false)` at the call site,
 * `Stowed` builds its own, and `GoTo`'s criterion closes over the unit and the
 * path it is following. `new Class()` cannot express any of that.
 *
 * `context` is the game being loaded into — see `BusyContext`. Optional, so a
 * factory can still be called as `factory(unit)`; one that reads no registry
 * can ignore it.
 */
export type BusyFactory = (unit: Unit, context?: BusyContext) => Busy;
export declare class UnknownBusyError extends Error {}
/**
 * `Busy` rule identity → how to rebuild one.
 *
 * **Why a registry of factories and not saved fields.** `Unit._busy` is the
 * only field in the engine that holds a `Rule` — measured: 1,055 registered
 * rules, 4,007 reachable entities, and exactly two fields, both
 * `<Unit>._busy`. A rule is a closure, so it cannot be written to a file;
 * `core-save-game`'s `encode` refuses outright rather than emit
 * `{ $class: '' }` for one.
 *
 * What makes a lookup sufficient — where it is sufficient — is that the class
 * carries no instance state. Almost every `Busy` subclass is literally
 * `extends Busy {}`. But the *declaration* is not where to look: the state
 * hides in the **construction**, at the call site, and for eleven of the
 * fourteen it does. `GoTo` was originally judged the one exception and judged
 * wrongly in both directions — see below.
 *
 * So a save records *which* `Busy` a unit has, and the ruleset says how to
 * rebuild it. Where there was no instance state, nothing is lost.
 *
 * ## What this covers, and the one it does not
 *
 * Fourteen `Busy` identities, all of them covered, in three groups:
 *
 * - **Ten delayed actions** — `BuildingIrrigation`, `BuildingMine`,
 *   `BuildingRoad`, `BuildingRailroad`, `ClearingForest`, `ClearingJungle`,
 *   `ClearingSwamp`, `PlantingForest`, `Fortifying`, `Pillaging`. A factory
 *   alone cannot rebuild these, because `DelayedAction.perform` closes over
 *   two things a save has no record of:
 *
 *   ```ts
 *   const endTurn = this._turn.value() + turns;
 *   ```
 *
 *   `endTurn` says *when* the work finishes and the action says *what it
 *   does*. So they go through `registerDelayedAction`, which pairs the factory
 *   with a `PendingEffect` carrying the completion turn. Registering one of
 *   these here directly would mean inventing a completion turn, and a unit
 *   three turns into a road would load either finished or never finishing.
 *
 * - **Three that are genuinely stateless** — `Fortified` (`base-unit-action-
 *   fortify`), `Sleeping` (`…-sleep`) and `Stowed` (`…-embark`). Their criteria
 *   are pure functions of the unit and the world — "is an enemy visible",
 *   "never" — and any durable fact is saved separately: `Fortify` registers a
 *   `Fortified` *`UnitImprovement`* alongside the busy rule, and that is
 *   ordinary state. Each registers a plain factory.
 *
 * - **`GoTo`**, which took two changes elsewhere before it could be one of
 *   them. Its criterion is `unit.tile() === path.end()` and the path lives in
 *   a `StrategyNote`, which was not a `DataObject` — so despite
 *   `core-save-game` dispositioning `strategyNotes` as `'state'`, nothing was
 *   written and there was nothing to rebuild the criterion from. `StrategyNote`
 *   is an entity now, and the note holds the remaining `Tile`s rather than the
 *   `Path`, because `encode` writes a registry held as a field as an array of
 *   its members and cannot record the class around it. Its criterion reads the
 *   note each time instead of closing over it, which leaves nothing in the
 *   rule but the unit.
 *
 * Counting them is worth doing rather than grepping for them: `grep -r` does
 * **not** follow symlinks, and `node_modules/@civ-clone/*` are symlinks into
 * pnpm's store. A `-r` search for `extends DelayedAction` there returns
 * nothing at all, which is how `Fortify` and then `Pillage` were both missed.
 * Use `grep -R`.
 */
export declare class BusyRegistry {
  private _factories;
  /**
   * Register how to rebuild a `Busy` rule.
   *
   * Keyed by `typeNameOf(BusyType)`, so an explicit `static type` on the class
   * wins — which `Fortified` needs, because
   * `base-unit-improvement-fortified` declares a `UnitImprovement` of the same
   * name and a save could not tell them apart.
   */
  register(
    BusyType: {
      name: string;
      type?: string;
    },
    factory: BusyFactory
  ): void;
  has(identity: string): boolean;
  identities(): string[];
  /**
   * Rebuild the named `Busy` for a unit.
   *
   * Throws on an unknown identity rather than returning `null`. A unit that
   * saved as fortified and loads as idle is a wrong answer a player would have
   * to notice for themselves — it moves on its next turn, and nothing reports
   * why. Failing the load names the rule and the plugin that is missing.
   *
   * Pass the game the unit is being loaded into as `context`, or the rule is
   * rebuilt against the registries its factory was registered with.
   */
  rebuild(identity: string, unit: Unit, context?: BusyContext): Busy;
}
export declare const instance: BusyRegistry;
export default BusyRegistry;
