import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ForecastDayDto } from './dto/forecast-day.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getForecast(@Query('city') city?: string): Promise<ForecastDayDto[]> {
    if (!city) {
      throw new BadRequestException('city query parameter is required');
    }
    return this.weatherService.getForecast(city);
  }
}
