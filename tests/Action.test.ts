import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '../Unit';
import World from '@civ-clone/core-world/World';
import Action from '../Action';
import { expect } from 'chai';

describe('Action', (): void => {
  const generateTile = () =>
    new Tile(0, 0, new Terrain(), new World(new Generator(1, 1)));

  it('should be possible to duplicate an action for another `Unit`', (): void => {
    const unit = new Unit(null, new Player(), generateTile()),
      newUnit = new Unit(null, new Player(), generateTile()),
      action = new Action(unit.tile(), generateTile(), unit),
      newAction = action.forUnit(newUnit);

    expect(newAction.unit()).to.equal(newUnit);
    expect(action.unit()).to.not.equal(newAction.unit());
    expect(action.from()).to.equal(newAction.from());
    expect(action.to()).to.equal(newAction.to());
    expect(action.ruleRegistry()).to.equal(newAction.ruleRegistry());
  });
});
