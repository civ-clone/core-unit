"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const UnitRegistry_1 = require("../UnitRegistry");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const Player_1 = require("@civ-clone/core-player/Player");
const getAdditionalData = (unitRegistry = UnitRegistry_1.instance) => [
    new AdditionalData_1.default(Player_1.default, 'units', (player) => unitRegistry.getByPlayer(player)),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=units.js.map