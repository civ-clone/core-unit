"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitYield = exports.Yield = exports.BaseYield = void 0;
const Yields_1 = require("../Yields");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
class BaseYield extends Rule_1.default {
}
exports.BaseYield = BaseYield;
class Yield extends Rule_1.default {
}
exports.Yield = Yield;
exports.default = Yield;
const unitYield = (UnitType, attack = 1, defence = 1, movement = 1, visibility = 1) => [
    ...[
        [Yields_1.Attack, attack],
        [Yields_1.Defence, defence],
        [Yields_1.Movement, movement],
        [Yields_1.Visibility, visibility],
    ].flatMap(([YieldType, value]) => [
        new Yield(new Criterion_1.default((unit) => unit instanceof UnitType), new Criterion_1.default((unit, unitYield) => unitYield instanceof YieldType), new Effect_1.default((unit, unitYield) => unitYield.set(value))),
        new BaseYield(new Criterion_1.default((BaseUnitType) => BaseUnitType === UnitType), new Criterion_1.default((BaseUnitType, unitYield) => unitYield instanceof YieldType), new Effect_1.default((BaseUnitType, unitYield) => unitYield.set(value))),
    ]),
];
exports.unitYield = unitYield;
//# sourceMappingURL=Yield.js.map