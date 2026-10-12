import { Attack, Defence } from '../Yields';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Strength from '../Rules/Strength';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import strength from '../strength';
import { unitYield } from '../Rules/Yield';

describe('strength', (): void => {
  class Attacker extends Unit {}
  class Defender extends Unit {}

  const setUp = (): [RuleRegistry, Attacker, Defender] => {
    const ruleRegistry = new RuleRegistry(),
      generateTile = () =>
        new Tile(0, 0, new Terrain(), new World(new Generator(1, 1)));

    ruleRegistry.register(
      ...unitYield(Attacker, 3, 1),
      ...unitYield(Defender, 1, 2)
    );

    return [
      ruleRegistry,
      new Attacker(null, new Player(), generateTile(), ruleRegistry),
      new Defender(null, new Player(), generateTile(), ruleRegistry),
    ];
  };

  it("should be the units' own attack and defence with no `Strength` rules", (): void => {
    const [ruleRegistry, attacker, defender] = setUp(),
      [attack, defence] = strength(attacker, defender, ruleRegistry);

    expect(attack).instanceof(Attack);
    expect(attack.value()).equal(3);
    expect(defence).instanceof(Defence);
    expect(defence.value()).equal(2);
  });

  it('should let a `Strength` rule change either side, knowing both units', (): void => {
    const [ruleRegistry, attacker, defender] = setUp();

    ruleRegistry.register(
      new Strength(
        new Criterion(
          (unit: Unit, against: Unit): boolean =>
            unit === attacker && against === defender
        ),
        new Effect(
          (unit: Unit, against: Unit, attack: Attack, defence: Defence) => {
            attack.add(attack.value() / 2, 'Veteran');
            defence.add(defence.value() * 2, 'CityWalls');
          }
        )
      )
    );

    const [attack, defence] = strength(attacker, defender, ruleRegistry);

    expect(attack.value()).equal(4.5);
    expect(defence.value()).equal(6);
    expect(defence.values()).deep.include([4, 'CityWalls']);
    expect(attacker.attack().value()).equal(3);
    expect(defender.defence().value()).equal(2);
  });
});
