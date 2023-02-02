import React from 'react';
import { EuiTabbedContent, EuiTabbedContentTab } from '@elastic/eui';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import GuildListing from './GuildListing';
import CityListing from './CityListing';

export const CoalitionListings: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const history = useHistory();

  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'guilds',
      name: 'Guilds',
      content: <GuildListing />,
    },
    {
      id: 'cities',
      name: 'Cities',
      content: <CityListing />,
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
    <FullWidthPage title="Coalitions">
      <EuiTabbedContent
        tabs={tabs}
        selectedTab={selectedTab}
        onTabClick={tab => tab.id !== type && history.push(`/coalitions/${tab.id}`)}
      />
    </FullWidthPage>
  );
};
