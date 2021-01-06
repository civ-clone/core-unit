import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
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
export declare class Action extends DataObject implements IAction {
  #private;
  constructor(from: Tile, to: Tile, unit: Unit, ruleRegistry?: RuleRegistry);
  forUnit(unit: Unit): Action;
  from(): Tile;
  perform(...args: any[]): void;
  ruleRegistry(): RuleRegistry;
  to(): Tile;
  unit(): Unit;
}
export default Action;
