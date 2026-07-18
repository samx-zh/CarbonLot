import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { CarbonModule } from './modules/carbon/carbon.module.js';


@McpApp({
    module: AppModule,
    server: {
        name: 'carbonlot',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'carbonlot',
    description: 'CBAM embedded-emissions compliance agent',
    imports: [
        ConfigModule.forRoot(),
        CarbonModule
    ],
})
export class AppModule { }