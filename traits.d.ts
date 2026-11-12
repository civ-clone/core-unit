import { TraitType, UnitTrait } from './UnitTrait';
import Criterion from '@civ-clone/core-rule/Criterion';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import type Unit from './Unit';
/** Thrown when a `UnitTraits` rule asks for the traits of the class it is being resolved for. */
export declare class UnitTraitCycleError extends Error {}
/**
 * Whether a unit, or a unit class, has `Trait` (or a subclass of it) according to the `UnitTraits` rules in
 *  `ruleRegistry`. The registry is required: a game's own `RuleRegistry` holds its declarations, and asking another
 *  would silently find none. A unit has `unit.hasTrait()`, which uses its own.
 *
 * The answer is kept per class and registry until a `UnitTraits` rule changes, so a lookup allocates nothing. That is
 *  why a declaration must depend on the class alone and never on game state: it is resolved once per class, not per
 *  query.
 */
export declare const hasTrait: (
  unit: Unit | typeof Unit,
  Trait: TraitType,
  ruleRegistry: RuleRegistry
) => boolean;
/**
 * The traits of a unit, or a unit class, that are a `Trait`, with their parameters: every `Carries` of a carrier, say.
 *  In declaration order, frozen and shared: an empty result is always the same empty array.
 *
 * Each declaration counts: a trait declared on both a parent class and a leaf class appears twice for the leaf.
 */
export declare const traitsOf: <T extends UnitTrait = UnitTrait>(
  unit: Unit | typeof Unit,
  Trait: TraitType<T>,
  ruleRegistry: RuleRegistry
) => readonly T[];
/** A criterion, for a rule whose first argument is a `Unit`, that the unit has `Trait`. */
export declare const traitCriterion: (Trait: TraitType) => Criterion;
/**
 * Whether a unit, or a unit class, is a `Domain` (`Land`, `Naval`, `Air`) or any other unit class. For rules that mix
 *  domain and trait checks and are given classes as often as units, as build items are.
 */
export declare const isA: (
  unit: Unit | typeof Unit,
  Domain: typeof Unit
) => boolean;
