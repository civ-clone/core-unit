import { TraitType, UnitTrait } from './UnitTrait';
import Criterion from '@civ-clone/core-rule/Criterion';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import type Unit from './Unit';
/**
 * Whether a unit, or a unit class, has `Trait` (or a subclass of it) according to the `UnitTraits` rules in
 *  `ruleRegistry`. The registry is required: a game's own `RuleRegistry` holds its declarations, and asking another
 *  would silently find none. A unit has `unit.hasTrait()`, which uses its own.
 *
 * The answer is kept per class and registry until a `UnitTraits` rule changes, so a lookup allocates nothing.
 */
export declare const hasTrait: (
  unit: Unit | typeof Unit,
  Trait: TraitType,
  ruleRegistry: RuleRegistry
) => boolean;
/**
 * The traits of a unit, or a unit class, that are a `Trait`: every `Carries` of a carrier, say. In declaration order,
 *  each once, frozen and shared: an empty result is always the same empty array.
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
