import {
  MissingPendingEffectError,
  registerDelayedAction,
} from '../registerDelayedAction';
import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import BusyRegistry, { BusyFactory } from '../BusyRegistry';
import Busy from '../Rules/Busy';
import DelayedAction from '../DelayedAction';
import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '../Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

class Working extends Busy {}

const HANDLER = 'core-unit-test:complete';

// The registries a plugin registers against at import — the singletons, in
// the game — and a game loaded alongside it with registries of its own, which
// is what `core-save-game`'s `gameForLoad` builds (civ-clone/web-renderer#245).
const setUp = () => {
  const busyRegistry = new BusyRegistry(),
    importedEffects = new PendingEffectRegistry(),
    importedTurn = new Turn(),
    loadingEffects = new PendingEffectRegistry(),
    loadingTurn = new Turn(),
    completed: Unit[] = [],
    built: Unit[] = [],
    unit = new Unit(
      null,
      new Player(),
      new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
      new RuleRegistry()
    );

  registerDelayedAction(
    {
      BusyRule: Working,
      handler: HANDLER,
      action: (unit: Unit) => {
        built.push(unit);

        return new DelayedAction(unit.tile(), unit.tile(), unit);
      },
      complete: (unit: Unit): void => {
        completed.push(unit);
      },
    },
    importedEffects,
    busyRegistry,
    new RuleRegistry(),
    importedTurn
  );

  // As `hydrate` leaves it: the effect registered in the loading game only.
  loadingTurn.set(4);
  loadingEffects.register(new PendingEffect(HANDLER, unit, { endTurn: '5' }));

  return {
    built,
    busyRegistry,
    completed,
    importedEffects,
    loadingEffects,
    loadingTurn,
    unit,
  };
};

describe('registerDelayedAction', (): void => {
  it("should find the unit's effect in the game it is being loaded into", (): void => {
    const { busyRegistry, loadingEffects, loadingTurn, unit } = setUp();

    expect(
      busyRegistry.rebuild('Working', unit, {
        pendingEffects: loadingEffects,
        turn: loadingTurn,
      })
    ).to.be.instanceOf(Working);
  });

  it("should finish on the loading game's turn, from its registry", (): void => {
    const { busyRegistry, completed, loadingEffects, loadingTurn, unit } =
      setUp();

    const busy = busyRegistry.rebuild('Working', unit, {
      pendingEffects: loadingEffects,
      rules: new RuleRegistry(),
      turn: loadingTurn,
    });

    expect(busy.validate()).to.equal(false);

    loadingTurn.increment();

    expect(busy.validate()).to.equal(true);

    busy.process();

    expect(completed).to.deep.equal([unit]);
    expect(loadingEffects.entries()).to.deep.equal([]);
  });

  it('should not build the action until the work finishes', (): void => {
    // An action is an entity, so building one while loading takes an id from
    // the counter the load has just restored, and saving the loaded game
    // again writes a different file.
    const { built, busyRegistry, loadingEffects, loadingTurn, unit } = setUp();

    const busy = busyRegistry.rebuild('Working', unit, {
      pendingEffects: loadingEffects,
      turn: loadingTurn,
    });

    expect(built).to.deep.equal([]);

    loadingTurn.increment();
    busy.process();

    expect(built).to.deep.equal([unit]);
  });

  it('should still use the registries it was registered with when given none', (): void => {
    const { busyRegistry, importedEffects, unit } = setUp();

    expect(() => busyRegistry.rebuild('Working', unit)).to.throw(
      MissingPendingEffectError,
      /carries no pending effect/
    );

    importedEffects.register(
      new PendingEffect(HANDLER, unit, { endTurn: '1' })
    );

    expect(busyRegistry.rebuild('Working', unit)).to.be.instanceOf(Working);
  });

  it('should be callable as `factory(unit)`, with no context at all', (): void => {
    // `BusyFactory` is exported, and its context is optional: a caller that
    // invokes a factory directly, rather than through `rebuild`, passes none.
    const busyRegistry = new BusyRegistry(),
      pendingEffects = new PendingEffectRegistry(),
      factories: BusyFactory[] = [],
      unit = new Unit(
        null,
        new Player(),
        new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
        new RuleRegistry()
      );

    busyRegistry.register = (BusyType, factory: BusyFactory): void => {
      factories.push(factory);
    };

    registerDelayedAction(
      {
        BusyRule: Working,
        handler: HANDLER,
        action: (unit: Unit) =>
          new DelayedAction(unit.tile(), unit.tile(), unit),
        complete: (): void => {},
      },
      pendingEffects,
      busyRegistry,
      new RuleRegistry(),
      new Turn()
    );

    pendingEffects.register(new PendingEffect(HANDLER, unit, { endTurn: '1' }));

    const [factory] = factories;

    expect(factory(unit)).to.be.instanceOf(Working);
  });
});
