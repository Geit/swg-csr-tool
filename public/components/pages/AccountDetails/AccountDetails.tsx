import React from 'react';
import { EuiCallOut, EuiTabbedContentTab, EuiTabbedContent } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useGetAccountNameQuery } from './AccountDetails.queries';
import { AccountOverviewTab } from './AccountOverviewTab';
import { AccountVeteranRewardTab } from './AccountVeteranRewardTab';
import { AccountLoginsTab } from './AccountLoginsTab';

export const GET_ACCOUNT_NAME = gql`
  query getAccountName($id: String!) {
    account(stationId: $id) {
      id
      accountName
    }
  }
`;

export interface AccountDetailsRouteParams {
  id: string;
  tab?: string;
}

const tabs: EuiTabbedContentTab[] = [
  {
    id: 'overview',
    name: 'Overview',
    content: <AccountOverviewTab />,
  },
  {
    id: 'logins',
    name: 'Logins',
    content: <AccountLoginsTab />,
  },
  // {
  //   id: 'logs',
  //   name: 'Logs',
  //   content: <div>Hello world 3</div>,
  // },
  {
    id: 'veteran-rewards',
    name: 'Veteran Rewards',
    content: <AccountVeteranRewardTab />,
  },
];

export const AccountDetails: React.FC = () => {
  const history = useHistory();
  const { id: accountStationId, tab: selectedTabId = 'overview' } = useParams<AccountDetailsRouteParams>();
  const { data, loading } = useGetAccountNameQuery({
    variables: {
      id: accountStationId,
    },
    returnPartialData: true,
  });

  const accountName = data?.account?.accountName;
  const documentTitle = [accountName, `Account Details`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useRecentlyAccessed(
    `/app/swgCsrTool/account/${accountStationId}/${selectedTabId}`,
    documentTitle,
    `account-details-${accountStationId}`,
    Boolean(accountName)
  );
  useBreadcrumbs([
    {
      text: 'Galaxy Search',
      href: '/search',
    },
    {
      text: documentTitle,
    },
  ]);
  const selectedTab = tabs.find(tab => tab.id === selectedTabId);

  let content = (
    <EuiTabbedContent
      tabs={tabs}
      selectedTab={selectedTab}
      onTabClick={tab => tab.id !== selectedTabId && history.push(`/account/${accountStationId}/${tab.id}`)}
    />
  );

  if (Object.keys(data?.account ?? {}).length === 0 && !loading) {
    content = (
      <EuiCallOut title="Object not found" color="warning" iconType="alert">
        <p>No matching account was found!</p>
      </EuiCallOut>
    );
  }

  return <FullWidthPage title={data?.account?.accountName ?? 'Account Details'}>{content}</FullWidthPage>;
};
