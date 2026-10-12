import { Attack, Defence } from './Yields';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from './Unit';
/**
 * The strengths `attacker` and `defender` fight at: each unit's own `attack()` and `defence()`, changed by the
 * `Strength` rules for this pairing. With no `Strength` rules, they're the units' own.
 */
export declare const strength: (
  attacker: Unit,
  defender: Unit,
  ruleRegistry?: RuleRegistry
) => [Attack, Defence];
export default strength;
