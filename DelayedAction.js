"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayedAction = void 0;
const Action_1 = require("./Action");
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Busy_1 = require("./Rules/Busy");
const delayedBusy_1 = require("./delayedBusy");
class DelayedAction extends Action_1.Action {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, pendingEffects = core_pending_effect_1.instance) {
        super(from, to, unit, ruleRegistry);
        this._pendingEffects = pendingEffects;
        this._turn = turn;
    }
    /**
     * Start work that finishes in `turns` turns.
     *
     * **`handler` is an identifier, where it used to be a callback.** That is the
     * whole change, and it is why a unit part-way through building a road can be
     * saved at all: a callback is a closure, and `Unit._busy` — the only field in
     * the engine that holds a `Rule` — is what `core-save-game` refused to encode.
     *
     * What is recorded instead is a `PendingEffect`: the debt this unit owes,
     * naming the handler that discharges it and carrying the turn it comes due.
     * The `Busy` rule is derived from that rather than from a closure, so it can
     * be derived again after a load — see `registerDelayedAction`, which pairs
     * the handler with the factory that rebuilds it.
     */
    perform(turns, handler, BusyRule = Busy_1.default) {
        const pendingEffect = new core_pending_effect_1.PendingEffect(handler, this.unit(), {
            endTurn: String(this._turn.value() + turns),
        });
        this._pendingEffects.register(pendingEffect);
        this.unit().setActive(false);
        this.unit().moves().set(0);
        this.unit().setBusy((0, delayedBusy_1.delayedBusy)(BusyRule, this, pendingEffect, this._pendingEffects, this.ruleRegistry(), this._turn));
    }
}
exports.DelayedAction = DelayedAction;
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map