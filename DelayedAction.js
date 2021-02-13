"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _turn;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayedAction = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Action_1 = require("./Action");
const Busy_1 = require("./Rules/Busy");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
class DelayedAction extends Action_1.default {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) {
        super(from, to, unit, ruleRegistry);
        _turn.set(this, void 0);
        __classPrivateFieldSet(this, _turn, turn);
    }
    perform(turns, action = () => { }) {
        const endTurn = __classPrivateFieldGet(this, _turn).value() + turns;
        this.unit().setActive(false);
        this.unit().moves().set(0);
        this.unit().setBusy(new Busy_1.default(new Criterion_1.default(() => __classPrivateFieldGet(this, _turn).value() === endTurn), new Effect_1.default((...args) => {
            const unit = this.unit();
            action(...args);
            unit.setActive();
            unit.setBusy();
            unit.moves().set(this.unit().movement());
        })));
    }
}
exports.DelayedAction = DelayedAction;
_turn = new WeakMap();
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map