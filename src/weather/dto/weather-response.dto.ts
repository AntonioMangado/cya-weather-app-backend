import { ForecastDayDto } from './forecast-day.dto';
import { LocationDto } from './location.dto';

export class WeatherResponseDto {
  location: LocationDto;
  forecast: ForecastDayDto[];
}
