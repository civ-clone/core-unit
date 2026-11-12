import { TraitType, UnitTrait } from '../UnitTrait';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Rule from '@civ-clone/core-rule/Rule';
import type Unit from '../Unit';

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
export class UnitTraits extends Rule<[typeof Unit], UnitTrait[]> {}

export default UnitTraits;

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
export const unitTraits = (
  idPrefix: string,
  UnitType: typeof Unit,
  ...traits: (UnitTrait | TraitType)[]
): UnitTraits[] =>
  traits.map((trait: UnitTrait | TraitType): UnitTraits => {
    const instance: UnitTrait =
      typeof trait === 'function'
        ? new (trait as new () => UnitTrait)()
        : trait;

    return new UnitTraits(
      `${idPrefix}/${UnitType.name}/${instance.key()}`,
      new Criterion(
        (Candidate: typeof Unit): boolean =>
          Candidate === UnitType ||
          Object.prototype.isPrototypeOf.call(UnitType, Candidate)
      ),
      new Effect((): UnitTrait[] => [instance])
    );
  });
