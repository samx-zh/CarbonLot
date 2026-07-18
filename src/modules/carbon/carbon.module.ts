import { Module } from '@nitrostack/core';
import { CarbonResources } from './carbon.resources.js';
import { CarbonTools } from './carbon.tools.js';

@Module({
  name: 'carbon',
  description: 'CBAM carbon emissions compliance tools and data resources',
  providers: [CarbonResources, CarbonTools]
})
export class CarbonModule {}