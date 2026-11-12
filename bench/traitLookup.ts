import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitTrait from '../UnitTrait';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { hasTrait } from '../traits';
import { unitTraits } from '../Rules/UnitTraits';

// `npm run bench`, not part of `npm test`. It logs what a trait lookup costs against the `instanceof` it replaces, so a
//  change to the lookup can be compared; it asserts only that both give the same answers, never a timing. Shaped like Civ1: 28 unit classes under a few abstract ones, and about 30 declarations.
describe('unit traits: lookup timings (logged, not asserted)', (): void => {
  class Land extends Unit {}
  class Fortifiable extends Land {}
  class Diplomatic extends Fortifiable {}
  class Naval extends Unit {}
  class Air extends Unit {}

  const leaf = (Parent: typeof Unit, count: number): (typeof Unit)[] =>
    Array.from({ length: count }, () => class extends Parent {});

  const [Diplomat, Caravan] = leaf(Diplomatic, 2),
    military = leaf(Fortifiable, 13),
    navy = leaf(Naval, 9),
    aircraft = leaf(Air, 3),
    [Settlers] = leaf(Land, 1),
    classes = [Diplomat, Caravan, ...military, ...navy, ...aircraft, Settlers];

  class NonCombatant extends UnitTrait {}
  class IgnoresZoneOfControl extends UnitTrait {}
  class Fortifies extends UnitTrait {}
  class FoundsCities extends UnitTrait {}
  class Terraforms extends UnitTrait {}
  class CoastBound extends UnitTrait {}

  const ruleRegistry = new RuleRegistry();

  classes.forEach((UnitType, index) =>
    ruleRegistry.register(...unitTraits(`bench/${index}`, UnitType, CoastBound))
  );
  ruleRegistry.register(
    ...unitTraits('bench', Diplomatic, NonCombatant, IgnoresZoneOfControl),
    ...unitTraits('bench', Fortifiable, Fortifies),
    ...unitTraits('bench', Settlers, FoundsCities, Terraforms)
  );

  const tile = new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
    player = new Player(),
    units = classes.map(
      (UnitType) => new UnitType(null, player, tile, ruleRegistry)
    );

  const time = (label: string, check: (unit: Unit) => boolean): number => {
    const iterations = 1_000_000;
    let found = 0;

    // Warm up, then measure.
    for (let index = 0; index < 100_000; index++) {
      if (check(units[index % units.length])) {
        found++;
      }
    }

    found = 0;

    const start = process.hrtime.bigint();

    for (let index = 0; index < iterations; index++) {
      if (check(units[index % units.length])) {
        found++;
      }
    }

    const nanoseconds = Number(process.hrtime.bigint() - start);

    console.log(
      `      ${label}: ${(nanoseconds / 1e6).toFixed(1)} ms per 1M (${(
        nanoseconds / iterations
      ).toFixed(1)} ns each), ${found} true`
    );

    return found;
  };

  it('should give the same answers as `instanceof`, and log how long each took', (): void => {
    const byClass = time(
        'instanceof Diplomatic',
        (unit) => unit instanceof Diplomatic
      ),
      byMethod = time('unit.hasTrait(NonCombatant)', (unit) =>
        unit.hasTrait(NonCombatant)
      ),
      byFunction = time('hasTrait(unit, NonCombatant, registry)', (unit) =>
        hasTrait(unit, NonCombatant, ruleRegistry)
      ),
      byClassQuery = time('hasTrait(Class, NonCombatant, registry)', (unit) =>
        hasTrait(unit.constructor as typeof Unit, NonCombatant, ruleRegistry)
      );

    // The same answers, so the comparison is fair.
    expect(byMethod).to.equal(byClass);
    expect(byFunction).to.equal(byClass);
    expect(byClassQuery).to.equal(byClass);
  });
});
