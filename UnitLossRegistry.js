"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.UnitLossRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const UnitLoss_1 = require("./UnitLoss");
/**
 * The units each player has lost, by type: one `UnitLoss` per player and type, made the first time one is lost, so a
 * game (or a save made before this existed) starts with none.
 */
class UnitLossRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        super(UnitLoss_1.default);
    }
    getByPlayer(player) {
        return this.getBy('player', player);
    }
    record(player, UnitType) {
        const existing = this.getByPlayer(player).find((unitLoss) => unitLoss.unit() === UnitType), unitLoss = existing !== null && existing !== void 0 ? existing : new UnitLoss_1.default(player, UnitType);
        if (!existing) {
            this.register(unitLoss);
        }
        unitLoss.increment();
        return unitLoss;
    }
}
exports.UnitLossRegistry = UnitLossRegistry;
exports.instance = new UnitLossRegistry();
exports.default = UnitLossRegistry;
//# sourceMappingURL=UnitLossRegistry.js.map