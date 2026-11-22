import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppErrorBoundary } from '../../src/components/common/AppErrorBoundary';

function Thrower(): JSX.Element {
  throw new Error('boom');
}

describe('AppErrorBoundary', () => {
  it('shows a reloadable fallback instead of a blank screen', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeTruthy();
    expect(screen.getByText(/Reload/)).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
