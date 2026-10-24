"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitLoss = void 0;
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
/**
 * How many units of one type a player has lost. An entity so that it's saved with the game; a ruleset decides what
 * counts as a loss.
 */
class UnitLoss extends DataObject_1.DataObject {
    constructor(player, UnitType) {
        super();
        this._count = 0;
        this.addKey('count', 'player', 'unit');
        this._player = player;
        this._unit = UnitType;
    }
    count() {
        return this._count;
    }
    increment() {
        this._count++;
    }
    player() {
        return this._player;
    }
    unit() {
        return this._unit;
    }
}
exports.UnitLoss = UnitLoss;
exports.default = UnitLoss;
//# sourceMappingURL=UnitLoss.js.map