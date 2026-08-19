import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getForecast(@Query('city') city?: string) {
    if (!city) {
      throw new BadRequestException('city query parameter is required');
    }
    return this.weatherService.getForecast(city);
  }
}
