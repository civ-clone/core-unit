import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import Player from '@civ-clone/core-player/Player';
import Unit from './Unit';
import UnitLoss from './UnitLoss';
export interface IUnitLossRegistry extends IEntityRegistry<UnitLoss> {
  getByPlayer(player: Player): UnitLoss[];
  record(player: Player, UnitType: typeof Unit): UnitLoss;
}
/**
 * The units each player has lost, by type: one `UnitLoss` per player and type, made the first time one is lost, so a
 * game (or a save made before this existed) starts with none.
 */
export declare class UnitLossRegistry
  extends EntityRegistry<UnitLoss>
  implements IUnitLossRegistry
{
  constructor();
  getByPlayer(player: Player): UnitLoss[];
  record(player: Player, UnitType: typeof Unit): UnitLoss;
}
export declare const instance: UnitLossRegistry;
export default UnitLossRegistry;
