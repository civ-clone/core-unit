import { Action as ActionRule, IActionRegistry } from './Rules/Action';
import { Activate, IActivateRegistry } from './Rules/Activate';
import { Attack, Defence, Movement, Moves, Visibility } from './Yields';
import { Created, ICreatedRegistry } from './Rules/Created';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import { Destroyed, IDestroyedRegistry } from './Rules/Destroyed';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import { Tile, INeighbouringTiles } from '@civ-clone/core-world/Tile';
import {
  Visibility as VisibilityRule,
  IVisibilityRegistry,
} from './Rules/Visibility';
import { Yield as YieldRule, IYieldRegistry } from './Rules/Yield';
import Action from './Action';
import Busy from './Rules/Busy';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Yield from '@civ-clone/core-yield/Yield';

export type IActionsForNeighbours = {
  [key: string]: Action[];
};
type IBusy = Busy | null;
type ICity = City | null;

export interface IUnit extends IDataObject {
  action(action: Action, ...args: any[]): void;
  actions(to: INeighbouringTiles | Tile, from: Tile): Action[];
  actionsForNeighbours(from: Tile): IActionsForNeighbours;
  activate(): void;
  active(): boolean;
  setActive(active: boolean): void;
  applyVisibility(): void;
  attack(): Attack;
  busy(): IBusy;
  setBusy(rule: IBusy): void;
  city(): ICity;
  defence(): Defence;
  destroy(player: Player | null): void;
  destroyed(): boolean;
  setDestroyed(): void;
  movement(): Movement;
  moves(): Moves;
  player(): Player;
  tile(): Tile;
  setTile(tile: Tile): void;
  visibility(): Visibility;
  waiting(): boolean;
  setWaiting(waiting: boolean): void;
  yield(...yields: Yield[]): Yield[];
}

export class Unit extends DataObject implements IUnit {
  #active: boolean = true;
  #busy: IBusy = null;
  #city: ICity;
  #destroyed: boolean = false;
  #moves: Moves = new Moves();
  #player: Player;
  #ruleRegistry: RuleRegistry;
  #tile: Tile;
  #waiting: boolean = false;

  constructor(
    city: ICity | null,
    player: Player,
    tile: Tile,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this.#city = city;
    this.#player = player;
    this.#tile = tile;
    this.#ruleRegistry = ruleRegistry;

    (this.#ruleRegistry as ICreatedRegistry).process(Created, this);

    this.addKey(
      'actions',
      'actionsForNeighbours',
      'active',
      'attack',
      'busy',
      'city',
      'defence',
      'movement',
      'moves',
      // 'player', // TODO: add this back in
      'tile',
      'waiting'
    );
  }

  action(action: Action, ...args: any[]): void {
    return action.perform(...args);
  }

  actions(
    to: INeighbouringTiles | Tile = this.#tile,
    from: Tile = this.#tile
  ): Action[] {
    if (typeof to === 'string') {
      to = from.getNeighbour(to);
    }

    return (this.#ruleRegistry as IActionRegistry).process(
      ActionRule,
      this,
      to,
      from
    );
  }

  actionsForNeighbours(from: Tile = this.#tile): IActionsForNeighbours {
    return from.getNeighbouringDirections().reduce(
      (
        object: IActionsForNeighbours,
        direction: INeighbouringTiles
      ): IActionsForNeighbours => ({
        ...object,
        [direction]: (this.#ruleRegistry as IActionRegistry).process(
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
    (this.#ruleRegistry as IActivateRegistry).process(Activate, this);
  }

  active(): boolean {
    return this.#active;
  }

  setActive(active: boolean = true): void {
    this.#active = active;
  }

  applyVisibility(): void {
    const rules = (this.#ruleRegistry as IVisibilityRegistry).get(
      VisibilityRule
    );

    this.#tile
      .getSurroundingArea(this.visibility().value())
      .forEach((tile: Tile): void =>
        rules
          .filter((rule: VisibilityRule): boolean =>
            rule.validate(tile, this.#player)
          )
          .forEach((rule: VisibilityRule): void =>
            rule.process(tile, this.#player)
          )
      );
  }

  attack(): Attack {
    const [unitYield] = this.yield(new Attack());

    return unitYield;
  }

  busy(): IBusy {
    return this.#busy;
  }

  setBusy(rule: IBusy = null): void {
    this.#busy = rule;
  }

  city(): ICity {
    return this.#city;
  }

  static createFromObject({
    city = null,
    player,
    ruleRegistry = ruleRegistryInstance,
    tile,
  }: {
    city: ICity;
    player: Player;
    ruleRegistry?: RuleRegistry;
    tile: Tile;
  }): Unit {
    return new this(city, player, tile, ruleRegistry);
  }

  defence(): Defence {
    const [unitYield] = this.yield(new Defence());

    return unitYield;
  }

  destroy(player: Player | null = null): void {
    (this.#ruleRegistry as IDestroyedRegistry).process(Destroyed, this, player);
  }

  destroyed(): boolean {
    return this.#destroyed;
  }

  setDestroyed(): void {
    this.#destroyed = true;
  }

  movement(): Movement {
    const [unitYield] = this.yield(new Movement());

    return unitYield;
  }

  moves(): Moves {
    return this.#moves;
  }

  player(): Player {
    return this.#player;
  }

  tile(): Tile {
    return this.#tile;
  }

  setTile(tile: Tile): void {
    this.#tile = tile;
  }

  visibility(): Visibility {
    const [unitYield] = this.yield(new Visibility());

    return unitYield;
  }

  waiting(): boolean {
    return this.#waiting;
  }

  setWaiting(waiting: boolean = true): void {
    this.#waiting = waiting;
  }

  yield(...yields: Yield[]): Yield[] {
    const rules = (this.#ruleRegistry as IYieldRegistry).get(YieldRule);

    yields.forEach((unitYield: Yield): void =>
      rules
        .filter((rule: YieldRule): boolean => rule.validate(this, unitYield))
        .forEach((rule: YieldRule): any => rule.process(this, unitYield))
    );

    return yields;
  }
}

export default Unit;
