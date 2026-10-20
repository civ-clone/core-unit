import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '../UnitRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';

export const getAdditionalData = (
  unitRegistry: UnitRegistry = unitRegistryInstance
) => [
  new AdditionalData(City, 'units', (city: City) =>
    unitRegistry.getByCity(city)
  ),
  // Only the units a player still has: a destroyed one goes out once, marked destroyed, and then drops out of the list
  //  (civ-clone/web-renderer#459).
  new AdditionalData(Player, 'units', (player: Player) =>
    unitRegistry.getByPlayer(player)
  ),
  new AdditionalData(Tile, 'units', (tile: Tile) =>
    unitRegistry.getByTile(tile)
  ),
];

export default getAdditionalData;
