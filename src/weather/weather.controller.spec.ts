import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WideEventService } from '../observability/wide-event.service';
import { WideEvent } from '../observability/wide-event.interface';

function createRequest(): Request {
  return {
    method: 'GET',
    originalUrl: '/weather?city=Madrid',
  } as Request;
}

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: { getForecast: jest.Mock };
  let wideEventService: { record: jest.Mock<Promise<void>, [WideEvent]> };

  beforeEach(async () => {
    weatherService = { getForecast: jest.fn() };
    wideEventService = {
      record: jest.fn<Promise<void>, [WideEvent]>().mockResolvedValue(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        { provide: WeatherService, useValue: weatherService },
        { provide: WideEventService, useValue: wideEventService },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  it('throws BadRequestException when city is missing, and still records a wide event', async () => {
    await expect(
      controller.getForecast(undefined, createRequest()),
    ).rejects.toThrow(BadRequestException);

    expect(weatherService.getForecast).not.toHaveBeenCalled();
    expect(wideEventService.record).toHaveBeenCalledTimes(1);
    expect(wideEventService.record.mock.calls[0][0]).toMatchObject({
      statusCode: 400,
      errorMessage: 'city query parameter is required',
    });
  });

  it('delegates to WeatherService.getForecast and records a wide event on success', async () => {
    const forecast = [{ date: '2026-08-19' }];
    weatherService.getForecast.mockResolvedValue(forecast);

    const result = await controller.getForecast('Madrid', createRequest());

    expect(weatherService.getForecast).toHaveBeenCalledWith(
      'Madrid',
      expect.objectContaining({ userType: 'guest', method: 'GET' }),
    );
    expect(result).toEqual(forecast);
    expect(wideEventService.record).toHaveBeenCalledTimes(1);
    expect(wideEventService.record.mock.calls[0][0]).toMatchObject({
      statusCode: 200,
      responseToClient: forecast,
    });
  });

  it('records the upstream error status when the service throws', async () => {
    weatherService.getForecast.mockRejectedValue(
      new NotFoundException('No weather data found for "Nowhereland"'),
    );

    await expect(
      controller.getForecast('Nowhereland', createRequest()),
    ).rejects.toThrow(NotFoundException);

    expect(wideEventService.record.mock.calls[0][0]).toMatchObject({
      statusCode: 404,
      errorMessage: 'No weather data found for "Nowhereland"',
    });
  });
});
