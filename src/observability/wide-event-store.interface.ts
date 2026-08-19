import { WideEvent } from './wide-event.interface';

export const WIDE_EVENT_STORE = Symbol('WIDE_EVENT_STORE');

export interface WideEventStore {
  record(event: WideEvent): Promise<void>;
}
