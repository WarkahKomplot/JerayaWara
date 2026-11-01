/**
 * High-precision astronomical solar calculation engine for Malaysia (NOAA Solar Algorithm).
 * Accurately determines sunrise, sunset, and daylight transitions based on date
 * and geographic coordinates across Peninsular & East Malaysia.
 */

export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  isDaytime: boolean;
  sunriseFormatted: string; // e.g. "07:12 AM"
  sunsetFormatted: string;  // e.g. "07:18 PM"
  locationDescription: string;
}

/**
 * Calculates solar sunrise and sunset times for a given date and coordinate.
 * Default coordinate: [101.693, 3.141] (Kuala Lumpur / Peninsular Malaysia).
 */
export function calculateMalaysiaSolarTimes(
  date: Date = new Date(),
  coord: [number, number] = [101.693, 3.141]
): SolarTimes {
  const [lng, lat] = coord;

  // Day of year (1-366)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (date.getHours() - 12) / 24);

  // Equation of time in minutes
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = (lat * Math.PI) / 180;
  // Standard solar zenith for sunrise/sunset (90.833° accounting for atmospheric refraction)
  const zenithRad = (90.833 * Math.PI) / 180;

  // Hour angle
  const cosH =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  // Clamp to valid range [-1, 1] for equatorial regions
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const haMinutes = (Math.acos(clampedCosH) * (180 / Math.PI) / 15) * 60;

  // Day starts at UTC midnight of the target date
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  // Solar noon in UTC
  const noonUtcMs = utcMidnight + (720 - (4 * lng) - eqtime) * 60 * 1000;

  const sunrise = new Date(noonUtcMs - haMinutes * 60 * 1000);
  const sunset = new Date(noonUtcMs + haMinutes * 60 * 1000);

  const isDaytime = date.getTime() >= sunrise.getTime() && date.getTime() < sunset.getTime();

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isEastMalaysia = lng > 109.0;
  const locationDescription = isEastMalaysia ? 'Sabah / Sarawak (East MY)' : 'Peninsular Malaysia';

  return {
    sunrise,
    sunset,
    isDaytime,
    sunriseFormatted: formatTime(sunrise),
    sunsetFormatted: formatTime(sunset),
    locationDescription
  };
}

