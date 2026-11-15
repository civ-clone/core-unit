import { Firepower, HitPoints } from '../Yields';
import Criterion from '@civ-clone/core-rule/Criterion';
import DelayedAction from '../DelayedAction';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '../Unit';
import WorkRate from '../Rules/WorkRate';
import World from '@civ-clone/core-world/World';
import YieldRule from '../Rules/Yield';
import { expect } from 'chai';

class Engineers extends Unit {}

const generateTile = () =>
    new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
  generateUnit = (
    ruleRegistry: RuleRegistry = new RuleRegistry(),
    UnitType: typeof Unit = Unit
  ): Unit => new UnitType(null, new Player(), generateTile(), ruleRegistry);

describe('Unit damage', (): void => {
  it('should add no property to a unit that has taken none', (): void => {
    const unit = generateUnit();

    expect(Object.keys(unit)).not.to.include('_damage');
    expect(unit.stateKeys()).not.to.include('_damage');
    expect(unit.damage()).to.equal(0);
  });

  it('should keep the damage set, and drop the property again at 0', (): void => {
    const unit = generateUnit(),
      keys = unit.stateKeys();

    unit.setDamage(3);

    expect(unit.damage()).to.equal(3);
    expect(unit.stateKeys()).to.include('_damage');

    unit.setDamage(0);

    expect(unit.damage()).to.equal(0);
    expect(unit.stateKeys()).to.deep.equal(keys);
    expect(Object.prototype.hasOwnProperty.call(unit, '_damage')).to.false;

    unit.setDamage(2);
    unit.setDamage(-1);

    expect(unit.damage()).to.equal(0);
    expect(unit.stateKeys()).to.deep.equal(keys);
  });

  it('should refuse damage that is not finite, and keep what it had', (): void => {
    const unit = generateUnit();

    unit.setDamage(4);

    [NaN, Infinity, -Infinity].forEach((damage: number): void => {
      expect((): void => unit.setDamage(damage)).to.throw(RangeError);
      expect(unit.damage()).to.equal(4);
    });
  });

  it('should read 0 for a unit restored without running its constructor', (): void => {
    const unit = Object.create(Unit.prototype) as Unit;

    expect(unit.damage()).to.equal(0);
  });

  it('should not be one of the keys sent to a client', (): void => {
    const unit = generateUnit();

    unit.setDamage(3);

    expect(unit.keys()).not.to.include('damage');
    expect(unit.keys()).not.to.include('hitPoints');
  });

  it('should give hit points as remaining and maximum, from the `HitPoints` yield', (): void => {
    const ruleRegistry = new RuleRegistry(),
      unit = generateUnit(ruleRegistry);

    expect(unit.hitPoints()).to.deep.equal([0, 0]);

    ruleRegistry.register(
      new YieldRule(
        new Criterion(
          (unit: Unit, unitYield: HitPoints): boolean =>
            unitYield instanceof HitPoints
        ),
        new Effect((unit: Unit, unitYield: HitPoints): void =>
          unitYield.set(20)
        )
      ),
      new YieldRule(
        new Criterion(
          (unit: Unit, unitYield: Firepower): boolean =>
            unitYield instanceof Firepower
        ),
        new Effect((unit: Unit, unitYield: Firepower): void => unitYield.set(2))
      )
    );

    expect(unit.hitPoints()).to.deep.equal([20, 20]);
    expect(unit.firepower().value()).to.equal(2);

    unit.setDamage(7);

    expect(unit.hitPoints()).to.deep.equal([13, 20]);

    unit.setDamage(25);

    expect(unit.hitPoints()).to.deep.equal([0, 20]);
  });
});

describe('WorkRate', (): void => {
  const endTurn = (
    ruleRegistry: RuleRegistry,
    turns: number,
    UnitType: typeof Unit = Unit
  ): string => {
    const turn = new Turn(),
      pendingEffects = new PendingEffectRegistry(),
      unit = generateUnit(ruleRegistry, UnitType);

    turn.set(10);

    new DelayedAction(
      unit.tile(),
      unit.tile(),
      unit,
      ruleRegistry,
      turn,
      pendingEffects
    ).perform(turns, 'core-unit-test:complete');

    const [pendingEffect] = pendingEffects.entries();

    return pendingEffect.data().endTurn as string;
  };

  it('should take the turns given with no rule', (): void => {
    [0, 1, 2, 3, 4, 5, 15].forEach((turns: number): void => {
      expect(endTurn(new RuleRegistry(), turns)).to.equal(String(10 + turns));
    });
  });

  it('should take ceil(turns / rate) turns at the rate a rule gives', (): void => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(
      new WorkRate(
        new Criterion((unit: Unit): boolean => unit instanceof Engineers),
        new Effect((): number => 2)
      )
    );

    (
      [
        [1, 1],
        [2, 1],
        [3, 2],
        [4, 2],
        [5, 3],
        [10, 5],
        [15, 8],
      ] as [number, number][]
    ).forEach(([turns, expected]: [number, number]): void => {
      expect(endTurn(ruleRegistry, turns, Engineers)).to.equal(
        String(10 + expected)
      );
      // The rule doesn't answer for other units.
      expect(endTurn(ruleRegistry, turns)).to.equal(String(10 + turns));
    });
  });

  it('should take the first rate that is not undefined', (): void => {
    const declining = new RuleRegistry(),
      both = new RuleRegistry();

    // A rule that matches but answers nothing, then one that answers.
    declining.register(
      new WorkRate(new Effect((): number => undefined as unknown as number)),
      new WorkRate(new Effect((): number => 2))
    );
    both.register(
      new WorkRate(new Effect((): number => 4)),
      new WorkRate(new Effect((): number => 2))
    );

    expect(endTurn(declining, 5)).to.equal('13');
    expect(endTurn(both, 5)).to.equal('12');
  });

  it('should ignore a rate that is not above 0', (): void => {
    [0, -1, Infinity, NaN].forEach((rate: number): void => {
      const ruleRegistry = new RuleRegistry();

      ruleRegistry.register(new WorkRate(new Effect((): number => rate)));

      expect(endTurn(ruleRegistry, 5)).to.equal('15');
    });
  });
});
