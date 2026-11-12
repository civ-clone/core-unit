/**
 * Something a unit *type* can do or is, other than its domain (`Land`, `Naval`, `Air`): ignoring zones of control,
 *  carrying aircraft, founding cities. A game declares which types have which traits with `UnitTraits` rules (see
 *  `unitTraits`), so the same class can have different traits in different games, and a `RuleSet` can switch one.
 *
 * Traits belong to the class, not to a unit: they are never saved and never sent to a client. A unit's own state
 *  (veteran, fortified) is a `UnitImprovement`, not a trait.
 *
 * A trait names the exception, not the default: the domain says what a unit ordinarily does, and a trait marks what
 *  differs. A trait may carry readonly parameters (`new Carries(Air)`); it should hold nothing that changes.
 */
export abstract class UnitTrait {
  /**
   * This trait's part of the id of a rule that declares it (`<prefix>/<UnitType>/<key>`). The class name by default. A
   *  parameterised trait that a type can have more than once (`Carries(Land)` and `Carries(Air)`) overrides it, so that
   *  each declaration has its own id.
   */
  key(): string {
    return this.constructor.name;
  }
}

/** A trait class, abstract or not: what `hasTrait` and `traitsOf` take. */
export type TraitType<T extends UnitTrait = UnitTrait> = abstract new (
  ...args: any[]
) => T;

/** Whether `value` is a trait class (as opposed to, say, a unit class). */
export const isTraitType = (value: unknown): value is TraitType =>
  typeof value === 'function' &&
  (value === UnitTrait || value.prototype instanceof UnitTrait);

export default UnitTrait;
