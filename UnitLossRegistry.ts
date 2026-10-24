import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import Player from '@civ-clone/core-player/Player';
import Unit from './Unit';
import UnitLoss from './UnitLoss';

export interface IUnitLossRegistry extends IEntityRegistry<UnitLoss> {
  getByPlayer(player: Player): UnitLoss[];
  record(player: Player, UnitType: typeof Unit): UnitLoss;
}

/**
 * The units each player has lost, by type: one `UnitLoss` per player and type, made the first time one is lost, so a
 * game (or a save made before this existed) starts with none.
 */
export class UnitLossRegistry
  extends EntityRegistry<UnitLoss>
  implements IUnitLossRegistry
{
  constructor() {
    super(UnitLoss);
  }

  getByPlayer(player: Player): UnitLoss[] {
    return this.getBy('player', player);
  }

  record(player: Player, UnitType: typeof Unit): UnitLoss {
    const existing = this.getByPlayer(player).find(
        (unitLoss: UnitLoss): boolean => unitLoss.unit() === UnitType
      ),
      unitLoss = existing ?? new UnitLoss(player, UnitType);

    if (!existing) {
      this.register(unitLoss);
    }

    unitLoss.increment();

    return unitLoss;
  }
}

export const instance: UnitLossRegistry = new UnitLossRegistry();

export default UnitLossRegistry;
