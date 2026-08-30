import { useEffect } from 'react';

/**
 * Keeps a <select>'s default in step with a list that loads asynchronously.
 *
 * Data now arrives after first render, so a `useState(list[0]?.x || 'fallback')`
 * initializer runs while the list is still empty and then never re-runs — the
 * field keeps a stale value while the dropdown below it shows real options, and
 * that stale value is what gets submitted.
 *
 * This fills the field once, as soon as the list has something in it, and stops
 * interfering the moment the user picks anything.
 */
export function useListDefault<T>(
  current: string,
  setValue: (next: string) => void,
  list: readonly T[],
  pick: (item: T) => string | undefined
): void {
  useEffect(() => {
    if (current || !list.length) return;
    const next = pick(list[0]);
    if (next) setValue(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, list]);
}
