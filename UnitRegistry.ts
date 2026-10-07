import {
  IEntityRegistry,
  EntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import { KeyWatcher, unwatchKeys, watchKeys } from './lib/keysChanged';
import Unit from './Unit';

export interface IUnitRegistry extends IEntityRegistry<Unit> {
  getByCity(city: City): Unit[];
  getByPlayer(player: Player, includeDestroyed?: boolean): Unit[];
  getByTile(tile: Tile): Unit[];
}

type Keys = [City | null, Player, Tile];

// The index buckets below, one per tile, home city and owner. Each is kept in the order its units were registered,
//  which is the order `filter` would have returned them in, so a lookup gives the same answer in the same order as the
//  scan it replaces. Scanning every unit for each lookup was 17% of a late-game turn (civ-clone/web-renderer#308).
class Buckets<K> {
  private _buckets: Map<K, Unit[]> = new Map();
  private _order: Map<Unit, number>;

  constructor(order: Map<Unit, number>) {
    this._order = order;
  }

  add(key: K, unit: Unit): void {
    const bucket = this._buckets.get(key);

    if (!bucket) {
      this._buckets.set(key, [unit]);

      return;
    }

    const position = this._order.get(unit)!;
    let low = 0,
      high = bucket.length;

    while (low < high) {
      const middle = (low + high) >>> 1;

      if (this._order.get(bucket[middle])! < position) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    bucket.splice(low, 0, unit);
  }

  get(key: K): Unit[] {
    return this._buckets.get(key) ?? [];
  }

  remove(key: K, unit: Unit): void {
    const bucket = this._buckets.get(key);

    if (!bucket) {
      return;
    }

    const index = bucket.indexOf(unit);

    if (index > -1) {
      bucket.splice(index, 1);
    }

    if (bucket.length === 0) {
      this._buckets.delete(key);
    }
  }
}

export class UnitRegistry
  extends EntityRegistry<Unit>
  implements IUnitRegistry, KeyWatcher<Unit>
{
  // When each unit was registered, which is its place in `entries()`: registering appends, and a unit unregistered
  //  and registered again goes to the end, as it does there.
  private _order: Map<Unit, number> = new Map();
  private _nextOrder: number = 0;
  // The keys each unit was filed under, so it can be taken out of those buckets after its own have changed.
  private _filed: Map<Unit, Keys> = new Map();
  private _byCity: Buckets<City | null> = new Buckets(this._order);
  private _byPlayer: Buckets<Player> = new Buckets(this._order);
  private _byTile: Buckets<Tile> = new Buckets(this._order);

  constructor() {
    super(Unit);
  }

  register(...units: Unit[]): void {
    units.forEach((unit: Unit): void => {
      super.register(unit);

      if (this._order.has(unit)) {
        return;
      }

      this._order.set(unit, this._nextOrder++);
      this.file(unit);
      watchKeys(unit, this);
    });
  }

  unregister(...units: Unit[]): void {
    super.unregister(...units);

    units.forEach((unit: Unit): void => {
      if (!this._order.has(unit)) {
        return;
      }

      unwatchKeys(unit, this);
      this.unfile(unit);
      this._order.delete(unit);
    });
  }

  keysChanged(unit: Unit): void {
    if (!this._filed.has(unit)) {
      return;
    }

    this.unfile(unit);
    this.file(unit);
  }

  reindex(unit: Unit): void {
    super.reindex(unit);

    this.keysChanged(unit);
  }

  private file(unit: Unit): void {
    // As they are, without coercing: the scan compared with `===`, so `null` and `undefined` stay different keys.
    const keys: Keys = [unit.city(), unit.player(), unit.tile()];

    this._filed.set(unit, keys);
    this._byCity.add(keys[0], unit);
    this._byPlayer.add(keys[1], unit);
    this._byTile.add(keys[2], unit);
  }

  private unfile(unit: Unit): void {
    const keys = this._filed.get(unit);

    if (!keys) {
      return;
    }

    this._byCity.remove(keys[0], unit);
    this._byPlayer.remove(keys[1], unit);
    this._byTile.remove(keys[2], unit);
    this._filed.delete(unit);
  }

  getByCity(city: City): Unit[] {
    return this._byCity
      .get(city)
      .filter((unit: Unit): boolean => !unit.destroyed());
  }

  getByPlayer(player: Player, includeDestroyed: boolean = false): Unit[] {
    const units = this._byPlayer.get(player);

    if (includeDestroyed) {
      return units.slice();
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
