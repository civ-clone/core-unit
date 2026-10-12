"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strength = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Strength_1 = require("./Rules/Strength");
/**
 * The strengths `attacker` and `defender` fight at: each unit's own `attack()` and `defence()`, changed by the
 * `Strength` rules for this pairing. With no `Strength` rules, they're the units' own.
 */
const strength = (attacker, defender, ruleRegistry = RuleRegistry_1.instance) => {
    const attack = attacker.attack(), defence = defender.defence();
    ruleRegistry.process(Strength_1.default, attacker, defender, attack, defence);
    return [attack, defence];
};
exports.strength = strength;
exports.default = exports.strength;
//# sourceMappingURL=strength.js.map