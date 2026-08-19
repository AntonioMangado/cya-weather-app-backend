import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { WideEventService } from './../src/observability/wide-event.service';
import { WideEvent } from './../src/observability/wide-event.interface';

describe('Weather (e2e)', () => {
  let app: INestApplication<App>;
  let fetchMock: jest.MockedFunction<typeof fetch>;
  let wideEventRecord: jest.Mock<Promise<void>, [WideEvent]>;

  beforeEach(async () => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    wideEventRecord = jest.fn<Promise<void>, [WideEvent]>().mockResolvedValue();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WideEventService)
      .useValue({ record: wideEventRecord })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it('records one wide event with all required fields on a successful forecast lookup', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          location: { name: 'Madrid', country: 'Spain' },
          forecast: {
            forecastday: [
              {
                date: '2026-08-19',
                day: {
                  maxtemp_c: 30,
                  mintemp_c: 18,
                  condition: { text: 'Sunny', icon: '//cdn/sunny.png' },
                },
              },
            ],
          },
        }),
    } as Response);

    await request(app.getHttpServer())
      .get('/weather')
      .query({ city: 'Madrid' })
      .expect(200);

    expect(wideEventRecord).toHaveBeenCalledTimes(1);
    const event = wideEventRecord.mock.calls[0][0];
    expect(event).toMatchObject({
      userType: 'guest',
      method: 'GET',
      statusCode: 200,
    });
    expect(event.endpoint).toContain('/weather');
    expect(typeof event.timestamp).toBe('string');
    expect(event.upstreamResponse).toBeDefined();
    expect(event.responseToClient).toBeDefined();
  });

  it('records one wide event with the error message on a failed forecast lookup', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: { code: 1006, message: 'No matching location found.' },
        }),
    } as Response);

    await request(app.getHttpServer())
      .get('/weather')
      .query({ city: 'Nowhereland' })
      .expect(404);

    expect(wideEventRecord).toHaveBeenCalledTimes(1);
    const event = wideEventRecord.mock.calls[0][0];
    expect(event).toMatchObject({ userType: 'guest', statusCode: 404 });
    expect(event.errorMessage).toContain('Nowhereland');
  });

  it('records a wide event even when the city param is missing', async () => {
    await request(app.getHttpServer()).get('/weather').expect(400);

    expect(wideEventRecord).toHaveBeenCalledTimes(1);
    expect(wideEventRecord.mock.calls[0][0]).toMatchObject({
      statusCode: 400,
      errorMessage: 'city query parameter is required',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
