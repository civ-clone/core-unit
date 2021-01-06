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
var _from, _ruleRegistry, _to, _unit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
class Action extends DataObject_1.DataObject {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance) {
        super();
        _from.set(this, void 0);
        _ruleRegistry.set(this, void 0);
        _to.set(this, void 0);
        _unit.set(this, void 0);
        __classPrivateFieldSet(this, _from, from);
        __classPrivateFieldSet(this, _ruleRegistry, ruleRegistry);
        __classPrivateFieldSet(this, _to, to);
        __classPrivateFieldSet(this, _unit, unit);
        this.addKey('from', 'to');
    }
    forUnit(unit) {
        return new this.constructor(__classPrivateFieldGet(this, _from), __classPrivateFieldGet(this, _to), unit, __classPrivateFieldGet(this, _ruleRegistry));
    }
    from() {
        return __classPrivateFieldGet(this, _from);
    }
    perform(...args) { }
    ruleRegistry() {
        return __classPrivateFieldGet(this, _ruleRegistry);
    }
    to() {
        return __classPrivateFieldGet(this, _to);
    }
    unit() {
        return __classPrivateFieldGet(this, _unit);
    }
}
exports.Action = Action;
_from = new WeakMap(), _ruleRegistry = new WeakMap(), _to = new WeakMap(), _unit = new WeakMap();
exports.default = Action;
//# sourceMappingURL=Action.js.map