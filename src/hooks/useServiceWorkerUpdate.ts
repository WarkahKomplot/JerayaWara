import { useCallback, useEffect, useState } from 'react';

export const SW_UPDATE_EVENT = 'jerayawara:sw-update-ready';

/**
 * Listens for the event dispatched by main.tsx when a new service worker has
 * finished installing while an older one is still controlling the page.
 *
 * We deliberately do not auto-reload: reloading mid-navigation would drop the
 * active trip UI. The user chooses when to apply the update.
 */
export function useServiceWorkerUpdate() {
  const [isUpdateReady, setIsUpdateReady] = useState(false);

  useEffect(() => {
    const handleUpdateReady = () => setIsUpdateReady(true);
    window.addEventListener(SW_UPDATE_EVENT, handleUpdateReady);
    return () => window.removeEventListener(SW_UPDATE_EVENT, handleUpdateReady);
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  return { isUpdateReady, reload };
}
