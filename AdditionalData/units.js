"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const UnitRegistry_1 = require("../UnitRegistry");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const City_1 = require("@civ-clone/core-city/City");
const Player_1 = require("@civ-clone/core-player/Player");
const Tile_1 = require("@civ-clone/core-world/Tile");
const getAdditionalData = (unitRegistry = UnitRegistry_1.instance) => [
    new AdditionalData_1.default(City_1.default, 'units', (city) => unitRegistry.getByCity(city)),
    new AdditionalData_1.default(Player_1.default, 'units', (player) => unitRegistry.getByPlayer(player, true)),
    new AdditionalData_1.default(Tile_1.default, 'units', (tile) => unitRegistry.getByTile(tile)),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=units.js.map