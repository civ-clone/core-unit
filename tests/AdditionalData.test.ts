import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import UnitRegistry from '../UnitRegistry';
import { expect } from 'chai';
import units from '../AdditionalData/units';

describe('AdditionalData: units', (): void => {
  it("should list only a player's units that haven't been destroyed", (): void => {
    const ruleRegistry = new RuleRegistry(),
      unitRegistry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      city = { player: (): Player => player } as unknown as City,
      tile = {} as Tile,
      [alive, destroyed] = [
        new Unit(city, player, tile, ruleRegistry),
        new Unit(city, player, tile, ruleRegistry),
      ],
      [playerUnits] = units(unitRegistry)
        .filter((additionalData) => additionalData.key() === 'units')
        .filter((additionalData) => additionalData.type() === Player);

    unitRegistry.register(alive, destroyed);

    destroyed.setDestroyed();

    expect(playerUnits.data(player)).to.deep.equal([alive]);
  });
});
