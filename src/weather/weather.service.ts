import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ForecastDayDto } from './dto/forecast-day.dto';
import { WeatherApiForecastResponse } from './weather-api-response.interface';
import { FORECAST_DAYS, WEATHER_API_URL } from './weather.constants';

@Injectable()
export class WeatherService {
  constructor(private readonly configService: ConfigService) {}

  async getForecast(city: string): Promise<ForecastDayDto[]> {
    const url = new URL(WEATHER_API_URL);
    url.searchParams.set(
      'key',
      this.configService.get<string>('WEATHER_API_KEY')!,
    );
    url.searchParams.set('q', city);
    url.searchParams.set('days', String(FORECAST_DAYS));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `WeatherAPI request failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as WeatherApiForecastResponse;

    return data.forecast.forecastday.map((forecastDay) => ({
      date: forecastDay.date,
      maxTempC: forecastDay.day.maxtemp_c,
      minTempC: forecastDay.day.mintemp_c,
      conditionText: forecastDay.day.condition.text,
      conditionIcon: forecastDay.day.condition.icon,
    }));
  }
}
