import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';

// The unit, who has it now, and who had it (`Unit#transfer`).
export class Transferred extends Rule<[Unit, Player, Player], void> {}

export default Transferred;
