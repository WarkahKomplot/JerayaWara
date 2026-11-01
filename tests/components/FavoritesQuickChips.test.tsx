import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoritesQuickChips } from '../../src/components/favorites/FavoritesQuickChips';
import * as favoritesStore from '../../src/services/favorites/favoritesStore';

describe('FavoritesQuickChips Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders unconfigured slots with + Rumah, + Kerja, + Balik Kampung', async () => {
    vi.spyOn(favoritesStore, 'getFavorites').mockResolvedValue([]);

    render(
      <FavoritesQuickChips
        onSelectFavorite={vi.fn()}
        onAddFavorite={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('+ Rumah')).toBeDefined();
      expect(screen.getByText('+ Kerja')).toBeDefined();
      expect(screen.getByText('+ Balik Kampung')).toBeDefined();
    });
  });

  it('renders saved favorite with label and remove/reset button, and fires onRemoveFavorite', async () => {
    const mockFavs: favoritesStore.FavoriteDestination[] = [
      {
        id: 'fav-home',
        category: 'home',
        title: 'Rumah',
        subtitle: '3.1390°N, 101.6869°E',
        coordinates: [101.6869, 3.1390],
        createdAt: 1000
      }
    ];

    vi.spyOn(favoritesStore, 'getFavorites').mockResolvedValue(mockFavs);
    const mockDelete = vi.spyOn(favoritesStore, 'deleteFavorite').mockResolvedValue(undefined);
    const handleSelect = vi.fn();
    const handleRemove = vi.fn();

    render(
      <FavoritesQuickChips
        onSelectFavorite={handleSelect}
        onRemoveFavorite={handleRemove}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Rumah')).toBeDefined();
    });

    // Check for remove/reset button
    const removeBtn = screen.getByTestId('remove-fav-home');
    expect(removeBtn).toBeDefined();

    // Click remove button
    fireEvent.click(removeBtn);

    // Verify handleRemove called and select not called
    await waitFor(() => {
      expect(handleRemove).toHaveBeenCalledWith('fav-home', 'home');
    });
    expect(handleSelect).not.toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith('fav-home');

    // Verify it reverts to empty state
    await waitFor(() => {
      expect(screen.getByText('+ Rumah')).toBeDefined();
    });
  });
});
