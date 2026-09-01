"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
class Action extends DataObject_1.DataObject {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance) {
        super();
        this._from = from;
        this._ruleRegistry = ruleRegistry;
        this._to = to;
        this._unit = unit;
        this.addKey('from', 'to');
    }
    forUnit(unit) {
        return new this.constructor(this._from, this._to, unit, this._ruleRegistry);
    }
    from() {
        return this._from;
    }
    perform(...args) { }
    ruleRegistry() {
        return this._ruleRegistry;
    }
    to() {
        return this._to;
    }
    unit() {
        return this._unit;
    }
}
exports.Action = Action;
exports.default = Action;
//# sourceMappingURL=Action.js.map