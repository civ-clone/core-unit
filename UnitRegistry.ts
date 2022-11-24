import {
  IEntityRegistry,
  EntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from './Unit';

export interface IUnitRegistry extends IEntityRegistry<Unit> {
  getByCity(city: City): Unit[];
  getByPlayer(player: Player, includeDestroyed?: boolean): Unit[];
  getByTile(tile: Tile): Unit[];
}

export class UnitRegistry
  extends EntityRegistry<Unit>
  implements IUnitRegistry
{
  constructor() {
    super(Unit);
  }

  getByCity(city: City): Unit[] {
    return this.filter(
      (unit: Unit) => unit.city() === city && !unit.destroyed()
    );
  }

  getByPlayer(player: Player, includeDestroyed: boolean = false): Unit[] {
    if (includeDestroyed) {
      return this.getBy('player', player);
    }

    return this.filter(
      (unit: Unit) => unit.player() === player && !unit.destroyed()
    );
  }

  getByTile(tile: Tile): Unit[] {
    return this.filter(
      (unit: Unit) => unit.tile() === tile && !unit.destroyed()
    );
  }
}

export const instance: UnitRegistry = new UnitRegistry();

export default UnitRegistry;
