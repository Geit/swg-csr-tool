import React from 'react';
import { EuiTabbedContent, EuiTabbedContentTab } from '@elastic/eui';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import ActiveSessionListing from './ActiveSessionListing';

export const SessionListings: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const history = useHistory();

  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'active',
      name: 'Active Sessions',
      content: <ActiveSessionListing />,
    },
  ];

  const selectedTab = tabs.find(tab => tab.id === type);
  const selectedTabName = selectedTab?.name;

  const title = `${selectedTabName} Listing`;

  useDocumentTitle(title);
  useBreadcrumbs([
    {
      text: title,
    },
  ]);

  return (
    <FullWidthPage title="Sessions">
      <EuiTabbedContent
        tabs={tabs}
        selectedTab={selectedTab}
        onTabClick={tab => tab.id !== type && history.push(`/sessions/${tab.id}`)}
      />
    </FullWidthPage>
  );
};
