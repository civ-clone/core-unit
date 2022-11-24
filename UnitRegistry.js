"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.UnitRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const Unit_1 = require("./Unit");
class UnitRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        super(Unit_1.default);
    }
    getByCity(city) {
        return this.filter((unit) => unit.city() === city && !unit.destroyed());
    }
    getByPlayer(player, includeDestroyed = false) {
        if (includeDestroyed) {
            return this.getBy('player', player);
        }
        return this.filter((unit) => unit.player() === player && !unit.destroyed());
    }
    getByTile(tile) {
        return this.filter((unit) => unit.tile() === tile && !unit.destroyed());
    }
}
exports.UnitRegistry = UnitRegistry;
exports.instance = new UnitRegistry();
exports.default = UnitRegistry;
//# sourceMappingURL=UnitRegistry.js.map