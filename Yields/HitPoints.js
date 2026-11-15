"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HitPoints = void 0;
const Yield_1 = require("@civ-clone/core-yield/Yield");
/**
 * How much damage a unit can take before it is destroyed: its maximum. What it has left is this less its `damage()`
 *  (see `Unit.hitPoints()`). A game that registers no `Yield` rule for it leaves it at 0, and its units never take
 *  damage.
 */
class HitPoints extends Yield_1.default {
}
exports.HitPoints = HitPoints;
exports.default = HitPoints;
//# sourceMappingURL=HitPoints.js.map