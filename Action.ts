import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import Tile from '@civ-clone/core-world/Tile';
import Unit from './Unit';

export interface IAction extends IDataObject {
  forUnit(unit: Unit): Action;
  from(): Tile;
  perform(...args: any[]): void;
  ruleRegistry(): RuleRegistry;
  to(): Tile;
  unit(): Unit;
}

export class Action extends DataObject implements IAction {
  private _from: Tile;
  private _ruleRegistry: RuleRegistry;
  private _to: Tile;
  private _unit: Unit;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this._from = from;
    this._ruleRegistry = ruleRegistry;
    this._to = to;
    this._unit = unit;

    this.addKey('from', 'to');
  }

  forUnit(unit: Unit): Action {
    return new (<typeof Action>this.constructor)(
      this._from,
      this._to,
      unit,
      this._ruleRegistry
    );
  }

  from(): Tile {
    return this._from;
  }

  perform(...args: any[]): void {}

  ruleRegistry(): RuleRegistry {
    return this._ruleRegistry;
  }

  to(): Tile {
    return this._to;
  }

  unit(): Unit {
    return this._unit;
  }
}

export default Action;
