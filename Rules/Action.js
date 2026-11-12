"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitAction = exports.isNeighbouringTile = exports.isCurrentTile = exports.hasMovesLeft = exports.Action = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
const UnitTrait_1 = require("../UnitTrait");
class Action extends Rule_1.default {
}
exports.Action = Action;
exports.default = Action;
exports.hasMovesLeft = new Criterion_1.default((unit) => unit.moves().value() >= 0.1);
exports.isCurrentTile = new Criterion_1.default((unit, to, from = unit.tile()) => from === to);
exports.isNeighbouringTile = new Criterion_1.default((unit, to, from = unit.tile()) => to.isNeighbourOf(from));
/**
 * An `Action` rule offering `ActionType` to a unit that is one of `unitTypes` or has one of the traits among them
 *  (`unitAction(Fortify, [Fortifies])`), when `additionalPriorities` agree.
 */
const unitAction = (ActionType, unitTypes, ...additionalPriorities) => {
    const traits = unitTypes.filter((type) => (0, UnitTrait_1.isTraitType)(type)), classes = unitTypes.filter((type) => !(0, UnitTrait_1.isTraitType)(type));
    return [
        new Action(new Criterion_1.default((unit) => classes.some((UnitType) => unit instanceof UnitType) || traits.some((Trait) => unit.hasTrait(Trait))), ...additionalPriorities, new Effect_1.default((unit, to, from) => new ActionType(from, to, unit))),
    ];
};
exports.unitAction = unitAction;
//# sourceMappingURL=Action.js.map