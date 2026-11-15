"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkRate = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * How many turns' work `unit` does in one turn on a `DelayedAction`: 2 finishes work in half the turns, rounded up. The
 *  first answer is the rate. With no rule answering, a unit works at 1.
 */
class WorkRate extends Rule_1.default {
}
exports.WorkRate = WorkRate;
exports.default = WorkRate;
//# sourceMappingURL=WorkRate.js.map