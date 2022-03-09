import { useEffect } from 'react';

import { useKibana } from './useKibana';

export const useRecentlyAccessed = (url: string, title: string, id: string, valid: boolean) => {
  const coreServices = useKibana();

  useEffect(() => {
    if (!valid) return;

    coreServices?.chrome.recentlyAccessed.add(url, title, id);
  }, [coreServices, title, url, id, valid]);
};
