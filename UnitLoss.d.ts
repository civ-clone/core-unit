import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import Player from '@civ-clone/core-player/Player';
import Unit from './Unit';
export interface IUnitLoss extends IDataObject {
  count(): number;
  increment(): void;
  player(): Player;
  unit(): typeof Unit;
}
/**
 * How many units of one type a player has lost. An entity so that it's saved with the game; a ruleset decides what
 * counts as a loss.
 */
export declare class UnitLoss extends DataObject implements IUnitLoss {
  private _count;
  private _player;
  private _unit;
  constructor(player: Player, UnitType: typeof Unit);
  count(): number;
  increment(): void;
  player(): Player;
  unit(): typeof Unit;
}
export default UnitLoss;
