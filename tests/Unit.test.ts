import { Attack, Defence, Movement, Visibility } from '../Yields';
import {
  Yield as YieldRule,
  BaseYield,
  unitYield,
  IBaseYieldRegistry,
} from '../Rules/Yield';
import Action from '../Action';
import Activate from '../Rules/Activate';
import Busy from '../Rules/Busy';
import City from '@civ-clone/core-city/City';
import Created from '../Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '../Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Tileset from '@civ-clone/core-world/Tileset';
import Unit from '../Unit';
import VisibilityRule from '../Rules/Visibility';
import World from '@civ-clone/core-world/World';
import Yield from '@civ-clone/core-yield/Yield';
import { unitAction } from '../Rules/Action';
import * as chai from 'chai';
import * as spies from 'chai-spies';

const { expect, use } = chai;

use(spies);

describe('Unit', (): void => {
  const generateTile = () =>
      new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
    generateCity = (
      name: string = '',
      player: Player = new Player(),
      tile: Tile = generateTile(),
      world: World | null = null
    ) => {
      if (world === null) {
        tile.getSurroundingArea = () => new Tileset(generateTile());
      }

      return new City(player, tile, name);
    };

  it('should process `Created` `Rule`s when instantiated', (): void => {
    const ruleRegistry = new RuleRegistry(),
      spy = chai.spy();

    ruleRegistry.register(new Created(new Effect(spy)));

    new Unit(null, new Player(), generateTile(), ruleRegistry);

    expect(spy).to.called.once;
  });

  it('should perform an action passed to `action`', (): void => {
    const unit = new Unit(null, new Player(), generateTile()),
      action = new Action(generateTile(), generateTile(), unit);

    unit.action = chai.spy(unit.action);

    expect(unit.action(action)).to.undefined;
    expect(unit.action).to.called.once;
  });

  it('should return valid `Action`s', (): void => {
    const ruleRegistry = new RuleRegistry(),
      tile = generateTile(),
      unit = new Unit(null, new Player(), tile, ruleRegistry);

    tile.getNeighbour = () => generateTile();

    ruleRegistry.register(
      ...unitAction(Action, [Unit]),
      ...unitAction(Action, [Unit], new Criterion(() => false))
    );

    const neighbourActions = unit.actionsForNeighbours(generateTile());

    expect(unit.actions().length).to.equal(1);
    expect(unit.actions('n').length).to.equal(1);
    expect(neighbourActions)
      .to.an('object')
      .with.keys('e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w');
    expect(neighbourActions.n.length).to.equal(1);
  });

  it('should process `Activate` `Rule`s when `activate`d', (): void => {
    const ruleRegistry = new RuleRegistry(),
      spy = chai.spy((unit: Unit) => unit.setActive()),
      unit = new Unit(null, new Player(), generateTile(), ruleRegistry);

    ruleRegistry.register(new Activate(new Effect(spy)));

    expect(unit.active()).to.true;

    unit.setActive(false);
    expect(unit.active()).to.false;

    unit.activate();

    expect(spy).to.called.once;
    expect(unit.active()).to.true;
  });

  it('should process `Visibility` `Rule`s when `applyVisibility` is called', (): void => {
    const ruleRegistry = new RuleRegistry(),
      visibilitySpy = chai.spy(() => {}),
      visibilityYieldSpy = chai.spy((unit: Unit, unitYield: Yield): void =>
        unitYield.add(1)
      ),
      tile = generateTile(),
      unit = new Unit(null, new Player(), tile, ruleRegistry);

    tile.getSurroundingArea = () => new Tileset(generateTile());

    ruleRegistry.register(
      new VisibilityRule(new Effect(visibilitySpy)),
      new YieldRule(new Effect(visibilityYieldSpy))
    );

    unit.applyVisibility();

    expect(visibilitySpy).to.called.once;
    expect(visibilityYieldSpy).to.called.once;

    expect(unit.visibility().value()).to.equal(1);
  });

  it('should return expected yields', (): void => {
    const ruleRegistry = new RuleRegistry(),
      unit = new Unit(null, new Player(), generateTile(), ruleRegistry);

    ruleRegistry.register(...unitYield(Unit, 2, 4, 6, 8));

    expect(unit.attack().value()).to.equal(2);
    expect(unit.defence().value()).to.equal(4);
    expect(unit.movement().value()).to.equal(6);
    expect(unit.visibility().value()).to.equal(8);

    // this should be set to `.movement()` as required on TurnStart or similar
    expect(unit.moves().value()).to.equal(0);

    (
      [
        [new Attack(), 2],
        [new Defence(), 4],
        [new Movement(), 6],
        [new Visibility(), 8],
      ] as [Yield, number][]
    ).forEach(([unitYield, expectedValue]: [Yield, number]): void => {
      (ruleRegistry as IBaseYieldRegistry).process(BaseYield, Unit, unitYield);

      expect(unitYield.value()).to.eql(expectedValue);
    });
  });

  it('should be possible to set `Busy`', (): void => {
    const ruleRegistry = new RuleRegistry(),
      unit = new Unit(null, new Player(), generateTile(), ruleRegistry);

    expect(unit.busy()).to.null;

    unit.setBusy(new Busy());

    expect(unit.busy()).to.instanceof(Busy);
  });

  it('should process `Destroyed` `Rule`s when destroyed', (): void => {
    const ruleRegistry = new RuleRegistry(),
      spy = chai.spy((unit: Unit): void => unit.setDestroyed()),
      unit = new Unit(null, new Player(), generateTile(), ruleRegistry);

    ruleRegistry.register(new Destroyed(new Effect(spy)));

    expect(unit.destroyed()).to.false;

    unit.destroy(new Player());

    expect(spy).to.called.once;
    expect(unit.destroyed()).to.true;
  });

  it('should be possible to construct from a standard method', (): void => {
    const city = generateCity(),
      unit = Unit.createFromObject({
        city,
        player: city.player(),
        tile: city.tile(),
      });

    expect(unit).to.instanceof(Unit);
    expect(unit.city()).to.equal(city);
    expect(unit.player()).to.equal(city.player());
    expect(unit.tile()).to.equal(city.tile());
  });

  it('should be possible to set the `Tile`', (): void => {
    const originalTile = generateTile(),
      unit = new Unit(null, new Player(), originalTile),
      newTile = generateTile();

    expect(unit.tile()).to.equal(originalTile);

    unit.setTile(newTile);

    expect(unit.tile()).to.equal(newTile);
  });

  it('should be possible to set `waiting`', (): void => {
    const unit = new Unit(null, new Player(), generateTile());

    expect(unit.waiting()).to.false;

    unit.setWaiting(true);

    expect(unit.waiting()).to.true;
  });
});
