export interface City {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export type Unit = "celsius" | "fahrenheit";

export interface Config {
  defaultCity: string | null;
  cities: City[];
  unit: Unit;
}

export interface GeoResult {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

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