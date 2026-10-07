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

// A home city of `null` or `undefined` is a key like any other here, as the scan compared with `===`; the index leaves
//  those keys out, so they stand in for them.
const noHome = Symbol('no home'),
  undefinedHome = Symbol('undefined home'),
  homeKey = (
    city: City | null | undefined
  ): City | typeof noHome | typeof undefinedHome =>
    city === null ? noHome : city === undefined ? undefinedHome : city;

export class UnitRegistry
  extends EntityRegistry<Unit>
  implements IUnitRegistry
{
  // A unit's tile, home and owner all change, and `Unit` says so (`keysChanged`) when they do. Scanning every unit for
  //  each lookup was 17% of a late-game turn (civ-clone/web-renderer#308).
  private _byCity = this.index((unit: Unit) => homeKey(unit.city()));
  private _byPlayer = this.index((unit: Unit): Player => unit.player());
  private _byTile = this.index((unit: Unit): Tile => unit.tile());

  constructor() {
    super(Unit);
  }

  getByCity(city: City): Unit[] {
    return this._byCity
      .get(homeKey(city))
      .filter((unit: Unit): boolean => !unit.destroyed());
  }

  getByPlayer(player: Player, includeDestroyed: boolean = false): Unit[] {
    const units = this._byPlayer.get(player);

    if (includeDestroyed) {
      return units;
    }

    return units.filter((unit: Unit): boolean => !unit.destroyed());
  }

  getByTile(tile: Tile): Unit[] {
    return this._byTile
      .get(tile)
      .filter((unit: Unit): boolean => !unit.destroyed());
  }
}

export const instance: UnitRegistry = new UnitRegistry();

export default UnitRegistry;
