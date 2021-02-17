import { instance as additionalDataRegistryInstance } from '@civ-clone/core-data-object/AdditionalDataRegistry';
import units from './AdditionalData/units';

additionalDataRegistryInstance.register(...units());
