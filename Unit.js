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
var _active, _busy, _city, _destroyed, _moves, _player, _ruleRegistry, _status, _tile, _waiting;
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
        _active.set(this, true);
        _busy.set(this, null);
        _city.set(this, void 0);
        _destroyed.set(this, false);
        _moves.set(this, new Yields_1.Moves());
        _player.set(this, void 0);
        _ruleRegistry.set(this, void 0);
        _status.set(this, null);
        _tile.set(this, void 0);
        _waiting.set(this, false);
        __classPrivateFieldSet(this, _city, city);
        __classPrivateFieldSet(this, _player, player);
        __classPrivateFieldSet(this, _tile, tile);
        __classPrivateFieldSet(this, _ruleRegistry, ruleRegistry);
        __classPrivateFieldGet(this, _ruleRegistry).process(Created_1.Created, this);
        this.addKey('actions', 'actionsForNeighbours', 'active', 'attack', 'busy', 'city', 'defence', 'movement', 'moves', 'player', 'status', 'tile', 'visibility', 'waiting');
    }
    action(action, ...args) {
        return action.perform(...args);
    }
    actions(to = __classPrivateFieldGet(this, _tile), from = __classPrivateFieldGet(this, _tile)) {
        if (typeof to === 'string') {
            to = from.getNeighbour(to);
        }
        return __classPrivateFieldGet(this, _ruleRegistry).process(Action_1.Action, this, to, from);
    }
    actionsForNeighbours(from = __classPrivateFieldGet(this, _tile)) {
        return from.getNeighbouringDirections().reduce((object, direction) => ({
            ...object,
            [direction]: __classPrivateFieldGet(this, _ruleRegistry).process(Action_1.Action, this, from.getNeighbour(direction), from),
        }), {});
    }
    activate() {
        __classPrivateFieldGet(this, _ruleRegistry).process(Activate_1.Activate, this);
    }
    active() {
        return __classPrivateFieldGet(this, _active);
    }
    setActive(active = true) {
        __classPrivateFieldSet(this, _active, active);
    }
    applyVisibility() {
        const rules = __classPrivateFieldGet(this, _ruleRegistry).get(Visibility_1.Visibility);
        __classPrivateFieldGet(this, _tile).getSurroundingArea(this.visibility().value())
            .forEach((tile) => rules
            .filter((rule) => rule.validate(tile, __classPrivateFieldGet(this, _player)))
            .forEach((rule) => rule.process(tile, __classPrivateFieldGet(this, _player))));
    }
    attack() {
        const [unitYield] = this.yield(new Yields_1.Attack());
        return unitYield;
    }
    busy() {
        return __classPrivateFieldGet(this, _busy);
    }
    setBusy(rule = null) {
        __classPrivateFieldSet(this, _busy, rule);
    }
    city() {
        return __classPrivateFieldGet(this, _city);
    }
    static createFromObject({ city = null, player, ruleRegistry = RuleRegistry_1.instance, tile, }) {
        return new this(city, player, tile, ruleRegistry);
    }
    defence() {
        const [unitYield] = this.yield(new Yields_1.Defence());
        return unitYield;
    }
    destroy(player = null) {
        __classPrivateFieldGet(this, _ruleRegistry).process(Destroyed_1.Destroyed, this, player);
    }
    destroyed() {
        return __classPrivateFieldGet(this, _destroyed);
    }
    setDestroyed() {
        __classPrivateFieldSet(this, _destroyed, true);
    }
    movement() {
        const [unitYield] = this.yield(new Yields_1.Movement());
        return unitYield;
    }
    moves() {
        return __classPrivateFieldGet(this, _moves);
    }
    player() {
        return __classPrivateFieldGet(this, _player);
    }
    status() {
        return __classPrivateFieldGet(this, _status);
    }
    setStatus(status) {
        __classPrivateFieldSet(this, _status, status);
    }
    tile() {
        return __classPrivateFieldGet(this, _tile);
    }
    setTile(tile) {
        __classPrivateFieldSet(this, _tile, tile);
    }
    visibility() {
        const [unitYield] = this.yield(new Yields_1.Visibility());
        return unitYield;
    }
    waiting() {
        return __classPrivateFieldGet(this, _waiting);
    }
    setWaiting(waiting = true) {
        __classPrivateFieldSet(this, _waiting, waiting);
    }
    yield(...yields) {
        const rules = __classPrivateFieldGet(this, _ruleRegistry).get(Yield_1.Yield);
        yields.forEach((unitYield) => rules
            .filter((rule) => rule.validate(this, unitYield))
            .forEach((rule) => rule.process(this, unitYield)));
        return yields;
    }
}
exports.Unit = Unit;
_active = new WeakMap(), _busy = new WeakMap(), _city = new WeakMap(), _destroyed = new WeakMap(), _moves = new WeakMap(), _player = new WeakMap(), _ruleRegistry = new WeakMap(), _status = new WeakMap(), _tile = new WeakMap(), _waiting = new WeakMap();
exports.default = Unit;
//# sourceMappingURL=Unit.js.map