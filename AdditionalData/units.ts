import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '../UnitRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';

export const getAdditionalData = (
  unitRegistry: UnitRegistry = unitRegistryInstance
) => [
  new AdditionalData(Player, 'units', (player: Player) =>
    unitRegistry.getByPlayer(player)
  ),
  new AdditionalData(Tile, 'units', (tile: Tile) =>
    unitRegistry.getByTile(tile)
  ),
];

export default getAdditionalData;
