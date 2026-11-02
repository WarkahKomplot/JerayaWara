import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoutePreviewSheet } from '../../src/components/navigation/RoutePreviewSheet';
import { RouteResult } from '../../src/services/routing/types';
import { TollBreakdown } from '../../src/services/toll/types';

const realRoute: RouteResult = {
  coordinates: [[101.7, 3.1], [101.72, 3.12]],
  distanceKm: 12.4,
  durationMinutes: 18,
  steps: [],
  tollPlazaKeys: ['MEX_SALAK_SELATAN'],
  profile: 'car',
  destinationName: 'KLCC',
  traffic: { level: 'moderate', label: 'Trafik Sederhana', labelEn: 'Moderate Traffic', delayMinutes: 6, totalMinutes: 24, delayFactor: 1.33, reason: 'Waktu Puncak', colorHex: '#f59e0b', corridorsDetected: [] }
};

const tolls: TollBreakdown = {
  totalCost: 2.00,
  currency: 'MYR',
  items: [{ id: 'MEX_SALAK_SELATAN', plazaName: 'Salak Selatan', expressway: 'MEX E20', cost: 2.00, paymentMethods: ['TnG'] }],
  vehicleClass: 'car'
};

describe('RoutePreviewSheet (pre-departure confirmation)', () => {
  it('renders calculating state while the route is being computed', () => {
    render(<RoutePreviewSheet route={null} tolls={null} isCalculating={true} onStart={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/Mengira laluan|Calculating route/)).toBeTruthy();
  });

  it('renders nothing when no route and not calculating', () => {
    const { container } = render(<RoutePreviewSheet route={null} tolls={null} isCalculating={false} onStart={vi.fn()} onCancel={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows distance, ETA with traffic delay, and toll total', () => {
    render(<RoutePreviewSheet route={realRoute} tolls={tolls} isCalculating={false} lang="en" onStart={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('12.4 km')).toBeTruthy();
    expect(screen.getByText(/18 min/)).toBeTruthy();
    expect(screen.getByText(/RM 2.00/)).toBeTruthy();
    expect(screen.getByText('KLCC')).toBeTruthy();
  });

  it('shows an honest no-connection error instead of a fabricated route', () => {
    render(
      <RoutePreviewSheet
        route={null}
        tolls={null}
        isCalculating={false}
        errorMessage="No internet connection. Navigation requires internet."
        lang="en"
        onStart={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/No internet connection/)).toBeTruthy();
    expect(screen.getByText(/no fabricated routes/i)).toBeTruthy();
  });

  it('renders nothing when no route and no error', () => {
    const { container } = render(<RoutePreviewSheet route={null} tolls={null} isCalculating={false} onStart={vi.fn()} onCancel={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('labels real road routes', () => {
    render(<RoutePreviewSheet route={realRoute} tolls={tolls} isCalculating={false} lang="en" onStart={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/Real road route/)).toBeTruthy();
  });

  it('starts navigation only when Start is tapped', () => {
    const onStart = vi.fn();
    const onCancel = vi.fn();
    render(<RoutePreviewSheet route={realRoute} tolls={tolls} isCalculating={false} lang="en" onStart={onStart} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Start Navigation'));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels via the X button without starting', () => {
    const onStart = vi.fn();
    const onCancel = vi.fn();
    render(<RoutePreviewSheet route={realRoute} tolls={tolls} isCalculating={false} lang="en" onStart={onStart} onCancel={onCancel} />);
    fireEvent.click(screen.getByLabelText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });
});
