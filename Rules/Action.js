"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitAction = exports.isNeighbouringTile = exports.isCurrentTile = exports.hasMovesLeft = exports.Action = exports.UnitActionTypeError = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
const UnitTrait_1 = require("../UnitTrait");
const Unit_1 = require("../Unit");
/** Thrown by `unitAction` for an entry that is neither a `Unit` class nor a `UnitTrait` class. */
class UnitActionTypeError extends TypeError {
}
exports.UnitActionTypeError = UnitActionTypeError;
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
    classes.forEach((type) => {
        var _a;
        // A class from a second copy of core-unit is neither, and would silently never match.
        if (typeof type !== 'function' ||
            (type !== Unit_1.default && !(type.prototype instanceof Unit_1.default))) {
            throw new UnitActionTypeError(`unitAction(${ActionType.name}): ${String((_a = type === null || type === void 0 ? void 0 : type.name) !== null && _a !== void 0 ? _a : type)} is neither a Unit class nor a UnitTrait class (is a second copy of @civ-clone/core-unit installed?).`);
        }
    });
    const matches = traits.length === 0
        ? (unit) => classes.some((UnitType) => unit instanceof UnitType)
        : (unit) => classes.some((UnitType) => unit instanceof UnitType) || traits.some((Trait) => unit.hasTrait(Trait));
    return [
        new Action(new Criterion_1.default(matches), ...additionalPriorities, new Effect_1.default((unit, to, from) => new ActionType(from, to, unit))),
    ];
};
exports.unitAction = unitAction;
//# sourceMappingURL=Action.js.map