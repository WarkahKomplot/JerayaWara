import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PwaInstallBanner } from '../../src/components/common/PwaInstallBanner';

describe('PwaInstallBanner Component', () => {
  it('does not render if already installed or dismissed', () => {
    const { container: installedContainer } = render(
      <PwaInstallBanner
        isInstallable={true}
        isInstalled={true}
        isIOS={false}
        isDismissed={false}
        onInstall={vi.fn().mockResolvedValue(true)}
        onDismiss={vi.fn()}
      />
    );
    expect(installedContainer.firstChild).toBeNull();

    const { container: dismissedContainer } = render(
      <PwaInstallBanner
        isInstallable={true}
        isInstalled={false}
        isIOS={false}
        isDismissed={true}
        onInstall={vi.fn().mockResolvedValue(true)}
        onDismiss={vi.fn()}
      />
    );
    expect(dismissedContainer.firstChild).toBeNull();
  });

  it('renders install prompt on installable browsers and triggers onInstall', () => {
    const handleInstall = vi.fn().mockResolvedValue(true);
    const handleDismiss = vi.fn();

    render(
      <PwaInstallBanner
        isInstallable={true}
        isInstalled={false}
        isIOS={false}
        isDismissed={false}
        onInstall={handleInstall}
        onDismiss={handleDismiss}
        lang="ms"
      />
    );

    expect(screen.getByText('Pasang Aplikasi JerayaWara')).toBeDefined();
    const installBtn = screen.getByRole('button', { name: /Pasang ke Skrin Utama/i });
    fireEvent.click(installBtn);
    expect(handleInstall).toHaveBeenCalledTimes(1);

    const dismissBtn = screen.getByRole('button', { name: /Nanti/i });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders iOS instructions when isIOS is true', () => {
    render(
      <PwaInstallBanner
        isInstallable={false}
        isInstalled={false}
        isIOS={true}
        isDismissed={false}
        onInstall={vi.fn().mockResolvedValue(true)}
        onDismiss={vi.fn()}
        lang="en"
      />
    );

    const iosBtn = screen.getByRole('button', { name: /Install on iPhone\/iPad/i });
    fireEvent.click(iosBtn);

    expect(screen.getByText(/Tap the Share button in Safari/i)).toBeDefined();
    expect(screen.getByText(/Select "Add to Home Screen"/i)).toBeDefined();
  });
});

