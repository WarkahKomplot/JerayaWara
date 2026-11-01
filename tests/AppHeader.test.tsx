import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../src/App';

vi.mock('../src/components/map/MapContainer', () => ({
  MapContainer: () => <div data-testid="mock-map">Map</div>
}));

beforeAll(() => {
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
});

describe('App Header and Language Toggle Integration', () => {
  it('renders language option beside JerayaWara MY badge and toggles between BM and EN', async () => {
    render(<App />);

    // Check JerayaWara MY branding exists
    expect(screen.getByText('JerayaWara')).toBeDefined();
    expect(screen.getByText('MY')).toBeDefined();

    // Check language toggle button is present
    const langToggle = screen.getByTestId('header-language-toggle');
    expect(langToggle).toBeDefined();
    expect(langToggle.textContent).toContain('BM');

    // Click toggle to switch to English
    fireEvent.click(langToggle);

    await waitFor(() => {
      expect(langToggle.textContent).toContain('EN');
    });

    // Click toggle to switch back to Bahasa Melayu
    fireEvent.click(langToggle);

    await waitFor(() => {
      expect(langToggle.textContent).toContain('BM');
    });
  });

  it('renders FavoritesQuickChips and allows resetting a saved favorite via App handler', async () => {
    const mockFavs = [
      {
        id: 'fav-home',
        category: 'home' as const,
        title: 'Rumah',
        subtitle: '3.1390°N, 101.6869°E',
        coordinates: [101.6869, 3.1390] as [number, number],
        createdAt: 1000
      }
    ];

    vi.spyOn(await import('../src/services/favorites/favoritesStore'), 'getFavorites').mockResolvedValue(mockFavs);
    const deleteSpy = vi.spyOn(await import('../src/services/favorites/favoritesStore'), 'deleteFavorite').mockResolvedValue(undefined);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Rumah')).toBeDefined();
    });

    const removeBtn = screen.getByTestId('remove-fav-home');
    expect(removeBtn).toBeDefined();

    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('fav-home');
    });
  });
});
