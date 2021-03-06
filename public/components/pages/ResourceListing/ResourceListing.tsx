import React from 'react';
import { EuiPage, EuiPageBody, EuiPageContent, EuiSpacer, EuiPageHeaderSection, EuiTitle } from '@elastic/eui';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import AppSidebar from '../../AppSidebar';

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
    <EuiPage paddingSize="l">
      <AppSidebar />
      <EuiPageBody panelled restrictWidth>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Resources</h1>
          </EuiTitle>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <ResourceListingTable />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
