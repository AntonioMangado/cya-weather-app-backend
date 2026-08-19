export interface WeatherApiForecastResponse {
  location: {
    name: string;
    country: string;
  };
  forecast: {
    forecastday: WeatherApiForecastDay[];
  };
}

export interface WeatherApiErrorResponse {
  error: {
    code: number;
    message: string;
  };
}

interface WeatherApiForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}
