export interface WeatherInfo {
  tempC: number;
  condition: string;
  conditionBm: string;
  icon: 'sunny' | 'cloudy' | 'rain' | 'thunderstorm';
  isRaining: boolean;
  fetchedAt: number;
}

interface CacheEntry {
  coordKey: string;
  data: WeatherInfo;
}

let weatherCache: CacheEntry | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Maps WMO weather code to conditions and icons
 */
export function mapWmoWeatherCode(code: number, isDay: number = 1): Omit<WeatherInfo, 'tempC' | 'fetchedAt'> {
  // Rain / Showers
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      condition: 'Rain',
      conditionBm: 'Hujan',
      icon: 'rain',
      isRaining: true
    };
  }

  // Thunderstorms (common in tropical Malaysia)
  if (code >= 95 && code <= 99) {
    return {
      condition: 'Thunderstorm',
      conditionBm: 'Ribut Petir',
      icon: 'thunderstorm',
      isRaining: true
    };
  }

  // Foggy
  if (code === 45 || code === 48) {
    return {
      condition: 'Foggy',
      conditionBm: 'Berkabus',
      icon: 'cloudy',
      isRaining: false
    };
  }

  // Partly Cloudy / Overcast
  if (code === 2 || code === 3) {
    return {
      condition: 'Partly Cloudy',
      conditionBm: 'Mendung',
      icon: 'cloudy',
      isRaining: false
    };
  }

  // Clear / Sunny
  return {
    condition: isDay ? 'Sunny' : 'Clear Night',
    conditionBm: isDay ? 'Cerah' : 'Malam Cerah',
    icon: 'sunny',
    isRaining: false
  };
}

/**
 * Fallback weather estimation for offline use based on Malaysian tropical climate
 */
export function getOfflineEstimatedWeather(): WeatherInfo {
  const hour = new Date().getHours();
  const isDay = hour >= 7 && hour <= 19;
  const tempC = isDay ? 31 : 26;

  return {
    tempC,
    condition: isDay ? 'Sunny' : 'Clear Night',
    conditionBm: isDay ? 'Cerah' : 'Malam Cerah',
    icon: 'sunny',
    isRaining: false,
    fetchedAt: Date.now()
  };
}

/**
 * Fetches real-time weather using Open-Meteo free API (Zero API Keys needed)
 * Falls back to local estimation if offline or network fails.
 */
export async function fetchLiveWeather(coords: [number, number]): Promise<WeatherInfo> {
  const [lng, lat] = coords;
  const coordKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;

  // Return cached result if fresh (< 10 minutes)
  if (weatherCache && weatherCache.coordKey === coordKey && Date.now() - weatherCache.data.fetchedAt < CACHE_TTL_MS) {
    return weatherCache.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,weather_code,is_day`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data.current;
      const mapped = mapWmoWeatherCode(current?.weather_code ?? 0, current?.is_day ?? 1);

      const result: WeatherInfo = {
        tempC: Math.round(current?.temperature_2m ?? 30),
        ...mapped,
        fetchedAt: Date.now()
      };

      weatherCache = { coordKey, data: result };
      return result;
    }
  } catch {
    // Fallback on timeout or network offline
  }

  const fallback = getOfflineEstimatedWeather();
  weatherCache = { coordKey, data: fallback };
  return fallback;
}

