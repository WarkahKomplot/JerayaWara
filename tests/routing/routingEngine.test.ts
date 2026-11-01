import { describe, it, expect } from 'vitest';
import { calculateRoute, calculateOfflineRoute } from '../../src/services/routing/routingEngine';
import { calculateRouteTolls } from '../../src/services/toll/tollCalculator';

describe('Routing Engine', () => {
  const klCoords: [number, number] = [101.693, 3.141];
  const serembanCoords: [number, number] = [101.938, 2.725];
  const melakaCoords: [number, number] = [102.280, 2.280];
  const tapahCoords: [number, number] = [101.305, 4.192];
  const pjCoords: [number, number] = [101.645, 3.107];

  it('generates real road route with rich coordinates and expressway toll plazas', async () => {
    const route = await calculateRoute(klCoords, serembanCoords, 'car', 'Seremban');
    expect(route.distanceKm).toBeGreaterThan(40);
    expect(route.coordinates.length).toBeGreaterThanOrEqual(6);
    expect(route.steps.length).toBeGreaterThan(1);
    expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
    expect(route.destinationName).toBe('Seremban');
  });

  it('calculates unique and distinct toll fares for different search destinations', () => {
    // 1. Seremban: ~RM 4.10
    const routeSeremban = calculateOfflineRoute(klCoords, serembanCoords, 'car', 'Seremban City Centre');
    const tollSeremban = calculateRouteTolls(routeSeremban.tollPlazaKeys, 'car');
    expect(tollSeremban.totalCost).toBe(4.10);

    // 2. Melaka: ~RM 15.60
    const routeMelaka = calculateOfflineRoute(klCoords, melakaCoords, 'car', 'Ayer Keroh Melaka');
    const tollMelaka = calculateRouteTolls(routeMelaka.tollPlazaKeys, 'car');
    expect(tollMelaka.totalCost).toBe(15.60);

    // 3. Tapah: ~RM 20.80
    const routeTapah = calculateOfflineRoute(klCoords, tapahCoords, 'car', 'Tapah R&R');
    const tollTapah = calculateRouteTolls(routeTapah.tollPlazaKeys, 'car');
    expect(tollTapah.totalCost).toBe(20.80);

    // 4. Petaling Jaya (Federal Highway): RM 0.00 (Toll Free)
    const routePJ = calculateOfflineRoute(klCoords, pjCoords, 'car', 'Petaling Jaya');
    const tollPJ = calculateRouteTolls(routePJ.tollPlazaKeys, 'car');
    expect(tollPJ.totalCost).toBe(0.00);

    // Guarantees all 4 destinations have distinct toll estimates and never duplicate
    expect(tollSeremban.totalCost).not.toBe(tollMelaka.totalCost);
    expect(tollMelaka.totalCost).not.toBe(tollTapah.totalCost);
  });

  it('motorcycle route flags dedicated motorcycle lanes and exemptions', async () => {
    const route = await calculateRoute(klCoords, serembanCoords, 'motorcycle');
    expect(route.profile).toBe('motorcycle');
    expect(route.steps.some(s => s.instruction.toLowerCase().includes('motosikal') || s.isMotorcycleLane)).toBe(true);
  });

  it('walker route avoids expressways and generates pedestrian instructions', async () => {
    const route = await calculateRoute([101.693, 3.141], [101.710, 3.150], 'walker');
    expect(route.profile).toBe('walker');
    expect(route.tollPlazaKeys.length).toBe(0);
  });

  it('offline highway snapper traces along real PLUS E1 curves instead of straight line to Tapah', () => {
    const offlineRoute = calculateOfflineRoute(klCoords, tapahCoords, 'car', 'Tapah R&R');
    expect(offlineRoute.distanceKm).toBeGreaterThan(100);
    expect(offlineRoute.coordinates.length).toBeGreaterThanOrEqual(10);
    expect(offlineRoute.steps.some(s => s.instruction.includes('E1') || s.instruction.includes('PLUS'))).toBe(true);
    expect(offlineRoute.tollPlazaKeys).toContain('PLUS_E1_JALAN_DUTA_TAPAH');
  });

  describe('Pagoh / Paya Redan Closed-System PLUS Toll Calculation', () => {
    const payaRedanCoords: [number, number] = [102.7836, 2.1616]; // Paya Redan, Pagoh, Muar, Johor
    const jbCoords: [number, number] = [103.757, 1.465]; // Johor Bahru / Skudai
    const yongPengCoords: [number, number] = [103.060, 2.010]; // Yong Peng
    const ayerKerohCoords: [number, number] = [102.280, 2.280]; // Ayer Keroh Melaka

    it('calculates exact Northbound PLUS toll from Johor Bahru/Skudai to Paya Redan, Pagoh (RM 18.50)', () => {
      const route = calculateOfflineRoute(jbCoords, payaRedanCoords, 'car', 'Paya Redan, Pagoh');
      expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
      expect(route.tollPlazaKeys).toContain('PLUS_E2_SKUDAI_PAGOH');

      const toll = calculateRouteTolls(route.tollPlazaKeys, 'car');
      expect(toll.totalCost).toBe(18.50);
      expect(toll.items[0].plazaName).toContain('Skudai');
      expect(toll.items[0].plazaName).toContain('Pagoh');
    });

    it('calculates exact Southbound PLUS toll from KL to Paya Redan, Pagoh (RM 24.60)', () => {
      const route = calculateOfflineRoute(klCoords, payaRedanCoords, 'car', 'Paya Redan, Pagoh');
      expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
      expect(route.tollPlazaKeys).toContain('PLUS_E2_SG_BESI_PAGOH');

      const toll = calculateRouteTolls(route.tollPlazaKeys, 'car');
      expect(toll.totalCost).toBe(24.60);
      expect(toll.items[0].plazaName).toContain('Sungai Besi');
      expect(toll.items[0].plazaName).toContain('Pagoh');
    });

    it('calculates intermediate PLUS toll from Melaka to Paya Redan, Pagoh (RM 9.00)', () => {
      const route = calculateOfflineRoute(ayerKerohCoords, payaRedanCoords, 'car', 'Paya Redan, Pagoh');
      expect(route.tollPlazaKeys).toContain('PLUS_E2_AYER_KEROH_PAGOH');

      const toll = calculateRouteTolls(route.tollPlazaKeys, 'car');
      expect(toll.totalCost).toBe(9.00);
    });

    it('calculates short-distance PLUS toll from Yong Peng to Paya Redan, Pagoh (RM 3.90)', () => {
      const route = calculateOfflineRoute(yongPengCoords, payaRedanCoords, 'car', 'Paya Redan, Pagoh');
      expect(route.tollPlazaKeys).toContain('PLUS_E2_YONG_PENG_PAGOH');

      const toll = calculateRouteTolls(route.tollPlazaKeys, 'car');
      expect(toll.totalCost).toBe(3.90);
    });

    it('exempts motorcycles from toll to Paya Redan, Pagoh (RM 0.00)', () => {
      const route = calculateOfflineRoute(jbCoords, payaRedanCoords, 'motorcycle', 'Paya Redan, Pagoh');
      const toll = calculateRouteTolls(route.tollPlazaKeys, 'motorcycle');
      expect(toll.totalCost).toBe(0.00);
      expect(toll.note).toContain('exempt');
    });
  });
});
