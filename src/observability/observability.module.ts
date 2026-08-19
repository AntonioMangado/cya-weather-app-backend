import { Module } from '@nestjs/common';
import { WideEventService } from './wide-event.service';

@Module({
  providers: [WideEventService],
  exports: [WideEventService],
})
export class ObservabilityModule {}
