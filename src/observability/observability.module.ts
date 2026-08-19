import { Module } from '@nestjs/common';
import { InMemoryWideEventStore } from './in-memory-wide-event.store';
import { WIDE_EVENT_STORE } from './wide-event-store.interface';
import { WideEventLoggerService } from './wide-event-logger.service';

@Module({
  providers: [
    { provide: WIDE_EVENT_STORE, useClass: InMemoryWideEventStore },
    WideEventLoggerService,
  ],
  exports: [WideEventLoggerService],
})
export class ObservabilityModule {}
