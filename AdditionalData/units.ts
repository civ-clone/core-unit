import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '../UnitRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import Player from '@civ-clone/core-player/Player';

export const getAdditionalData = (
  unitRegistry: UnitRegistry = unitRegistryInstance
) => [
  new AdditionalData(Player, 'units', (player: Player) =>
    unitRegistry.getByPlayer(player)
  ),
];

export default getAdditionalData;
