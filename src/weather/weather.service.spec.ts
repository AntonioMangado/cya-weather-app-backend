import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WeatherService } from './weather.service';
import { WEATHER_API_URL } from './weather.constants';

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
      json: () => Promise.resolve({ forecast: { forecastday: [] } }),
    } as Response);

    await service.getForecast('Madrid');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0] as URL;
    expect(calledUrl.origin + calledUrl.pathname).toBe(WEATHER_API_URL);
    expect(calledUrl.searchParams.get('key')).toBe('test-api-key');
    expect(calledUrl.searchParams.get('q')).toBe('Madrid');
    expect(calledUrl.searchParams.get('days')).toBe('4');
  });

  it('maps the WeatherAPI response to ForecastDayDto[], dropping unlisted fields', async () => {
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
        }),
    } as Response);

    const result = await service.getForecast('Madrid');

    expect(result).toEqual([
      {
        date: '2026-08-19',
        maxTempC: 30,
        minTempC: 18,
        conditionText: 'Sunny',
        conditionIcon: '//cdn/sunny.png',
      },
    ]);
  });

  it('throws when the WeatherAPI response is not ok', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 } as Response);

    await expect(service.getForecast('Nowhereland')).rejects.toThrow();
  });
});
