import { Inject, Injectable } from '@nestjs/common';
import { WideEvent } from './wide-event.interface';
import { WIDE_EVENT_STORE } from './wide-event-store.interface';
import type { WideEventStore } from './wide-event-store.interface';

@Injectable()
export class WideEventLoggerService {
  constructor(
    @Inject(WIDE_EVENT_STORE) private readonly store: WideEventStore,
  ) {}

  record(event: WideEvent): Promise<void> {
    return this.store.record(event);
  }
}
