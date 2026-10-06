"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const Yields_1 = require("./Yields");
const Buildable_1 = require("@civ-clone/core-city-build/Buildable");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Action_1 = require("./Rules/Action");
const Activate_1 = require("./Rules/Activate");
const Created_1 = require("./Rules/Created");
const Destroyed_1 = require("./Rules/Destroyed");
const Transferred_1 = require("./Rules/Transferred");
const Visibility_1 = require("./Rules/Visibility");
const Yield_1 = require("./Rules/Yield");
class Unit extends Buildable_1.Buildable {
    constructor(city, player, tile, ruleRegistry = RuleRegistry_1.instance) {
        super();
        this._active = true;
        this._busy = null;
        this._destroyed = false;
        this._moves = new Yields_1.Moves();
        this._status = null;
        this._waiting = false;
        this._city = city;
        this._player = player;
        this._tile = tile;
        this._ruleRegistry = ruleRegistry;
        this.addKey('actions', 'actionsForNeighbours', 'active', 'attack', 'busy', 'city', 'defence', 'destroyed', 'movement', 'moves', 'player', 'status', 'tile', 'visibility', 'waiting');
        this._ruleRegistry.process(Created_1.default, this);
    }
    static build(city, ruleRegistry = RuleRegistry_1.instance) {
        return new this(city, city.player(), city.tile(), ruleRegistry);
    }
    action(action, ...args) {
        return action.perform(...args);
    }
    actions(to = this._tile, from = this._tile) {
        if (typeof to === 'string') {
            to = from.getNeighbour(to);
        }
        return this._ruleRegistry.process(Action_1.default, this, to, from);
    }
    actionsForNeighbours(from = this._tile) {
        return from.getNeighbouringDirections().reduce((object, direction) => ({
            ...object,
            [direction]: this._ruleRegistry.process(Action_1.default, this, from.getNeighbour(direction), from),
        }), {});
    }
    activate() {
        this._ruleRegistry.process(Activate_1.default, this);
    }
    active() {
        return this._active;
    }
    setActive(active = true) {
        this._active = active;
    }
    applyVisibility() {
        this._tile
            .getSurroundingArea(this.visibility().value())
            .forEach((tile) => {
            this._ruleRegistry.process(Visibility_1.default, tile, this._player);
        });
    }
    attack() {
        const [unitYield] = this.yield(new Yields_1.Attack());
        return unitYield;
    }
    busy() {
        return this._busy;
    }
    setBusy(rule = null) {
        this._busy = rule;
    }
    city() {
        return this._city;
    }
    /**
     * Hands the unit to `player`, homed in `city` or in none, as a bribed or defecting unit changes sides. It stays the
     * same unit, so its id and anything that refers to it stay valid; what else changes with it (what it loses, when it
     * can next move) is up to the `Transferred` rules.
     */
    transfer(player, city = null) {
        const previousPlayer = this._player;
        this._player = player;
        // As `setCity` insists: a unit's home is one of its owner's cities, or none.
        this._city = (city !== null && city.player() === player ? city : null);
        this._ruleRegistry.process(Transferred_1.default, this, player, previousPlayer);
    }
    setCity(city) {
        if (this.player() !== city.player()) {
            return;
        }
        this._city = city;
    }
    defence() {
        const [unitYield] = this.yield(new Yields_1.Defence());
        return unitYield;
    }
    destroy(player = null) {
        this._ruleRegistry.process(Destroyed_1.default, this, player);
    }
    destroyed() {
        return this._destroyed;
    }
    setDestroyed() {
        this._destroyed = true;
    }
    movement() {
        const [unitYield] = this.yield(new Yields_1.Movement());
        return unitYield;
    }
    moves() {
        return this._moves;
    }
    player() {
        return this._player;
    }
    status() {
        return this._status;
    }
    setStatus(status) {
        this._status = status;
    }
    tile() {
        return this._tile;
    }
    setTile(tile) {
        this._tile = tile;
    }
    visibility() {
        const [unitYield] = this.yield(new Yields_1.Visibility());
        return unitYield;
    }
    waiting() {
        return this._waiting;
    }
    setWaiting(waiting = true) {
        this._waiting = waiting;
    }
    yield(...yields) {
        const rules = this._ruleRegistry.get(Yield_1.default);
        yields.forEach((unitYield) => rules
            .filter((rule) => rule.validate(this, unitYield))
            .forEach((rule) => rule.process(this, unitYield)));
        return yields;
    }
}
exports.Unit = Unit;
Unit.transient = ['_ruleRegistry'];
exports.default = Unit;
//# sourceMappingURL=Unit.js.map