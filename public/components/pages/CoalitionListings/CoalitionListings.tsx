import React, { useContext, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiTabbedContent,
  EuiTabbedContentTab,
} from '@elastic/eui';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';

import { KibanaCoreServicesContext } from '../../KibanaCoreServicesContext';

import GuildListing from './GuildListing';
import CityListing from './CityListing';

export const CoalitionListings: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { coreServices } = useContext(KibanaCoreServicesContext);
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

  useEffect(() => {
    coreServices?.chrome.docTitle.change(`${selectedTabName} Listing`);
  }, [selectedTabName]);

  return (
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Coalitions</h1>
          </EuiTitle>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <EuiTabbedContent
            tabs={tabs}
            selectedTab={selectedTab}
            onTabClick={tab => tab.id !== type && history.push(`/coalitions/${tab.id}`)}
          />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
