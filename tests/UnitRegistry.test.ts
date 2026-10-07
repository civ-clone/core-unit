import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitRegistry from '../UnitRegistry';
import { expect } from 'chai';

// The registry only compares tiles, cities and players by identity, and a city only needs its owner, so stand-ins do.
const tile = (): Tile => ({} as Tile),
  cityOf = (player: Player): City =>
    ({ player: (): Player => player } as unknown as City),
  // What each lookup returned before it was indexed (civ-clone/web-renderer#308).
  scan = {
    city: (registry: UnitRegistry, city: City | null): Unit[] =>
      registry.filter(
        (unit: Unit): boolean => unit.city() === city && !unit.destroyed()
      ),
    player: (
      registry: UnitRegistry,
      player: Player,
      includeDestroyed: boolean
    ): Unit[] =>
      registry.filter(
        (unit: Unit): boolean =>
          unit.player() === player && (includeDestroyed || !unit.destroyed())
      ),
    tile: (registry: UnitRegistry, tile: Tile): Unit[] =>
      registry.filter(
        (unit: Unit): boolean => unit.tile() === tile && !unit.destroyed()
      ),
  };

describe('UnitRegistry', (): void => {
  const ruleRegistry = new RuleRegistry();

  it('should find a unit by its new tile, home and owner once they change', (): void => {
    const registry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      other = new Player(ruleRegistry),
      home = cityOf(player),
      newHome = cityOf(player),
      theirs = cityOf(other),
      [from, to] = [tile(), tile()],
      unit = new Unit(home, player, from, ruleRegistry);

    registry.register(unit);

    // Each checked straight after its own change: a later one re-files the unit under all its keys.
    unit.setTile(to);

    expect(registry.getByTile(from)).to.deep.equal([]);
    expect(registry.getByTile(to)).to.deep.equal([unit]);

    unit.setCity(newHome);

    expect(registry.getByCity(home)).to.deep.equal([]);
    expect(registry.getByCity(newHome)).to.deep.equal([unit]);

    unit.transfer(other, theirs);

    expect(registry.getByPlayer(player)).to.deep.equal([]);
    expect(registry.getByPlayer(other)).to.deep.equal([unit]);
    expect(registry.getByCity(newHome)).to.deep.equal([]);
    expect(registry.getByCity(theirs)).to.deep.equal([unit]);
  });

  it('should return units in the order they were registered, however they have moved', (): void => {
    const registry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      [here, there] = [tile(), tile()],
      units = [1, 2, 3].map(
        (): Unit => new Unit(null, player, here, ruleRegistry)
      );

    registry.register(...units);

    units[0].setTile(there);
    units[0].setTile(here);

    expect(registry.getByTile(here)).to.deep.equal(units);
    expect(registry.getByPlayer(player)).to.deep.equal(units);

    // Unregistered and registered again, a unit goes to the end, as it does in `entries()`.
    registry.unregister(units[0]);
    registry.register(units[0]);

    expect(registry.getByTile(here)).to.deep.equal([
      units[1],
      units[2],
      units[0],
    ]);
    expect(registry.getByTile(here)).to.deep.equal(registry.entries());
  });

  it('should leave out destroyed units unless asked, and forget unregistered ones', (): void => {
    const registry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      place = tile(),
      kept = new Unit(null, player, place, ruleRegistry),
      destroyed = new Unit(null, player, place, ruleRegistry),
      gone = new Unit(null, player, place, ruleRegistry);

    registry.register(kept, destroyed, gone);
    destroyed.setDestroyed();
    registry.unregister(gone);

    expect(registry.getByTile(place)).to.deep.equal([kept]);
    expect(registry.getByCity(null as unknown as City)).to.deep.equal([kept]);
    expect(registry.getByPlayer(player)).to.deep.equal([kept]);
    expect(registry.getByPlayer(player, true)).to.deep.equal([kept, destroyed]);

    // A unit no longer registered is no longer followed.
    gone.setTile(tile());

    expect(registry.getByPlayer(player, true)).to.deep.equal([kept, destroyed]);
  });

  it("should not let a caller change the registry by changing what it's given", (): void => {
    const registry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      place = tile(),
      unit = new Unit(null, player, place, ruleRegistry);

    registry.register(unit);
    registry.getByPlayer(player, true).splice(0, 1);
    registry.getByTile(place).splice(0, 1);

    expect(registry.getByPlayer(player, true)).to.deep.equal([unit]);
    expect(registry.getByTile(place)).to.deep.equal([unit]);
  });

  it('should keep a unit in each registry it belongs to up to date', (): void => {
    const first = new UnitRegistry(),
      second = new UnitRegistry(),
      player = new Player(ruleRegistry),
      [from, to] = [tile(), tile()],
      unit = new Unit(null, player, from, ruleRegistry);

    first.register(unit);
    second.register(unit);
    unit.setTile(to);

    expect(first.getByTile(to)).to.deep.equal([unit]);
    expect(second.getByTile(to)).to.deep.equal([unit]);

    second.unregister(unit);
    unit.setTile(from);

    expect(first.getByTile(from)).to.deep.equal([unit]);
    expect(second.getByTile(from)).to.deep.equal([]);
  });

  it('should always answer as the scan it replaces did, over many random changes', (): void => {
    // A small seeded generator, so a failure can be replayed.
    let seed = 308;
    const random = (): number => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;

        return seed / 0x7fffffff;
      },
      pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)],
      registry = new UnitRegistry(),
      players = [1, 2, 3].map((): Player => new Player(ruleRegistry)),
      cities = players.flatMap((player: Player): City[] => [
        cityOf(player),
        cityOf(player),
      ]),
      tiles = [1, 2, 3, 4, 5, 6].map(tile),
      units: Unit[] = [];

    for (let step = 0; step < 2000; step++) {
      const action = random();

      if (units.length < 4 || action < 0.15) {
        const player = pick(players),
          unit = new Unit(
            random() < 0.3
              ? null
              : pick(cities.filter((city) => city.player() === player)),
            player,
            pick(tiles),
            ruleRegistry
          );

        units.push(unit);
        registry.register(unit);
      } else if (action < 0.25) {
        registry.unregister(pick(units));
      } else if (action < 0.3) {
        registry.register(pick(units));
      } else if (action < 0.6) {
        pick(units).setTile(pick(tiles));
      } else if (action < 0.75) {
        // Ignored unless the city is the unit's owner's, as `setCity` insists.
        pick(units).setCity(pick(cities));
      } else if (action < 0.85) {
        pick(units).transfer(
          pick(players),
          random() < 0.5 ? pick(cities) : null
        );
      } else {
        pick(units).setDestroyed();
      }

      tiles.forEach((place: Tile): void => {
        expect(registry.getByTile(place), `tile, step ${step}`).to.deep.equal(
          scan.tile(registry, place)
        );
      });

      [null, ...cities].forEach((city): void => {
        expect(
          registry.getByCity(city as City),
          `city, step ${step}`
        ).to.deep.equal(scan.city(registry, city));
      });

      players.forEach((player: Player): void => {
        [false, true].forEach((includeDestroyed: boolean): void => {
          expect(
            registry.getByPlayer(player, includeDestroyed),
            `player, step ${step}`
          ).to.deep.equal(scan.player(registry, player, includeDestroyed));
        });
      });
    }
  });
});
