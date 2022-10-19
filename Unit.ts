import { Attack, Defence, Movement, Moves, Visibility } from './Yields';
import { Buildable, IBuildable } from '@civ-clone/core-city-build/Buildable';
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
import Player from '@civ-clone/core-player/Player';
import VisibilityRule from './Rules/Visibility';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from './Rules/Yield';

export type IActionsForNeighbours = {
  [key: string]: Action[];
};
type IBusy = Busy | null;
type ICity = City | null;

export interface IUnit extends IBuildable {
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
  status(): Action | null;
  setStatus(status: Action | null): void;
  tile(): Tile;
  setTile(tile: Tile): void;
  visibility(): Visibility;
  waiting(): boolean;
  setWaiting(waiting: boolean): void;
  yield(...yields: Yield[]): Yield[];
}

// https://github.com/microsoft/TypeScript/issues/4628
// @ts-expect-error
export class Unit extends Buildable implements IUnit {
  #active: boolean = true;
  #busy: IBusy = null;
  #city: ICity;
  #destroyed: boolean = false;
  #moves: Moves = new Moves();
  #player: Player;
  #ruleRegistry: RuleRegistry;
  #status: Action | null = null;
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
      'player',
      'status',
      'tile',
      'visibility',
      'waiting'
    );

    this.#ruleRegistry.process(Created, this);
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

    return this.#ruleRegistry.process(ActionRule, this, to, from);
  }

  actionsForNeighbours(from: Tile = this.#tile): IActionsForNeighbours {
    return from.getNeighbouringDirections().reduce(
      (
        object: IActionsForNeighbours,
        direction: INeighbouringTiles
      ): IActionsForNeighbours => ({
        ...object,
        [direction]: this.#ruleRegistry.process(
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
    this.#ruleRegistry.process(Activate, this);
  }

  active(): boolean {
    return this.#active;
  }

  setActive(active: boolean = true): void {
    this.#active = active;
  }

  applyVisibility(): void {
    this.#tile
      .getSurroundingArea(this.visibility().value())
      .forEach((tile: Tile): void => {
        this.#ruleRegistry.process(VisibilityRule, tile, this.#player);
      });
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

  static build(city: City, ruleRegistry: RuleRegistry = ruleRegistryInstance) {
    return new this(city, city.player(), city.tile(), ruleRegistry);
  }

  defence(): Defence {
    const [unitYield] = this.yield(new Defence());

    return unitYield;
  }

  destroy(player: Player | null = null): void {
    this.#ruleRegistry.process(Destroyed, this, player);
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

  status(): Action | null {
    return this.#status;
  }

  setStatus(status: Action | null): void {
    this.#status = status;
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
    const rules = this.#ruleRegistry.get(YieldRule);

    yields.forEach((unitYield: Yield): void =>
      rules
        .filter((rule: YieldRule): boolean => rule.validate(this, unitYield))
        .forEach((rule: YieldRule): any => rule.process(this, unitYield))
    );

    return yields;
  }
}

export default Unit;
