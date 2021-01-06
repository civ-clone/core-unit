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
export declare class UnitRegistry
  extends EntityRegistry<Unit>
  implements IUnitRegistry {
  constructor();
  getByCity(city: City): Unit[];
  getByPlayer(player: Player): Unit[];
  getByTile(tile: Tile): Unit[];
}
export declare const instance: UnitRegistry;
export default UnitRegistry;
