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
export class UnitLoss extends DataObject implements IUnitLoss {
  private _count: number = 0;
  private _player: Player;
  private _unit: typeof Unit;

  constructor(player: Player, UnitType: typeof Unit) {
    super();

    this.addKey('count', 'player', 'unit');

    this._player = player;
    this._unit = UnitType;
  }

  count(): number {
    return this._count;
  }

  increment(): void {
    this._count++;
  }

  player(): Player {
    return this._player;
  }

  unit(): typeof Unit {
    return this._unit;
  }
}

export default UnitLoss;
