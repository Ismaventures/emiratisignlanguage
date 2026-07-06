import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MlController } from './ml.controller';
import { MlService } from './ml.service';
import { MlClientService } from './ml-client.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
  ],
  controllers: [MlController],
  providers: [MlService, MlClientService],
  exports: [MlService],
})
export class MlModule {}
