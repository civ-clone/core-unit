"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.UnitRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const keysChanged_1 = require("./lib/keysChanged");
const Unit_1 = require("./Unit");
// The index buckets below, one per tile, home city and owner. Each is kept in the order its units were registered,
//  which is the order `filter` would have returned them in, so a lookup gives the same answer in the same order as the
//  scan it replaces. Scanning every unit for each lookup was 17% of a late-game turn (civ-clone/web-renderer#308).
class Buckets {
    constructor(order) {
        this._buckets = new Map();
        this._order = order;
    }
    add(key, unit) {
        const bucket = this._buckets.get(key);
        if (!bucket) {
            this._buckets.set(key, [unit]);
            return;
        }
        const position = this._order.get(unit);
        let low = 0, high = bucket.length;
        while (low < high) {
            const middle = (low + high) >>> 1;
            if (this._order.get(bucket[middle]) < position) {
                low = middle + 1;
            }
            else {
                high = middle;
            }
        }
        bucket.splice(low, 0, unit);
    }
    get(key) {
        var _a;
        return (_a = this._buckets.get(key)) !== null && _a !== void 0 ? _a : [];
    }
    remove(key, unit) {
        const bucket = this._buckets.get(key);
        if (!bucket) {
            return;
        }
        const index = bucket.indexOf(unit);
        if (index > -1) {
            bucket.splice(index, 1);
        }
        if (bucket.length === 0) {
            this._buckets.delete(key);
        }
    }
}
class UnitRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        super(Unit_1.default);
        // When each unit was registered, which is its place in `entries()`: registering appends, and a unit unregistered
        //  and registered again goes to the end, as it does there.
        this._order = new Map();
        this._nextOrder = 0;
        // The keys each unit was filed under, so it can be taken out of those buckets after its own have changed.
        this._filed = new Map();
        this._byCity = new Buckets(this._order);
        this._byPlayer = new Buckets(this._order);
        this._byTile = new Buckets(this._order);
    }
    register(...units) {
        units.forEach((unit) => {
            super.register(unit);
            if (this._order.has(unit)) {
                return;
            }
            this._order.set(unit, this._nextOrder++);
            this.file(unit);
            (0, keysChanged_1.watchKeys)(unit, this);
        });
    }
    unregister(...units) {
        super.unregister(...units);
        units.forEach((unit) => {
            if (!this._order.has(unit)) {
                return;
            }
            (0, keysChanged_1.unwatchKeys)(unit, this);
            this.unfile(unit);
            this._order.delete(unit);
        });
    }
    keysChanged(unit) {
        if (!this._filed.has(unit)) {
            return;
        }
        this.unfile(unit);
        this.file(unit);
    }
    reindex(unit) {
        super.reindex(unit);
        this.keysChanged(unit);
    }
    file(unit) {
        // As they are, without coercing: the scan compared with `===`, so `null` and `undefined` stay different keys.
        const keys = [unit.city(), unit.player(), unit.tile()];
        this._filed.set(unit, keys);
        this._byCity.add(keys[0], unit);
        this._byPlayer.add(keys[1], unit);
        this._byTile.add(keys[2], unit);
    }
    unfile(unit) {
        const keys = this._filed.get(unit);
        if (!keys) {
            return;
        }
        this._byCity.remove(keys[0], unit);
        this._byPlayer.remove(keys[1], unit);
        this._byTile.remove(keys[2], unit);
        this._filed.delete(unit);
    }
    getByCity(city) {
        return this._byCity
            .get(city)
            .filter((unit) => !unit.destroyed());
    }
    getByPlayer(player, includeDestroyed = false) {
        const units = this._byPlayer.get(player);
        if (includeDestroyed) {
            return units.slice();
        }
        return units.filter((unit) => !unit.destroyed());
    }
    getByTile(tile) {
        return this._byTile
            .get(tile)
            .filter((unit) => !unit.destroyed());
    }
}
exports.UnitRegistry = UnitRegistry;
exports.instance = new UnitRegistry();
exports.default = UnitRegistry;
//# sourceMappingURL=UnitRegistry.js.map