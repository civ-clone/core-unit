"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.BusyRegistry = exports.UnknownBusyError = void 0;
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
class UnknownBusyError extends Error {
}
exports.UnknownBusyError = UnknownBusyError;
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
 * carries no instance state. Twelve of the thirteen `Busy` subclasses are
 * literally `extends Busy {}`. `GoTo` looks like the exception and is not: the
 * path it follows lives in a `StrategyNote`, which is saved as ordinary state,
 * so the rule is only a "still going" predicate over something restored. But
 * the *construction* is where state hides, and for eight of them it does —
 * see below.
 *
 * So a save records *which* `Busy` a unit has, and the ruleset says how to
 * rebuild it. Nothing is lost, because there was no instance state to lose.
 *
 * ## What this does *not* cover
 *
 * Five of the thirteen are stateless in that sense: `Fortified`, `Fortifying`,
 * `Stowed`, `Sleeping` and `GoTo`. Their criteria are pure functions of the
 * world and the unit — "is an enemy visible", "have I reached the end of my
 * path", "never" — and any durable fact is saved separately. `Fortify` even
 * registers a `Fortified` *`UnitImprovement`* alongside the busy rule, and
 * that is ordinary saved state.
 *
 * The other eight come from `DelayedAction.perform`, and a factory cannot
 * rebuild them. That method closes over two things a save has no record of:
 *
 * ```ts
 * const endTurn = this._turn.value() + turns;
 *
 * new BusyRule(
 *   new Criterion(() => this._turn.value() === endTurn),
 *   new Effect(() => { …; action(…); … })   // `action` builds the irrigation
 * );
 * ```
 *
 * `endTurn` says *when* the work finishes and `action` says *what it does*.
 * Neither is derivable from the unit, so `BusyRegistry.register` must not be
 * used for them — a factory would have to invent a completion turn, and a unit
 * three turns into building a road would load either finished or never
 * finishing.
 *
 * That is not a gap in this registry; it is the same problem `PendingEffect`
 * exists for. A delayed action *is* a pending effect — "at turn N, do X" — so
 * it wants a handler identifier and `{ unit, endTurn }` as data, which is
 * exactly the shape `03-save-format.md` defines. Darwin's Voyage was thought
 * to be the only unserialisable continuation in the engine; it is one of nine.
 */
class BusyRegistry {
    constructor() {
        this._factories = new Map();
    }
    /**
     * Register how to rebuild a `Busy` rule.
     *
     * Keyed by `typeNameOf(BusyType)`, so an explicit `static type` on the class
     * wins — which `Fortified` needs, because
     * `base-unit-improvement-fortified` declares a `UnitImprovement` of the same
     * name and a save could not tell them apart.
     */
    register(BusyType, factory) {
        this._factories.set((0, DataObject_1.typeNameOf)(BusyType), factory);
    }
    has(identity) {
        return this._factories.has(identity);
    }
    identities() {
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
    rebuild(identity, unit) {
        const factory = this._factories.get(identity);
        if (!factory) {
            throw new UnknownBusyError(`No way to rebuild the '${identity}' busy state. The package that ` +
                'registers it is not loaded, so a unit that was saved in that ' +
                'state cannot be restored. Known: ' +
                (this.identities().join(', ') || '(none)'));
        }
        return factory(unit);
    }
}
exports.BusyRegistry = BusyRegistry;
exports.instance = new BusyRegistry();
exports.default = BusyRegistry;
//# sourceMappingURL=BusyRegistry.js.map