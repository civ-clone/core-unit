import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Unit from '../Unit';
import UnitLossRegistry from '../UnitLossRegistry';
import { expect } from 'chai';

describe('UnitLossRegistry', (): void => {
  const ruleRegistry = new RuleRegistry();

  class Warrior extends Unit {}
  class Trireme extends Unit {}

  it('should start with no losses', (): void => {
    const registry = new UnitLossRegistry(),
      player = new Player(ruleRegistry);

    expect(registry.getByPlayer(player)).to.deep.equal([]);
  });

  it('should count each player’s losses by unit type', (): void => {
    const registry = new UnitLossRegistry(),
      player = new Player(ruleRegistry),
      other = new Player(ruleRegistry);

    registry.record(player, Warrior);
    registry.record(player, Warrior);
    registry.record(player, Trireme);
    registry.record(other, Warrior);

    expect(
      registry
        .getByPlayer(player)
        .map((unitLoss) => [unitLoss.unit(), unitLoss.count()])
    ).to.deep.equal([
      [Warrior, 2],
      [Trireme, 1],
    ]);
    expect(
      registry
        .getByPlayer(other)
        .map((unitLoss) => [unitLoss.unit(), unitLoss.count()])
    ).to.deep.equal([[Warrior, 1]]);
    expect(registry.length).to.equal(3);
  });
});
