import { Attack, Defence } from './Yields';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Strength from './Rules/Strength';
import Unit from './Unit';

/**
 * The strengths `attacker` and `defender` fight at: each unit's own `attack()` and `defence()`, changed by the
 * `Strength` rules for this pairing. With no `Strength` rules, they're the units' own.
 */
export const strength = (
  attacker: Unit,
  defender: Unit,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): [Attack, Defence] => {
  const attack = attacker.attack(),
    defence = defender.defence();

  ruleRegistry.process(Strength, attacker, defender, attack, defence);

  return [attack, defence];
};

export default strength;
