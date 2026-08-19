import { envValidationSchema } from './env.validation';

interface ValidatedEnv {
  PORT: number;
  WEATHER_API_KEY: string;
}

describe('envValidationSchema', () => {
  it('rejects an env missing WEATHER_API_KEY', () => {
    const { error } = envValidationSchema.validate({});
    expect(error).toBeDefined();
    expect(error?.message).toContain('WEATHER_API_KEY');
  });

  it('accepts an env with WEATHER_API_KEY and defaults PORT', () => {
    const { error, value } = envValidationSchema.validate({
      WEATHER_API_KEY: 'test-key',
    }) as { error?: Error; value: ValidatedEnv };
    expect(error).toBeUndefined();
    expect(value.PORT).toBe(3000);
  });

  it('accepts an explicit PORT override', () => {
    const { error, value } = envValidationSchema.validate({
      WEATHER_API_KEY: 'test-key',
      PORT: '4000',
    }) as { error?: Error; value: ValidatedEnv };
    expect(error).toBeUndefined();
    expect(value.PORT).toBe(4000);
  });
});
