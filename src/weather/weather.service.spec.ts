import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WEATHER_API_URL } from './weather.constants';
import { WideEvent } from '../observability/wide-event.interface';

function createEvent(): WideEvent {
  return {
    timestamp: '2026-08-19T15:00:00.000Z',
    userType: 'guest',
    method: 'GET',
    endpoint: '/weather?city=Madrid',
    statusCode: 200,
  };
}

describe('WeatherService', () => {
  let service: WeatherService;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(async () => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-api-key') },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls WeatherAPI with the correct query params', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          location: { name: 'Madrid', country: 'Spain' },
          forecast: { forecastday: [] },
        }),
    } as Response);

    await service.getForecast('Madrid', createEvent());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0] as URL;
    expect(calledUrl.origin + calledUrl.pathname).toBe(WEATHER_API_URL);
    expect(calledUrl.searchParams.get('key')).toBe('test-api-key');
    expect(calledUrl.searchParams.get('q')).toBe('Madrid');
    expect(calledUrl.searchParams.get('days')).toBe('4');
  });

  it('maps the WeatherAPI response to a WeatherResponseDto, dropping unlisted fields, and records the upstream response on the event', async () => {
    const rawResponse = {
      location: { name: 'Madrid', country: 'Spain' },
      forecast: {
        forecastday: [
          {
            date: '2026-08-19',
            astro: { sunrise: '06:00 AM' },
            day: {
              maxtemp_c: 30,
              mintemp_c: 18,
              avgtemp_c: 24,
              condition: { text: 'Sunny', icon: '//cdn/sunny.png' },
            },
          },
        ],
      },
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(rawResponse),
    } as Response);

    const event = createEvent();
    const result = await service.getForecast('Madrid', event);

    expect(result).toEqual({
      location: { city: 'Madrid', countryInitials: 'SP' },
      forecast: [
        {
          date: '2026-08-19',
          maxTempC: 30,
          minTempC: 18,
          conditionText: 'Sunny',
          conditionIcon: '//cdn/sunny.png',
        },
      ],
    });
    expect(event.upstreamResponse).toEqual(rawResponse);
  });

  it('throws NotFoundException when WeatherAPI reports no matching location, and records the error body on the event', async () => {
    const errorBody = {
      error: { code: 1006, message: 'No matching location found.' },
    };
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve(errorBody),
    } as Response);

    const event = createEvent();
    await expect(service.getForecast('Nowhereland', event)).rejects.toThrow(
      NotFoundException,
    );
    expect(event.upstreamResponse).toEqual(errorBody);
  });

  it('throws ServiceUnavailableException for other WeatherAPI errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          error: { code: 2006, message: 'API key is invalid.' },
        }),
    } as Response);

    await expect(service.getForecast('Madrid', createEvent())).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException when the error body cannot be parsed', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as Response);

    await expect(service.getForecast('Madrid', createEvent())).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException when the request itself fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.getForecast('Madrid', createEvent())).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
