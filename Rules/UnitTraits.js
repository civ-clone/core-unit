"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitTraits = exports.UnitTraits = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * The traits a unit type has. Validated and processed with the unit's class, never an instance, and read through
 *  `hasTrait`/`traitsOf` (or `unit.hasTrait()`), which keep the answer per class until a `UnitTraits` rule is
 *  registered, removed or switched. So a rule's criteria and effect must depend on the class alone: never on game
 *  state (it isn't asked again when that changes), and never on traits (asking about the class being resolved throws
 *  `UnitTraitCycleError`).
 *
 * Don't subclass it: a rule of a subclass would be returned by `get(UnitTraits)`, but registering or removing one
 *  doesn't clear `RuleRegistry`'s cache for `UnitTraits`, so the traits wouldn't follow it.
 */
class UnitTraits extends Rule_1.default {
}
exports.UnitTraits = UnitTraits;
exports.default = UnitTraits;
/**
 * Declares that `UnitType`, and any subclass of it, has `traits`: one rule per trait, with the id
 *  `<idPrefix>/<UnitType>/<trait.key()>`, so a `RuleSet` can supersede a single trait of a single type:
 *
 * ```ts
 * ruleRegistry.register(
 *   ...unitTraits('civ1-unit:unit/trait', Diplomat, IgnoresZoneOfControl, NonCombatant),
 *   ...unitTraits('civ1-unit:unit/trait', Carrier, new Carries(Air))
 * );
 * ```
 *
 * A trait class stands for `new Trait()`. Declaring on an abstract class gives the trait to every class beneath it, so
 *  a game that wants a trait on some subclasses only should declare it on those.
 */
const unitTraits = (idPrefix, UnitType, ...traits) => traits.map((trait) => {
    const instance = typeof trait === 'function'
        ? new trait()
        : trait;
    return new UnitTraits(`${idPrefix}/${UnitType.name}/${instance.key()}`, new Criterion_1.default((Candidate) => Candidate === UnitType ||
        Object.prototype.isPrototypeOf.call(UnitType, Candidate)), new Effect_1.default(() => [instance]));
});
exports.unitTraits = unitTraits;
//# sourceMappingURL=UnitTraits.js.map