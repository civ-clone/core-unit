"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDelayedAction = exports.MissingPendingEffectError = void 0;
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const BusyRegistry_1 = require("./BusyRegistry");
const delayedBusy_1 = require("./delayedBusy");
class MissingPendingEffectError extends Error {
}
exports.MissingPendingEffectError = MissingPendingEffectError;
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
const registerDelayedAction = ({ action, BusyRule, complete, handler }, pendingEffects = core_pending_effect_1.instance, busyRegistry = BusyRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) => {
    const apply = (pendingEffect, performed) => {
        var _a;
        const unit = pendingEffect.target();
        complete(unit, pendingEffect, (_a = performed) !== null && _a !== void 0 ? _a : action(unit));
    };
    pendingEffects.handler(handler, apply);
    busyRegistry.register(BusyRule, (unit, context) => {
        // The loading game's registries where the loader supplies them. The ones
        // this was registered with are the singletons, which belong to whichever
        // game was booted at import: loaded into another `Game`, the effect is in
        // that game's registry and nowhere else (civ-clone/web-renderer#245).
        const { pendingEffects: loadingPendingEffects = pendingEffects, rules: loadingRules = ruleRegistry, turn: loadingTurn = turn, } = context !== null && context !== void 0 ? context : {};
        const [pendingEffect] = loadingPendingEffects
            .getByTarget(unit)
            .filter((candidate) => candidate.handler() === handler);
        if (!pendingEffect) {
            // The unit saved as busy with this action but the debt that says when it
            // finishes is missing, so there is no honest rule to build. Failing names
            // the unit and the action; the alternative is inventing a completion turn.
            throw new MissingPendingEffectError(`${unit.id()} is busy with '${handler}' but carries no pending ` +
                'effect for it, so there is nothing to say when it finishes.');
        }
        // The rebuilt rule discharges through the loading registry, so that is
        // where the handler has to be known, or the unit fails when its work comes
        // due. A loading game's registry is fresh, and handlers are registered at
        // import, so only into the singleton.
        if (!loadingPendingEffects.handlers().includes(handler)) {
            loadingPendingEffects.handler(handler, apply);
        }
        // Built when the work finishes, not now: see `delayedBusy`.
        return (0, delayedBusy_1.delayedBusy)(BusyRule, () => action(unit), pendingEffect, loadingPendingEffects, loadingRules, loadingTurn);
    });
};
exports.registerDelayedAction = registerDelayedAction;
exports.default = exports.registerDelayedAction;
//# sourceMappingURL=registerDelayedAction.js.map