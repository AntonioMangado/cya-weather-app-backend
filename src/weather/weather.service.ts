import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class WeatherService {
  getForecast(city: string): unknown {
    throw new NotImplementedException(
      `Forecast lookup for "${city}" is not implemented yet`,
    );
  }
}
