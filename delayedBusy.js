"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedBusy = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("./Rules/Moved");
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
const delayedBusy = (BusyRule, action, pendingEffect, pendingEffects, ruleRegistry, turn) => new BusyRule(
// `>=`, not `===`. The original compared exactly, which means a unit whose
// completion turn slips past — a turn skipped, or a save loaded on a later
// turn — stays busy for ever with nothing to say why. `>=` cannot get
// stuck, and on the turn it is due the two agree.
new Criterion_1.default(() => turn.value() >= Number(pendingEffect.data().endTurn)), new Effect_1.default(() => {
    const performed = typeof action === 'function' ? action() : action;
    const unit = performed.unit();
    unit.setActive();
    unit.setBusy();
    // Discharging runs the handler the effect names, which is where the
    // completion behaviour now lives — `new Irrigation(unit.tile())` and so
    // on. It used to be a closure passed to `perform`, which is exactly why
    // a part-built road could not be saved.
    //
    // With the action, so completion writes to the registries it was
    // constructed with — see `registerDelayedAction`'s `complete`.
    pendingEffects.discharge(pendingEffect, performed);
    ruleRegistry.process(Moved_1.default, unit, performed);
}));
exports.delayedBusy = delayedBusy;
exports.default = exports.delayedBusy;
//# sourceMappingURL=delayedBusy.js.map