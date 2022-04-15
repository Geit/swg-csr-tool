import { useEffect, MouseEvent } from 'react';
import type { EuiBreadcrumb } from '@elastic/eui';

import { useKibana } from './useKibana';

export const useBreadcrumbs = (breadcrumbs: EuiBreadcrumb[] = []) => {
  const coreServices = useKibana();

  useEffect(() => {
    if (!coreServices) return;

    const breadcrumbsToSet: EuiBreadcrumb[] = [
      {
        text: 'SWG CSR Tool',
        href: `/search`,
      },
      ...breadcrumbs,
    ].map(b => {
      if (!b.href) return b;

      const href = `${coreServices.application.getUrlForApp('swgCsrTool')}${b.href}`;

      return {
        ...b,
        href,
        onClick: (event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          coreServices.application.navigateToUrl(href);
        },
      };
    });

    coreServices.chrome.setBreadcrumbs(breadcrumbsToSet);
  }, [coreServices, breadcrumbs]);
};
