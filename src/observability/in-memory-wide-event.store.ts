import { Injectable } from '@nestjs/common';
import { WideEvent } from './wide-event.interface';
import { WideEventStore } from './wide-event-store.interface';

@Injectable()
export class InMemoryWideEventStore implements WideEventStore {
  private readonly events: WideEvent[] = [];

  record(event: WideEvent): Promise<void> {
    this.events.push(event);
    return Promise.resolve();
  }

  getRecordedEvents(): readonly WideEvent[] {
    return this.events;
  }
}
