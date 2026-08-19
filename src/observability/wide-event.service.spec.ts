import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { WideEventService } from './wide-event.service';
import { WideEvent } from './wide-event.interface';

jest.mock('node:fs/promises');

describe('WideEventService', () => {
  let service: WideEventService;

  beforeEach(() => {
    service = new WideEventService();
    jest.mocked(mkdir).mockResolvedValue(undefined);
    jest.mocked(appendFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('appends the event as a JSON line to a file named after the event date', async () => {
    const event: WideEvent = {
      timestamp: '2026-08-19T15:00:00.000Z',
      userType: 'guest',
      method: 'GET',
      endpoint: '/weather?city=Madrid',
      statusCode: 200,
      responseToClient: { forecast: [] },
    };

    await service.record(event);

    expect(mkdir).toHaveBeenCalledWith(
      join(process.cwd(), 'logs'),
      expect.objectContaining({ recursive: true }),
    );
    expect(appendFile).toHaveBeenCalledWith(
      join(process.cwd(), 'logs', 'wide-events-2026-08-19.log'),
      `${JSON.stringify(event)}\n`,
      'utf8',
    );
  });

  it('names the file after each event own date, so events land in different files', async () => {
    const eventDayOne: WideEvent = {
      timestamp: '2026-08-19T23:59:00.000Z',
      userType: 'guest',
      method: 'GET',
      endpoint: '/weather',
      statusCode: 200,
    };
    const eventDayTwo: WideEvent = {
      timestamp: '2026-08-20T00:01:00.000Z',
      userType: 'guest',
      method: 'GET',
      endpoint: '/weather',
      statusCode: 200,
    };

    await service.record(eventDayOne);
    await service.record(eventDayTwo);

    expect(appendFile).toHaveBeenNthCalledWith(
      1,
      join(process.cwd(), 'logs', 'wide-events-2026-08-19.log'),
      expect.any(String),
      'utf8',
    );
    expect(appendFile).toHaveBeenNthCalledWith(
      2,
      join(process.cwd(), 'logs', 'wide-events-2026-08-20.log'),
      expect.any(String),
      'utf8',
    );
  });
});
