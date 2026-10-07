"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.UnitRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const Unit_1 = require("./Unit");
// A home city of `null` or `undefined` is a key like any other here, as the scan compared with `===`; the index leaves
//  those keys out, so they stand in for them.
const noHome = Symbol('no home'), undefinedHome = Symbol('undefined home'), homeKey = (city) => city === null ? noHome : city === undefined ? undefinedHome : city;
class UnitRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        super(Unit_1.default);
        // A unit's tile, home and owner all change, and `Unit` says so (`keysChanged`) when they do. Scanning every unit for
        //  each lookup was 17% of a late-game turn (civ-clone/web-renderer#308).
        this._byCity = this.index((unit) => homeKey(unit.city()));
        this._byPlayer = this.index((unit) => unit.player());
        this._byTile = this.index((unit) => unit.tile());
    }
    getByCity(city) {
        return this._byCity
            .get(homeKey(city))
            .filter((unit) => !unit.destroyed());
    }
    getByPlayer(player, includeDestroyed = false) {
        const units = this._byPlayer.get(player);
        if (includeDestroyed) {
            return units;
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