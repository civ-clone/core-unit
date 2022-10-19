import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';

export class Visibility extends Rule<[Tile, Player], void> {}

export default Visibility;
