"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DelayedAction_turn;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayedAction = void 0;
const Action_1 = require("./Action");
const Moved_1 = require("./Rules/Moved");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Busy_1 = require("./Rules/Busy");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
class DelayedAction extends Action_1.Action {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) {
        super(from, to, unit, ruleRegistry);
        _DelayedAction_turn.set(this, void 0);
        __classPrivateFieldSet(this, _DelayedAction_turn, turn, "f");
    }
    perform(turns, action = () => { }) {
        const endTurn = __classPrivateFieldGet(this, _DelayedAction_turn, "f").value() + turns;
        this.unit().setActive(false);
        this.unit().moves().set(0);
        this.unit().setBusy(new Busy_1.default(new Criterion_1.default(() => __classPrivateFieldGet(this, _DelayedAction_turn, "f").value() === endTurn), new Effect_1.default((...args) => {
            const unit = this.unit();
            unit.setActive();
            unit.setBusy();
            unit.moves().set(this.unit().movement());
            action(...args);
            this.ruleRegistry().process(Moved_1.Moved, this.unit(), this);
        })));
    }
}
exports.DelayedAction = DelayedAction;
_DelayedAction_turn = new WeakMap();
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map