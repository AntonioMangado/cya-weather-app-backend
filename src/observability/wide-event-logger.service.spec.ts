import { Test, TestingModule } from '@nestjs/testing';
import { WideEventLoggerService } from './wide-event-logger.service';
import { WIDE_EVENT_STORE, WideEventStore } from './wide-event-store.interface';
import { WideEvent } from './wide-event.interface';

describe('WideEventLoggerService', () => {
  let service: WideEventLoggerService;
  let store: jest.Mocked<WideEventStore>;

  beforeEach(async () => {
    store = { record: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WideEventLoggerService,
        { provide: WIDE_EVENT_STORE, useValue: store },
      ],
    }).compile();

    service = module.get<WideEventLoggerService>(WideEventLoggerService);
  });

  it('delegates to the injected store', async () => {
    const event: WideEvent = {
      timestamp: '2026-08-19T15:00:00.000Z',
      userType: 'guest',
      method: 'GET',
      endpoint: '/weather',
      statusCode: 200,
      responseToClient: { forecast: [] },
    };

    await service.record(event);

    expect(store.record).toHaveBeenCalledWith(event);
  });
});
