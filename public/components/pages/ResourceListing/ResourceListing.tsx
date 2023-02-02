import React from 'react';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import ResourceListingTable from './ResourceListingTable';

export const ResourceListing: React.FC = () => {
  const title = `Resource Listing`;

  useDocumentTitle(title);
  useBreadcrumbs([
    {
      text: title,
    },
  ]);

  return (
    <FullWidthPage title="Resources">
      <ResourceListingTable />
    </FullWidthPage>
  );
};
