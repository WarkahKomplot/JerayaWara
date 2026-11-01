import { describe, it, expect } from 'vitest';
import {
  mapWmoWeatherCode,
  getOfflineEstimatedWeather,
  fetchLiveWeather
} from '../../src/services/weather/weatherService';

describe('Weather Service for Malaysia', () => {
  it('correctly maps WMO rain codes to Hujan and isRaining true', () => {
    const rain = mapWmoWeatherCode(61, 1);
    expect(rain.isRaining).toBe(true);
    expect(rain.conditionBm).toBe('Hujan');
    expect(rain.icon).toBe('rain');

    const thunder = mapWmoWeatherCode(95, 1);
    expect(thunder.isRaining).toBe(true);
    expect(thunder.conditionBm).toBe('Ribut Petir');
    expect(thunder.icon).toBe('thunderstorm');
  });

  it('correctly maps sunny and cloudy conditions', () => {
    const sunny = mapWmoWeatherCode(0, 1);
    expect(sunny.isRaining).toBe(false);
    expect(sunny.conditionBm).toBe('Cerah');
    expect(sunny.icon).toBe('sunny');

    const cloudy = mapWmoWeatherCode(3, 1);
    expect(cloudy.conditionBm).toBe('Mendung');
    expect(cloudy.icon).toBe('cloudy');
  });

  it('provides sensible offline estimated tropical weather', () => {
    const weather = getOfflineEstimatedWeather();
    expect(weather.tempC).toBeGreaterThanOrEqual(24);
    expect(weather.tempC).toBeLessThanOrEqual(35);
    expect(weather.conditionBm).toBeDefined();
  });

  it('fetches or returns fallback weather without crashing', async () => {
    // KL coordinates
    const weather = await fetchLiveWeather([101.693, 3.141]);
    expect(weather).toBeDefined();
    expect(weather.tempC).toBeGreaterThan(0);
    expect(weather.condition).toBeDefined();
  });
});

