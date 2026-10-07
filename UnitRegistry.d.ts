import {
  IEntityRegistry,
  EntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import { KeyWatcher } from './lib/keysChanged';
import Unit from './Unit';
export interface IUnitRegistry extends IEntityRegistry<Unit> {
  getByCity(city: City): Unit[];
  getByPlayer(player: Player, includeDestroyed?: boolean): Unit[];
  getByTile(tile: Tile): Unit[];
}
export declare class UnitRegistry
  extends EntityRegistry<Unit>
  implements IUnitRegistry, KeyWatcher<Unit>
{
  private _order;
  private _nextOrder;
  private _filed;
  private _byCity;
  private _byPlayer;
  private _byTile;
  constructor();
  register(...units: Unit[]): void;
  unregister(...units: Unit[]): void;
  keysChanged(unit: Unit): void;
  reindex(unit: Unit): void;
  private file;
  private unfile;
  getByCity(city: City): Unit[];
  getByPlayer(player: Player, includeDestroyed?: boolean): Unit[];
  getByTile(tile: Tile): Unit[];
}
export declare const instance: UnitRegistry;
export default UnitRegistry;
