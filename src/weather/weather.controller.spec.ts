import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: { getForecast: jest.Mock };

  beforeEach(async () => {
    weatherService = { getForecast: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: weatherService }],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  it('throws BadRequestException when city is missing', () => {
    expect(() => controller.getForecast()).toThrow(BadRequestException);
    expect(weatherService.getForecast).not.toHaveBeenCalled();
  });

  it('delegates to WeatherService.getForecast with the given city', () => {
    weatherService.getForecast.mockReturnValue({ forecast: [] });

    const result = controller.getForecast('Madrid');

    expect(weatherService.getForecast).toHaveBeenCalledWith('Madrid');
    expect(result).toEqual({ forecast: [] });
  });
});
