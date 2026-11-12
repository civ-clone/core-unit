import {
  Action as ActionRule,
  UnitActionTypeError,
  unitAction,
} from '../Rules/Action';
import { UnitTraits, unitTraits } from '../Rules/UnitTraits';
import {
  UnitTraitCycleError,
  hasTrait,
  isA,
  traitCriterion,
  traitsOf,
} from '../traits';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import RuleSetRegistry from '@civ-clone/core-rule/RuleSetRegistry';
import Action from '../Action';
import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitTrait from '../UnitTrait';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

class Land extends Unit {}
class Naval extends Unit {}
class Air extends Unit {}
class Spearman extends Land {}
class Diplomat extends Land {}
class Settlers extends Land {}
class Trireme extends Naval {}
class Carrier extends Naval {}
class Fighter extends Air {}

class IgnoresZoneOfControl extends UnitTrait {}
class NonCombatant extends UnitTrait {}
class FoundsCities extends UnitTrait {}
class Fortifies extends UnitTrait {}
class Covert extends UnitTrait {}
class Missions extends UnitTrait {}
class DiplomaticMissions extends Missions {}
class Carries extends UnitTrait {
  readonly what: typeof Unit;

  constructor(what: typeof Unit) {
    super();

    this.what = what;
  }

  key(): string {
    return `${super.key()}/${this.what.name}`;
  }
}

const prefix = 'test:unit/trait';

const tile = (): Tile =>
  new Tile(0, 0, new Terrain(), new World(new Generator(1, 1)));

const declarations = (): UnitTraits[] => [
  ...unitTraits(prefix, Diplomat, IgnoresZoneOfControl, NonCombatant),
  ...unitTraits(prefix, Diplomat, new DiplomaticMissions()),
  ...unitTraits(prefix, Settlers, FoundsCities),
  ...unitTraits(prefix, Land, Fortifies),
  ...unitTraits(prefix, Trireme, new Carries(Land)),
  ...unitTraits(prefix, Carrier, new Carries(Air), new Carries(Land)),
];

describe('unit traits', (): void => {
  describe('declaring', (): void => {
    it('should make one rule per trait, with an id of prefix, class and trait', (): void => {
      const rules = unitTraits(
        prefix,
        Diplomat,
        IgnoresZoneOfControl,
        new NonCombatant()
      );

      expect(rules).to.have.length(2);
      rules.forEach((rule) => expect(rule).to.be.instanceof(UnitTraits));
      expect(rules.map((rule) => rule.id())).to.eql([
        'test:unit/trait/Diplomat/IgnoresZoneOfControl',
        'test:unit/trait/Diplomat/NonCombatant',
      ]);
    });

    it('should give a parameterised trait declared twice on one class two ids', (): void => {
      const ruleRegistry = new RuleRegistry();

      // Would throw `DuplicateRuleIdError` if both were `…/Carrier/Carries`.
      ruleRegistry.register(
        ...unitTraits(prefix, Carrier, new Carries(Air), new Carries(Land))
      );

      expect(ruleRegistry.get(UnitTraits).map((rule) => rule.id())).to.eql([
        'test:unit/trait/Carrier/Carries/Air',
        'test:unit/trait/Carrier/Carries/Land',
      ]);
    });

    it('should apply to the class and its subclasses, and nothing else', (): void => {
      const [rule] = unitTraits(prefix, Land, Fortifies);

      expect(rule.validate(Land)).to.be.true;
      expect(rule.validate(Spearman)).to.be.true;
      expect(rule.validate(Naval)).to.be.false;
      expect(rule.validate(Unit)).to.be.false;
    });
  });

  describe('querying', (): void => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(...declarations());

    it('should answer for a class', (): void => {
      expect(hasTrait(Diplomat, IgnoresZoneOfControl, ruleRegistry)).to.be.true;
      expect(hasTrait(Diplomat, NonCombatant, ruleRegistry)).to.be.true;
      expect(hasTrait(Spearman, NonCombatant, ruleRegistry)).to.be.false;
      expect(hasTrait(Settlers, FoundsCities, ruleRegistry)).to.be.true;
      expect(hasTrait(Diplomat, FoundsCities, ruleRegistry)).to.be.false;
      expect(hasTrait(Fighter, Fortifies, ruleRegistry)).to.be.false;
      expect(hasTrait(Unit, Fortifies, ruleRegistry)).to.be.false;
    });

    it('should give a trait declared on a parent class to its subclasses', (): void => {
      [Land, Spearman, Diplomat, Settlers].forEach(
        (UnitType) =>
          expect(hasTrait(UnitType, Fortifies, ruleRegistry)).to.be.true
      );
      [Naval, Trireme, Air, Fighter].forEach(
        (UnitType) =>
          expect(hasTrait(UnitType, Fortifies, ruleRegistry)).to.be.false
      );
    });

    it('should answer for an instance, from its own registry', (): void => {
      const diplomat = new Diplomat(null, new Player(), tile(), ruleRegistry),
        spearman = new Spearman(null, new Player(), tile(), ruleRegistry);

      expect(diplomat.hasTrait(IgnoresZoneOfControl)).to.be.true;
      expect(spearman.hasTrait(IgnoresZoneOfControl)).to.be.false;
      expect(spearman.hasTrait(Fortifies)).to.be.true;
      expect(hasTrait(diplomat, NonCombatant, ruleRegistry)).to.be.true;
    });

    it('should match a subclass of the trait asked for', (): void => {
      expect(hasTrait(Diplomat, Missions, ruleRegistry)).to.be.true;
      expect(hasTrait(Diplomat, DiplomaticMissions, ruleRegistry)).to.be.true;
      expect(hasTrait(Settlers, Missions, ruleRegistry)).to.be.false;
      expect(hasTrait(Diplomat, UnitTrait, ruleRegistry)).to.be.true;
      expect(hasTrait(Unit, UnitTrait, ruleRegistry)).to.be.false;
    });

    it('should return parameterised traits with their parameters', (): void => {
      const carrier = new Carrier(null, new Player(), tile(), ruleRegistry);

      expect(
        traitsOf(Trireme, Carries, ruleRegistry).map((trait) => trait.what)
      ).to.eql([Land]);
      expect(carrier.traits(Carries).map((trait) => trait.what)).to.eql([
        Air,
        Land,
      ]);
      expect(carrier.traits()).to.have.length(2);
    });

    it('should return all of a type’s traits, in declaration order, and a shared empty list for none', (): void => {
      expect(
        traitsOf(Diplomat, UnitTrait, ruleRegistry).map(
          (trait) => trait.constructor
        )
      ).to.eql([
        IgnoresZoneOfControl,
        NonCombatant,
        DiplomaticMissions,
        Fortifies,
      ]);
      expect(traitsOf(Fighter, UnitTrait, ruleRegistry)).to.have.length(0);
      expect(traitsOf(Fighter, Carries, ruleRegistry)).to.equal(
        traitsOf(Spearman, Covert, ruleRegistry)
      );
      expect(Object.isFrozen(traitsOf(Diplomat, UnitTrait, ruleRegistry))).to.be
        .true;
    });

    it('should provide a criterion and tell domains apart, for classes and instances', (): void => {
      const diplomat = new Diplomat(null, new Player(), tile(), ruleRegistry);

      expect(traitCriterion(NonCombatant).validate(diplomat)).to.be.true;
      expect(traitCriterion(FoundsCities).validate(diplomat)).to.be.false;
      expect(isA(diplomat, Land)).to.be.true;
      expect(isA(diplomat, Naval)).to.be.false;
      expect(isA(Diplomat, Land)).to.be.true;
      expect(isA(Land, Land)).to.be.true;
      expect(isA(Trireme, Land)).to.be.false;
    });

    it('should offer an action by trait as well as by class', (): void => {
      class Fortify extends Action {}

      const actionRules = new RuleRegistry();

      actionRules.register(
        ...declarations(),
        ...unitAction(Fortify, [Fortifies, Trireme])
      );

      const spearman = new Spearman(null, new Player(), tile(), actionRules),
        trireme = new Trireme(null, new Player(), tile(), actionRules),
        fighter = new Fighter(null, new Player(), tile(), actionRules);

      const fortifies = (unit: Unit): boolean =>
        actionRules
          .process(ActionRule, unit, unit.tile(), unit.tile())
          .some((action) => action instanceof Fortify);

      expect(fortifies(spearman)).to.be.true;
      expect(fortifies(trireme)).to.be.true;
      expect(fortifies(fighter)).to.be.false;
    });
  });

  describe('mistakes', (): void => {
    it('should list a trait declared on a parent and a leaf twice for the leaf', (): void => {
      const ruleRegistry = new RuleRegistry();

      ruleRegistry.register(
        ...unitTraits(prefix, Land, Fortifies),
        ...unitTraits(prefix, Spearman, Fortifies)
      );

      expect(traitsOf(Spearman, Fortifies, ruleRegistry)).to.have.length(2);
      expect(traitsOf(Land, Fortifies, ruleRegistry)).to.have.length(1);
      expect(hasTrait(Spearman, Fortifies, ruleRegistry)).to.be.true;
    });

    it('should throw, not recurse, when a declaration asks for the traits of its own class', (): void => {
      const ruleRegistry = new RuleRegistry();

      ruleRegistry.register(
        new UnitTraits(
          new Criterion((UnitType: typeof Unit): boolean =>
            hasTrait(UnitType, Covert, ruleRegistry)
          ),
          new Effect((): UnitTrait[] => [new Fortifies()])
        )
      );

      expect((): boolean =>
        hasTrait(Diplomat, Fortifies, ruleRegistry)
      ).to.throw(UnitTraitCycleError);
      // Nothing is left half-resolved: asking again throws again, rather than answering from a partial result.
      expect((): boolean =>
        hasTrait(Diplomat, Fortifies, ruleRegistry)
      ).to.throw(UnitTraitCycleError);
    });

    it('should refuse an action entry that is neither a unit class nor a trait class', (): void => {
      class Fortify extends Action {}
      class NotAUnit {}

      expect((): ActionRule[] =>
        unitAction(Fortify, [Spearman, NotAUnit as unknown as typeof Unit])
      ).to.throw(UnitActionTypeError, /NotAUnit/);
      expect((): ActionRule[] =>
        unitAction(Fortify, [Unit, Fortifies])
      ).to.not.throw();
    });
  });

  describe('the cache', (): void => {
    it('should see a trait rule registered after a query', (): void => {
      const ruleRegistry = new RuleRegistry();

      ruleRegistry.register(...unitTraits(prefix, Settlers, FoundsCities));

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.false;

      ruleRegistry.register(...unitTraits(prefix, Diplomat, Covert));

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.true;
      expect(hasTrait(Settlers, FoundsCities, ruleRegistry)).to.be.true;
    });

    it('should forget a trait rule unregistered or replaced', (): void => {
      const ruleRegistry = new RuleRegistry(),
        [covert] = unitTraits(prefix, Diplomat, Covert);

      ruleRegistry.register(covert);

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.true;

      ruleRegistry.unregister(covert);

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.false;

      ruleRegistry.register(covert);
      ruleRegistry.replace(
        'test:unit/trait/Diplomat/Covert',
        ...unitTraits(prefix, Diplomat, NonCombatant)
      );

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.false;
      expect(hasTrait(Diplomat, NonCombatant, ruleRegistry)).to.be.true;
    });

    it('should follow a trait rule switched off and on, by the registry or by the rule', (): void => {
      const ruleRegistry = new RuleRegistry(),
        [covert] = unitTraits(prefix, Diplomat, Covert);

      ruleRegistry.register(covert);

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.true;

      ruleRegistry.disableById('test:unit/trait/Diplomat/Covert');

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.false;

      covert.enable();

      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.true;
    });

    it('should follow a rule set that supersedes a trait', (): void => {
      const ruleRegistry = new RuleRegistry(),
        sets = new RuleSetRegistry(ruleRegistry);

      ruleRegistry.register(...declarations());
      ruleRegistry.register(
        ...unitTraits('variant:unit/trait', Diplomat, Covert)
      );

      sets.register(
        new RuleSet(
          'variant',
          { supersedes: ['test:unit/trait/Diplomat/NonCombatant'] },
          'variant:unit/trait/Diplomat/Covert'
        )
      );

      expect(hasTrait(Diplomat, NonCombatant, ruleRegistry)).to.be.false;
      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.true;

      sets.set('variant', false);

      expect(hasTrait(Diplomat, NonCombatant, ruleRegistry)).to.be.true;
      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.false;

      sets.set('variant', true);

      expect(hasTrait(Diplomat, NonCombatant, ruleRegistry)).to.be.false;
      expect(hasTrait(Diplomat, Covert, ruleRegistry)).to.be.true;
    });

    it('should keep its answers when an unrelated rule changes', (): void => {
      class Other extends ActionRule {}

      const ruleRegistry = new RuleRegistry(),
        other = new Other('test:other');

      ruleRegistry.register(...declarations(), other);

      // `get` hands back the same array while no `UnitTraits` rule changes: that is what the cache keys on.
      const before = ruleRegistry.get(UnitTraits),
        traits = traitsOf(Diplomat, UnitTrait, ruleRegistry);

      other.disable();
      ruleRegistry.register(new Other());

      expect(ruleRegistry.get(UnitTraits)).to.equal(before);
      // The very same (frozen) list: nothing was rebuilt.
      expect(traitsOf(Diplomat, UnitTrait, ruleRegistry)).to.equal(traits);

      // And with one trait rule off, the same holds for the reduced list.
      ruleRegistry.disableById('test:unit/trait/Settlers/FoundsCities');

      const reduced = ruleRegistry.get(UnitTraits),
        diplomat = traitsOf(Diplomat, UnitTrait, ruleRegistry);

      expect(reduced).to.not.equal(before);
      other.enable();

      expect(ruleRegistry.get(UnitTraits)).to.equal(reduced);
      expect(traitsOf(Diplomat, UnitTrait, ruleRegistry)).to.equal(diplomat);
      expect(hasTrait(Settlers, FoundsCities, ruleRegistry)).to.be.false;
    });

    it('should keep two registries apart', (): void => {
      const civ1 = new RuleRegistry(),
        civ2 = new RuleRegistry();

      civ1.register(...unitTraits('civ1', Diplomat, IgnoresZoneOfControl));
      civ2.register(...unitTraits('civ2', Diplomat, Covert));

      expect(hasTrait(Diplomat, IgnoresZoneOfControl, civ1)).to.be.true;
      expect(hasTrait(Diplomat, Covert, civ1)).to.be.false;
      expect(hasTrait(Diplomat, IgnoresZoneOfControl, civ2)).to.be.false;
      expect(hasTrait(Diplomat, Covert, civ2)).to.be.true;

      const one = new Diplomat(null, new Player(), tile(), civ1),
        two = new Diplomat(null, new Player(), tile(), civ2);

      expect(one.hasTrait(IgnoresZoneOfControl)).to.be.true;
      expect(two.hasTrait(IgnoresZoneOfControl)).to.be.false;

      civ2.register(...unitTraits('civ2', Diplomat, IgnoresZoneOfControl));

      expect(two.hasTrait(IgnoresZoneOfControl)).to.be.true;
      expect(one.hasTrait(Covert)).to.be.false;
    });
  });
});
