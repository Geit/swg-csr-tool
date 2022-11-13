import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageSection,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiTabbedContent,
  EuiTabbedContentTab,
} from '@elastic/eui';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import AppSidebar from '../../AppSidebar';

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
    <EuiPage paddingSize="l">
      <AppSidebar />
      <EuiPageBody panelled paddingSize="l">
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Coalitions</h1>
          </EuiTitle>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageSection paddingSize="none" color="transparent">
          <EuiTabbedContent
            tabs={tabs}
            selectedTab={selectedTab}
            onTabClick={tab => tab.id !== type && history.push(`/coalitions/${tab.id}`)}
          />
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};
