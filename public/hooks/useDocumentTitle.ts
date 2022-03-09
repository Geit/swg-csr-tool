import { useEffect } from 'react';

import { useKibana } from './useKibana';

export const useDocumentTitle = (title: string) => {
  const coreServices = useKibana();

  useEffect(() => {
    coreServices?.chrome.docTitle.change(title);
  }, [coreServices, title]);
};
