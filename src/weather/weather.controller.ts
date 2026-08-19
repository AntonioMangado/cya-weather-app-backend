import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { WideEventService } from '../observability/wide-event.service';
import { WideEvent } from '../observability/wide-event.interface';
import { ForecastDayDto } from './dto/forecast-day.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly wideEventService: WideEventService,
  ) {}

  @Get()
  async getForecast(
    @Query('city') city: string | undefined,
    @Req() request: Request,
  ): Promise<ForecastDayDto[]> {
    const event: WideEvent = {
      timestamp: new Date().toISOString(),
      userType: 'guest',
      method: request.method,
      endpoint: request.originalUrl,
      statusCode: 200,
    };

    try {
      if (!city) {
        throw new BadRequestException('city query parameter is required');
      }

      const forecast = await this.weatherService.getForecast(city, event);
      event.responseToClient = forecast;

      return forecast;
    } catch (error) {
      event.statusCode =
        error instanceof HttpException ? error.getStatus() : 500;
      event.errorMessage =
        error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      void this.wideEventService.record(event);
    }
  }
}
