import { Attack, Defence, Movement, Moves, Visibility } from './Yields';
import { Buildable, IBuildable } from '@civ-clone/core-city-build/Buildable';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Tile, INeighbouringTiles } from '@civ-clone/core-world/Tile';
import Action from './Action';
import Busy from './Rules/Busy';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Yield from '@civ-clone/core-yield/Yield';
export declare type IActionsForNeighbours = {
  [key: string]: Action[];
};
declare type IBusy = Busy | null;
declare type ICity = City | null;
export interface IUnit extends IBuildable {
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
  visibility(): Visibility;
  waiting(): boolean;
  setWaiting(waiting?: boolean): void;
  yield(...yields: Yield[]): Yield[];
}
export declare class Unit extends Buildable implements IUnit {
  #private;
  constructor(
    city: ICity | null,
    player: Player,
    tile: Tile,
    ruleRegistry?: RuleRegistry
  );
  action(action: Action, ...args: any[]): void;
  actions(to?: INeighbouringTiles | Tile, from?: Tile): Action[];
  actionsForNeighbours(from?: Tile): IActionsForNeighbours;
  activate(): void;
  active(): boolean;
  setActive(active?: boolean): void;
  applyVisibility(): void;
  attack(): Attack;
  busy(): IBusy;
  setBusy(rule?: IBusy): void;
  city(): ICity;
  static build(city: City, ruleRegistry?: RuleRegistry): Unit;
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
  visibility(): Visibility;
  waiting(): boolean;
  setWaiting(waiting?: boolean): void;
  yield(...yields: Yield[]): Yield[];
}
export default Unit;
