import debounce from 'lodash.debounce';
import { DependencyList, useCallback, useEffect, useState } from 'react';

export function useDebouncedMemo<T>(factory: () => T, deps: DependencyList | undefined, debounceMs: number): T {
  const [state, setState] = useState(factory());

  const debouncedSetState = useCallback(debounce(setState, debounceMs), []);

  useEffect(() => {
    debouncedSetState(factory());
  }, [...(deps ? deps : []), factory, debouncedSetState]);

  return state;
}
