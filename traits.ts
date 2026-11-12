import { TraitType, UnitTrait } from './UnitTrait';
import Criterion from '@civ-clone/core-rule/Criterion';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import UnitTraits from './Rules/UnitTraits';
import type Unit from './Unit';

// Each trait class a unit type has, and each of its trait ancestors, to the traits of that class it has.
type Resolved = Map<Function, readonly UnitTrait[]>;

type Revision = {
  // What `RuleRegistry.get(UnitTraits)` returned when this was built. `get` returns the same array until a
  //  `UnitTraits` rule is registered, unregistered or switched, so the array is the revision.
  rules: readonly UnitTraits[];
  byClass: Map<Function, Resolved>;
  // The classes whose traits are being worked out right now, to catch a declaration that asks about its own class.
  resolving: Set<Function>;
};

/** Thrown when a `UnitTraits` rule asks for the traits of the class it is being resolved for. */
export class UnitTraitCycleError extends Error {}

const none: readonly UnitTrait[] = Object.freeze([]);

const memo = new WeakMap<RuleRegistry, Revision>();

const build = (
  UnitType: typeof Unit,
  rules: readonly UnitTraits[]
): Resolved => {
  const resolved: Map<Function, UnitTrait[]> = new Map(),
    // Every rule validated before any is processed, as `RuleRegistry.process` does.
    matched = rules.filter((rule: UnitTraits): boolean =>
      rule.validate(UnitType)
    );

  matched.forEach((rule: UnitTraits): void => {
    const traits = rule.process(UnitType);

    if (!Array.isArray(traits)) {
      return;
    }

    traits.forEach((trait: UnitTrait): void => {
      let prototype: object | null = Object.getPrototypeOf(trait);

      // So `hasTrait(unit, Parent)` finds a `Child` trait, and `traitsOf(unit, UnitTrait)` finds them all.
      while (prototype !== null && prototype !== Object.prototype) {
        const TraitClass = prototype.constructor,
          list = resolved.get(TraitClass);

        if (list === undefined) {
          resolved.set(TraitClass, [trait]);
        } else if (!list.includes(trait)) {
          list.push(trait);
        }

        prototype = Object.getPrototypeOf(prototype);
      }
    });
  });

  resolved.forEach((list: UnitTrait[]): void => {
    Object.freeze(list);
  });

  return resolved;
};

const resolve = (
  unit: Unit | typeof Unit,
  ruleRegistry: RuleRegistry
): Resolved => {
  const UnitType = (
      typeof unit === 'function' ? unit : unit.constructor
    ) as typeof Unit,
    rules = ruleRegistry.get(UnitTraits);

  let revision = memo.get(ruleRegistry);

  if (revision === undefined || revision.rules !== rules) {
    revision = { rules, byClass: new Map(), resolving: new Set() };

    memo.set(ruleRegistry, revision);
  }

  let resolved = revision.byClass.get(UnitType);

  if (resolved === undefined) {
    if (revision.resolving.has(UnitType)) {
      throw new UnitTraitCycleError(
        `A UnitTraits rule asked for the traits of ${UnitType.name} while they were being worked out. A trait ` +
          "declaration's criteria and effect must depend on the class alone, not on its (or any) traits."
      );
    }

    revision.resolving.add(UnitType);

    try {
      resolved = build(UnitType, rules);
    } finally {
      revision.resolving.delete(UnitType);
    }

    revision.byClass.set(UnitType, resolved);
  }

  return resolved;
};

/**
 * Whether a unit, or a unit class, has `Trait` (or a subclass of it) according to the `UnitTraits` rules in
 *  `ruleRegistry`. The registry is required: a game's own `RuleRegistry` holds its declarations, and asking another
 *  would silently find none. A unit has `unit.hasTrait()`, which uses its own.
 *
 * The answer is kept per class and registry until a `UnitTraits` rule changes, so a lookup allocates nothing. That is
 *  why a declaration must depend on the class alone and never on game state: it is resolved once per class, not per
 *  query.
 */
export const hasTrait = (
  unit: Unit | typeof Unit,
  Trait: TraitType,
  ruleRegistry: RuleRegistry
): boolean => resolve(unit, ruleRegistry).has(Trait);

/**
 * The traits of a unit, or a unit class, that are a `Trait`, with their parameters: every `Carries` of a carrier, say.
 *  In declaration order, frozen and shared: an empty result is always the same empty array.
 *
 * Each declaration counts: a trait declared on both a parent class and a leaf class appears twice for the leaf.
 */
export const traitsOf = <T extends UnitTrait = UnitTrait>(
  unit: Unit | typeof Unit,
  Trait: TraitType<T>,
  ruleRegistry: RuleRegistry
): readonly T[] =>
  (resolve(unit, ruleRegistry).get(Trait) ?? none) as readonly T[];

/** A criterion, for a rule whose first argument is a `Unit`, that the unit has `Trait`. */
export const traitCriterion = (Trait: TraitType): Criterion =>
  new Criterion((unit: Unit): boolean => unit.hasTrait(Trait));

/**
 * Whether a unit, or a unit class, is a `Domain` (`Land`, `Naval`, `Air`) or any other unit class. For rules that mix
 *  domain and trait checks and are given classes as often as units, as build items are.
 */
export const isA = (unit: Unit | typeof Unit, Domain: typeof Unit): boolean =>
  typeof unit === 'function'
    ? unit === Domain || Object.prototype.isPrototypeOf.call(Domain, unit)
    : unit instanceof Domain;
