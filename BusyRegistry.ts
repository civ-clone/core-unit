import Busy from './Rules/Busy';
import Unit from './Unit';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

/**
 * How to rebuild a `Busy` rule for a unit after a load.
 *
 * A factory rather than the class, because construction is where the meaning
 * is: `Fortified` is built with `new Criterion(() => false)` at the call site,
 * `Stowed` builds its own, and `GoTo`'s criterion closes over the unit and the
 * path it is following. `new Class()` cannot express any of that.
 */
export type BusyFactory = (unit: Unit) => Busy;

export class UnknownBusyError extends Error {}

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
 * Fourteen `Busy` identities, in three groups:
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
 * - **`GoTo`, which is not covered.** Its criterion is
 *   `unit.tile() === path.end()`, and the path it compares against lives in a
 *   `StrategyNote`. `StrategyNote` is **not** a `DataObject` — it implements
 *   `IStrategyNote` and nothing more — so despite `core-save-game`
 *   dispositioning `strategyNotes` as `'state'`, no path is written to the
 *   file and there is nothing to rebuild the criterion from. A unit saved
 *   mid-journey therefore fails to load, loudly, which is the correct answer
 *   until either `StrategyNote` becomes saveable or `GoTo` keeps its path
 *   somewhere that is.
 *
 * Counting them is worth doing rather than grepping for them: `grep -r` does
 * **not** follow symlinks, and `node_modules/@civ-clone/*` are symlinks into
 * pnpm's store. A `-r` search for `extends DelayedAction` there returns
 * nothing at all, which is how `Fortify` and then `Pillage` were both missed.
 * Use `grep -R`.
 */
export class BusyRegistry {
  private _factories: Map<string, BusyFactory> = new Map();

  /**
   * Register how to rebuild a `Busy` rule.
   *
   * Keyed by `typeNameOf(BusyType)`, so an explicit `static type` on the class
   * wins — which `Fortified` needs, because
   * `base-unit-improvement-fortified` declares a `UnitImprovement` of the same
   * name and a save could not tell them apart.
   */
  register(BusyType: { name: string; type?: string }, factory: BusyFactory) {
    this._factories.set(typeNameOf(BusyType), factory);
  }

  has(identity: string): boolean {
    return this._factories.has(identity);
  }

  identities(): string[] {
    return [...this._factories.keys()].sort();
  }

  /**
   * Rebuild the named `Busy` for a unit.
   *
   * Throws on an unknown identity rather than returning `null`. A unit that
   * saved as fortified and loads as idle is a wrong answer a player would have
   * to notice for themselves — it moves on its next turn, and nothing reports
   * why. Failing the load names the rule and the plugin that is missing.
   */
  rebuild(identity: string, unit: Unit): Busy {
    const factory = this._factories.get(identity);

    if (!factory) {
      throw new UnknownBusyError(
        `No way to rebuild the '${identity}' busy state. The package that ` +
          'registers it is not loaded, so a unit that was saved in that ' +
          'state cannot be restored. Known: ' +
          (this.identities().join(', ') || '(none)')
      );
    }

    return factory(unit);
  }
}

export const instance: BusyRegistry = new BusyRegistry();

export default BusyRegistry;
