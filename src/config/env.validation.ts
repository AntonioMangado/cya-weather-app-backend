import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  WEATHER_API_KEY: Joi.string().required(),
});
