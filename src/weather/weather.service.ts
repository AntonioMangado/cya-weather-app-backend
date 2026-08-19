import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WideEvent } from '../observability/wide-event.interface';
import { ForecastDayDto } from './dto/forecast-day.dto';
import {
  WeatherApiErrorResponse,
  WeatherApiForecastResponse,
} from './weather-api-response.interface';
import {
  FORECAST_DAYS,
  WEATHER_API_ERROR_CODE_LOCATION_NOT_FOUND,
  WEATHER_API_URL,
} from './weather.constants';

const UPSTREAM_ERROR_MESSAGE =
  "Couldn't process the weather request, try again later";

@Injectable()
export class WeatherService {
  constructor(private readonly configService: ConfigService) {}

  async getForecast(city: string, event: WideEvent): Promise<ForecastDayDto[]> {
    const url = new URL(WEATHER_API_URL);
    url.searchParams.set(
      'key',
      this.configService.get<string>('WEATHER_API_KEY')!,
    );
    url.searchParams.set('q', city);
    url.searchParams.set('days', String(FORECAST_DAYS));

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new ServiceUnavailableException(UPSTREAM_ERROR_MESSAGE);
    }

    if (!response.ok) {
      const errorBody = (await response
        .json()
        .catch(() => null)) as WeatherApiErrorResponse | null;
      event.upstreamResponse = errorBody;

      if (errorBody?.error.code === WEATHER_API_ERROR_CODE_LOCATION_NOT_FOUND) {
        throw new NotFoundException(`No weather data found for "${city}"`);
      }

      throw new ServiceUnavailableException(UPSTREAM_ERROR_MESSAGE);
    }

    const data = (await response.json()) as WeatherApiForecastResponse;
    event.upstreamResponse = data;

    return data.forecast.forecastday.map((forecastDay) => ({
      date: forecastDay.date,
      maxTempC: forecastDay.day.maxtemp_c,
      minTempC: forecastDay.day.mintemp_c,
      conditionText: forecastDay.day.condition.text,
      conditionIcon: forecastDay.day.condition.icon,
    }));
  }
}
