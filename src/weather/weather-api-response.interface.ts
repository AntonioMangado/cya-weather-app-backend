export interface WeatherApiForecastResponse {
  forecast: {
    forecastday: WeatherApiForecastDay[];
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
