import { InMemoryWideEventStore } from './in-memory-wide-event.store';
import { WideEvent } from './wide-event.interface';

describe('InMemoryWideEventStore', () => {
  it('records events and exposes them in insertion order', async () => {
    const store = new InMemoryWideEventStore();
    const first: WideEvent = {
      timestamp: '2026-08-19T15:00:00.000Z',
      userType: 'guest',
      method: 'GET',
      endpoint: '/weather',
      statusCode: 200,
    };
    const second: WideEvent = { ...first, statusCode: 404 };

    await store.record(first);
    await store.record(second);

    expect(store.getRecordedEvents()).toEqual([first, second]);
  });
});
