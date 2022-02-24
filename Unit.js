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
var _Unit_active, _Unit_busy, _Unit_city, _Unit_destroyed, _Unit_moves, _Unit_player, _Unit_ruleRegistry, _Unit_status, _Unit_tile, _Unit_waiting;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const Action_1 = require("./Rules/Action");
const Activate_1 = require("./Rules/Activate");
const Yields_1 = require("./Yields");
const Created_1 = require("./Rules/Created");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
const Destroyed_1 = require("./Rules/Destroyed");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Visibility_1 = require("./Rules/Visibility");
const Yield_1 = require("./Rules/Yield");
class Unit extends DataObject_1.DataObject {
    constructor(city, player, tile, ruleRegistry = RuleRegistry_1.instance) {
        super();
        _Unit_active.set(this, true);
        _Unit_busy.set(this, null);
        _Unit_city.set(this, void 0);
        _Unit_destroyed.set(this, false);
        _Unit_moves.set(this, new Yields_1.Moves());
        _Unit_player.set(this, void 0);
        _Unit_ruleRegistry.set(this, void 0);
        _Unit_status.set(this, null);
        _Unit_tile.set(this, void 0);
        _Unit_waiting.set(this, false);
        __classPrivateFieldSet(this, _Unit_city, city, "f");
        __classPrivateFieldSet(this, _Unit_player, player, "f");
        __classPrivateFieldSet(this, _Unit_tile, tile, "f");
        __classPrivateFieldSet(this, _Unit_ruleRegistry, ruleRegistry, "f");
        this.addKey('actions', 'actionsForNeighbours', 'active', 'attack', 'busy', 'city', 'defence', 'movement', 'moves', 'player', 'status', 'tile', 'visibility', 'waiting');
        __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").process(Created_1.Created, this);
    }
    action(action, ...args) {
        return action.perform(...args);
    }
    actions(to = __classPrivateFieldGet(this, _Unit_tile, "f"), from = __classPrivateFieldGet(this, _Unit_tile, "f")) {
        if (typeof to === 'string') {
            to = from.getNeighbour(to);
        }
        return __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").process(Action_1.Action, this, to, from);
    }
    actionsForNeighbours(from = __classPrivateFieldGet(this, _Unit_tile, "f")) {
        return from.getNeighbouringDirections().reduce((object, direction) => ({
            ...object,
            [direction]: __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").process(Action_1.Action, this, from.getNeighbour(direction), from),
        }), {});
    }
    activate() {
        __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").process(Activate_1.Activate, this);
    }
    active() {
        return __classPrivateFieldGet(this, _Unit_active, "f");
    }
    setActive(active = true) {
        __classPrivateFieldSet(this, _Unit_active, active, "f");
    }
    applyVisibility() {
        const rules = __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").get(Visibility_1.Visibility);
        __classPrivateFieldGet(this, _Unit_tile, "f")
            .getSurroundingArea(this.visibility().value())
            .forEach((tile) => rules
            .filter((rule) => rule.validate(tile, __classPrivateFieldGet(this, _Unit_player, "f")))
            .forEach((rule) => rule.process(tile, __classPrivateFieldGet(this, _Unit_player, "f"))));
    }
    attack() {
        const [unitYield] = this.yield(new Yields_1.Attack());
        return unitYield;
    }
    busy() {
        return __classPrivateFieldGet(this, _Unit_busy, "f");
    }
    setBusy(rule = null) {
        __classPrivateFieldSet(this, _Unit_busy, rule, "f");
    }
    city() {
        return __classPrivateFieldGet(this, _Unit_city, "f");
    }
    static createFromObject({ city = null, player, ruleRegistry = RuleRegistry_1.instance, tile, }) {
        return new this(city, player, tile, ruleRegistry);
    }
    defence() {
        const [unitYield] = this.yield(new Yields_1.Defence());
        return unitYield;
    }
    destroy(player = null) {
        __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").process(Destroyed_1.Destroyed, this, player);
    }
    destroyed() {
        return __classPrivateFieldGet(this, _Unit_destroyed, "f");
    }
    setDestroyed() {
        __classPrivateFieldSet(this, _Unit_destroyed, true, "f");
    }
    movement() {
        const [unitYield] = this.yield(new Yields_1.Movement());
        return unitYield;
    }
    moves() {
        return __classPrivateFieldGet(this, _Unit_moves, "f");
    }
    player() {
        return __classPrivateFieldGet(this, _Unit_player, "f");
    }
    status() {
        return __classPrivateFieldGet(this, _Unit_status, "f");
    }
    setStatus(status) {
        __classPrivateFieldSet(this, _Unit_status, status, "f");
    }
    tile() {
        return __classPrivateFieldGet(this, _Unit_tile, "f");
    }
    setTile(tile) {
        __classPrivateFieldSet(this, _Unit_tile, tile, "f");
    }
    visibility() {
        const [unitYield] = this.yield(new Yields_1.Visibility());
        return unitYield;
    }
    waiting() {
        return __classPrivateFieldGet(this, _Unit_waiting, "f");
    }
    setWaiting(waiting = true) {
        __classPrivateFieldSet(this, _Unit_waiting, waiting, "f");
    }
    yield(...yields) {
        const rules = __classPrivateFieldGet(this, _Unit_ruleRegistry, "f").get(Yield_1.Yield);
        yields.forEach((unitYield) => rules
            .filter((rule) => rule.validate(this, unitYield))
            .forEach((rule) => rule.process(this, unitYield)));
        return yields;
    }
}
exports.Unit = Unit;
_Unit_active = new WeakMap(), _Unit_busy = new WeakMap(), _Unit_city = new WeakMap(), _Unit_destroyed = new WeakMap(), _Unit_moves = new WeakMap(), _Unit_player = new WeakMap(), _Unit_ruleRegistry = new WeakMap(), _Unit_status = new WeakMap(), _Unit_tile = new WeakMap(), _Unit_waiting = new WeakMap();
exports.default = Unit;
//# sourceMappingURL=Unit.js.map