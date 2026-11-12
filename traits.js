"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isA = exports.traitCriterion = exports.traitsOf = exports.hasTrait = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const UnitTraits_1 = require("./Rules/UnitTraits");
const none = Object.freeze([]);
const memo = new WeakMap();
const build = (UnitType, rules) => {
    const resolved = new Map(), 
    // Every rule validated before any is processed, as `RuleRegistry.process` does.
    matched = rules.filter((rule) => rule.validate(UnitType));
    matched.forEach((rule) => {
        const traits = rule.process(UnitType);
        if (!Array.isArray(traits)) {
            return;
        }
        traits.forEach((trait) => {
            let prototype = Object.getPrototypeOf(trait);
            // So `hasTrait(unit, Parent)` finds a `Child` trait, and `traitsOf(unit, UnitTrait)` finds them all.
            while (prototype !== null && prototype !== Object.prototype) {
                const TraitClass = prototype.constructor, list = resolved.get(TraitClass);
                if (list === undefined) {
                    resolved.set(TraitClass, [trait]);
                }
                else if (!list.includes(trait)) {
                    list.push(trait);
                }
                prototype = Object.getPrototypeOf(prototype);
            }
        });
    });
    resolved.forEach((list) => {
        Object.freeze(list);
    });
    return resolved;
};
const resolve = (unit, ruleRegistry) => {
    const UnitType = (typeof unit === 'function' ? unit : unit.constructor), rules = ruleRegistry.get(UnitTraits_1.default);
    let revision = memo.get(ruleRegistry);
    if (revision === undefined || revision.rules !== rules) {
        revision = { rules, byClass: new Map() };
        memo.set(ruleRegistry, revision);
    }
    let resolved = revision.byClass.get(UnitType);
    if (resolved === undefined) {
        resolved = build(UnitType, rules);
        revision.byClass.set(UnitType, resolved);
    }
    return resolved;
};
/**
 * Whether a unit, or a unit class, has `Trait` (or a subclass of it) according to the `UnitTraits` rules in
 *  `ruleRegistry`. The registry is required: a game's own `RuleRegistry` holds its declarations, and asking another
 *  would silently find none. A unit has `unit.hasTrait()`, which uses its own.
 *
 * The answer is kept per class and registry until a `UnitTraits` rule changes, so a lookup allocates nothing.
 */
const hasTrait = (unit, Trait, ruleRegistry) => resolve(unit, ruleRegistry).has(Trait);
exports.hasTrait = hasTrait;
/**
 * The traits of a unit, or a unit class, that are a `Trait`: every `Carries` of a carrier, say. In declaration order,
 *  each once, frozen and shared: an empty result is always the same empty array.
 */
const traitsOf = (unit, Trait, ruleRegistry) => { var _a; return ((_a = resolve(unit, ruleRegistry).get(Trait)) !== null && _a !== void 0 ? _a : none); };
exports.traitsOf = traitsOf;
/** A criterion, for a rule whose first argument is a `Unit`, that the unit has `Trait`. */
const traitCriterion = (Trait) => new Criterion_1.default((unit) => unit.hasTrait(Trait));
exports.traitCriterion = traitCriterion;
/**
 * Whether a unit, or a unit class, is a `Domain` (`Land`, `Naval`, `Air`) or any other unit class. For rules that mix
 *  domain and trait checks and are given classes as often as units, as build items are.
 */
const isA = (unit, Domain) => typeof unit === 'function'
    ? unit === Domain || Object.prototype.isPrototypeOf.call(Domain, unit)
    : unit instanceof Domain;
exports.isA = isA;
//# sourceMappingURL=traits.js.map