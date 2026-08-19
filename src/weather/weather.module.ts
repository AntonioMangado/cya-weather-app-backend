import { Module } from '@nestjs/common';
import { ObservabilityModule } from '../observability/observability.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [ObservabilityModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
