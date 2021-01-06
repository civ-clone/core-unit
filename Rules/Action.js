"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitAction = exports.isNeighbouringTile = exports.isCurrentTile = exports.hasMovesLeft = exports.Action = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
class Action extends Rule_1.default {
}
exports.Action = Action;
exports.default = Action;
exports.hasMovesLeft = new Criterion_1.default((unit) => unit.moves().value() >= 0.1);
exports.isCurrentTile = new Criterion_1.default((unit, to, from = unit.tile()) => from === to);
exports.isNeighbouringTile = new Criterion_1.default((unit, to, from = unit.tile()) => to.isNeighbourOf(from));
const unitAction = (ActionType, unitTypes, ...additionalPriorities) => [
    new Action(new Criterion_1.default((unit) => unitTypes.some((UnitType) => unit instanceof UnitType)), ...additionalPriorities, new Effect_1.default((unit, to, from) => new ActionType(from, to, unit))),
];
exports.unitAction = unitAction;
//# sourceMappingURL=Action.js.map