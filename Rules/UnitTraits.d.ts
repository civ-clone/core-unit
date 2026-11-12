import { TraitType, UnitTrait } from '../UnitTrait';
import Rule from '@civ-clone/core-rule/Rule';
import type Unit from '../Unit';
/**
 * The traits a unit type has. Validated and processed with the unit's class, never an instance, and read through
 *  `hasTrait`/`traitsOf` (or `unit.hasTrait()`), which keep the answer per class until a `UnitTraits` rule is
 *  registered, removed or switched. So a rule's criteria and effect must depend on the class alone.
 */
export declare class UnitTraits extends Rule<[typeof Unit], UnitTrait[]> {}
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
export declare const unitTraits: (
  idPrefix: string,
  UnitType: typeof Unit,
  ...traits: (UnitTrait | TraitType)[]
) => UnitTraits[];
