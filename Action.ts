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
  perform({}: { [key: string]: any[] }): void;
  ruleRegistry(): RuleRegistry;
  to(): Tile;
  unit(): Unit;
}

export class Action extends DataObject implements IAction {
  #from: Tile;
  #ruleRegistry: RuleRegistry;
  #to: Tile;
  #unit: Unit;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this.#from = from;
    this.#ruleRegistry = ruleRegistry;
    this.#to = to;
    this.#unit = unit;

    this.addKey('from', 'to');
  }

  forUnit(unit: Unit): Action {
    return new (<typeof Action>this.constructor)(
      this.#from,
      this.#to,
      unit,
      this.#ruleRegistry
    );
  }

  from(): Tile {
    return this.#from;
  }

  perform(...args: any[]): void {}

  ruleRegistry(): RuleRegistry {
    return this.#ruleRegistry;
  }

  to(): Tile {
    return this.#to;
  }

  unit(): Unit {
    return this.#unit;
  }
}

export default Action;
