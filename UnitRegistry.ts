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
  getByPlayer(player: Player): Unit[];
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
    return this.getBy('city', city);
  }

  getByPlayer(player: Player): Unit[] {
    return this.getBy('player', player);
  }

  getByTile(tile: Tile): Unit[] {
    return this.getBy('tile', tile);
  }
}

export const instance: UnitRegistry = new UnitRegistry();

export default UnitRegistry;
