export interface ForecastResponse {
  current: {
    time: string;
    temperature_2m: number;
  };
}

export interface DailyForecast {
  time: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

export interface DailyForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}