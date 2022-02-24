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
var _Action_from, _Action_ruleRegistry, _Action_to, _Action_unit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
class Action extends DataObject_1.DataObject {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance) {
        super();
        _Action_from.set(this, void 0);
        _Action_ruleRegistry.set(this, void 0);
        _Action_to.set(this, void 0);
        _Action_unit.set(this, void 0);
        __classPrivateFieldSet(this, _Action_from, from, "f");
        __classPrivateFieldSet(this, _Action_ruleRegistry, ruleRegistry, "f");
        __classPrivateFieldSet(this, _Action_to, to, "f");
        __classPrivateFieldSet(this, _Action_unit, unit, "f");
        this.addKey('from', 'to');
    }
    forUnit(unit) {
        return new this.constructor(__classPrivateFieldGet(this, _Action_from, "f"), __classPrivateFieldGet(this, _Action_to, "f"), unit, __classPrivateFieldGet(this, _Action_ruleRegistry, "f"));
    }
    from() {
        return __classPrivateFieldGet(this, _Action_from, "f");
    }
    perform(...args) { }
    ruleRegistry() {
        return __classPrivateFieldGet(this, _Action_ruleRegistry, "f");
    }
    to() {
        return __classPrivateFieldGet(this, _Action_to, "f");
    }
    unit() {
        return __classPrivateFieldGet(this, _Action_unit, "f");
    }
}
exports.Action = Action;
_Action_from = new WeakMap(), _Action_ruleRegistry = new WeakMap(), _Action_to = new WeakMap(), _Action_unit = new WeakMap();
exports.default = Action;
//# sourceMappingURL=Action.js.map