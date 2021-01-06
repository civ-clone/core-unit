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
        return this.getBy('city', city);
    }
    getByPlayer(player) {
        return this.getBy('player', player);
    }
    getByTile(tile) {
        return this.getBy('tile', tile);
    }
}
exports.UnitRegistry = UnitRegistry;
exports.instance = new UnitRegistry();
exports.default = UnitRegistry;
//# sourceMappingURL=UnitRegistry.js.map