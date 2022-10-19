import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '../Unit';
import Yield from '@civ-clone/core-yield/Yield';
export declare class Unsupported extends Rule<[City, Unit, Yield], void> {}
export default Unsupported;
