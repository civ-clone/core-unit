import { Attack, Defence, Movement, Moves, Visibility } from './Yields';
import {
  Buildable,
  BuildableInstance,
  IBuildable,
} from '@civ-clone/core-city-build/Buildable';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import { Tile, INeighbouringTiles } from '@civ-clone/core-world/Tile';
import Action from './Action';
import ActionRule from './Rules/Action';
import Activate from './Rules/Activate';
import Busy from './Rules/Busy';
import City from '@civ-clone/core-city/City';
import Created from './Rules/Created';
import Destroyed from './Rules/Destroyed';
import Transferred from './Rules/Transferred';
import Player from '@civ-clone/core-player/Player';
import VisibilityRule from './Rules/Visibility';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from './Rules/Yield';
import { IDataObject } from '@civ-clone/core-data-object/DataObject';
import keysChanged from './lib/keysChanged';

export type IActionsForNeighbours = {
  [key: string]: Action[];
};
type IBusy = Busy | null;
type ICity = City | null;

export interface IUnit extends IDataObject {
  action(action: Action, ...args: any[]): void;
  actions(to?: INeighbouringTiles | Tile, from?: Tile): Action[];
  actionsForNeighbours(from: Tile): IActionsForNeighbours;
  activate(): void;
  active(): boolean;
  setActive(active: boolean): void;
  applyVisibility(): void;
  attack(): Attack;
  busy(): IBusy;
  setBusy(rule?: IBusy): void;
  city(): ICity;
  defence(): Defence;
  destroy(player?: Player | null): void;
  destroyed(): boolean;
  setDestroyed(): void;
  movement(): Movement;
  moves(): Moves;
  player(): Player;
  status(): Action | null;
  setStatus(status: Action | null): void;
  tile(): Tile;
  setTile(tile: Tile): void;
  transfer(player: Player, city?: ICity | null): void;
  visibility(): Visibility;
  waiting(): boolean;
  setWaiting(waiting?: boolean): void;
  yield(...yields: Yield[]): Yield[];
}

export class Unit extends Buildable implements IUnit {
  static readonly transient = ['_ruleRegistry'];
  private _active: boolean = true;
  private _busy: IBusy = null;
  private _city: ICity;
  private _destroyed: boolean = false;
  private _moves: Moves = new Moves();
  private _player: Player;
  private _ruleRegistry: RuleRegistry;
  private _status: Action | null = null;
  private _tile: Tile;
  private _waiting: boolean = false;

  constructor(
    city: ICity | null,
    player: Player,
    tile: Tile,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this._city = city;
    this._player = player;
    this._tile = tile;
    this._ruleRegistry = ruleRegistry;

    this.addKey(
      'actions',
      'actionsForNeighbours',
      'active',
      'attack',
      'busy',
      'city',
      'defence',
      'destroyed',
      'movement',
      'moves',
      'player',
      'status',
      'tile',
      'visibility',
      'waiting'
    );

    this._ruleRegistry.process(Created, this);
  }

  static build(
    city: City,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ): BuildableInstance {
    return new this(
      city,
      city.player(),
      city.tile(),
      ruleRegistry
    ) as BuildableInstance;
  }

  action(action: Action, ...args: any[]): void {
    return action.perform(...args);
  }

  actions(
    to: INeighbouringTiles | Tile = this._tile,
    from: Tile = this._tile
  ): Action[] {
    if (typeof to === 'string') {
      to = from.getNeighbour(to);
    }

    return this._ruleRegistry.process(ActionRule, this, to, from);
  }

  actionsForNeighbours(from: Tile = this._tile): IActionsForNeighbours {
    return from.getNeighbouringDirections().reduce(
      (
        object: IActionsForNeighbours,
        direction: INeighbouringTiles
      ): IActionsForNeighbours => ({
        ...object,
        [direction]: this._ruleRegistry.process(
          ActionRule,
          this,
          from.getNeighbour(direction),
          from
        ),
      }),
      {}
    );
  }

  activate(): void {
    this._ruleRegistry.process(Activate, this);
  }

  active(): boolean {
    return this._active;
  }

  setActive(active: boolean = true): void {
    this._active = active;
  }

  applyVisibility(): void {
    this._tile
      .getSurroundingArea(this.visibility().value())
      .forEach((tile: Tile): void => {
        this._ruleRegistry.process(VisibilityRule, tile, this._player);
      });
  }

  attack(): Attack {
    const [unitYield] = this.yield(new Attack());

    return unitYield;
  }

  busy(): IBusy {
    return this._busy;
  }

  setBusy(rule: IBusy = null): void {
    this._busy = rule;
  }

  city(): ICity {
    return this._city;
  }

  /**
   * Hands the unit to `player`, homed in `city` or in none, as a bribed or defecting unit changes sides. It stays the
   * same unit, so its id and anything that refers to it stay valid; what else changes with it (what it loses, when it
   * can next move) is up to the `Transferred` rules.
   */
  transfer(player: Player, city: ICity | null = null): void {
    const previousPlayer = this._player;

    this._player = player;
    // As `setCity` insists: a unit's home is one of its owner's cities, or none.
    this._city = (
      city !== null && city.player() === player ? city : null
    ) as ICity;

    // Before the rules, which may look the unit up by its new owner.
    keysChanged(this);

    this._ruleRegistry.process(Transferred, this, player, previousPlayer);
  }

  setCity(city: City): void {
    if (this.player() !== city.player()) {
      return;
    }

    this._city = city;

    keysChanged(this);
  }

  defence(): Defence {
    const [unitYield] = this.yield(new Defence());

    return unitYield;
  }

  destroy(player: Player | null = null): void {
    this._ruleRegistry.process(Destroyed, this, player);
  }

  destroyed(): boolean {
    return this._destroyed;
  }

  setDestroyed(): void {
    this._destroyed = true;
  }

  movement(): Movement {
    const [unitYield] = this.yield(new Movement());

    return unitYield;
  }

  moves(): Moves {
    return this._moves;
  }

  player(): Player {
    return this._player;
  }

  status(): Action | null {
    return this._status;
  }

  setStatus(status: Action | null): void {
    this._status = status;
  }

  tile(): Tile {
    return this._tile;
  }

  setTile(tile: Tile): void {
    this._tile = tile;

    keysChanged(this);
  }

  visibility(): Visibility {
    const [unitYield] = this.yield(new Visibility());

    return unitYield;
  }

  waiting(): boolean {
    return this._waiting;
  }

  setWaiting(waiting: boolean = true): void {
    this._waiting = waiting;
  }

  yield(...yields: Yield[]): Yield[] {
    const rules = this._ruleRegistry.get(YieldRule);

    yields.forEach((unitYield: Yield): void =>
      rules
        .filter((rule: YieldRule): boolean => rule.validate(this, unitYield))
        .forEach((rule: YieldRule): any => rule.process(this, unitYield))
    );

    return yields;
  }
}

export default Unit;
