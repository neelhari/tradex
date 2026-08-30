import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceKey, SCREEN_RESOURCES, ScreenName } from '../data/resources';

interface ScreenDataState {
  /** True while any resource this screen needs is still being fetched. */
  isLoading: boolean;
  /** True if a resource this screen needs failed to load. */
  hasError: boolean;
  /** Re-fetch this screen's resources, bypassing the cache. */
  reload: () => Promise<void>;
}

/**
 * Declares the data a screen needs and fetches it when the screen mounts.
 *
 * Resources are cached across the session, so navigating back to a screen does
 * not re-request anything, and two screens sharing a resource only fetch it once.
 *
 *   const { isLoading } = useScreenData('clientsPipeline');
 */
export function useScreenData(screen: ScreenName): ScreenDataState {
  const { loadResources, refreshResources, resourceStatus } = useApp();
  const keys = SCREEN_RESOURCES[screen] as readonly ResourceKey[];

  // Screen names are static, so this key is stable across renders.
  const dependency = keys.join(',');

  useEffect(() => {
    if (keys.length) void loadResources(keys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, loadResources]);

  return {
    isLoading: keys.some((key) => resourceStatus[key] === 'idle' || resourceStatus[key] === 'loading'),
    hasError: keys.some((key) => resourceStatus[key] === 'error'),
    reload: () => refreshResources(keys),
  };
}
