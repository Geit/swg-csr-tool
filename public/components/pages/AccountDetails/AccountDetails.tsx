import React from 'react';
import { EuiSpacer, EuiTitle, EuiCallOut } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import CharactersTable from '../../widgets/CharactersTable';
import { AccountStructureTable } from '../../widgets/StructuresTable';
import { AccountVeteranRewardTable } from '../../widgets/VeteranRewardTable';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useGetAccountNameQuery } from './AccountDetails.queries';

export const GET_ACCOUNT_NAME = gql`
  query getAccountName($id: String!) {
    account(stationId: $id) {
      id
      accountName
    }
  }
`;

export const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetAccountNameQuery({
    variables: {
      id,
    },
    returnPartialData: true,
  });

  const accountName = data?.account?.accountName;
  const documentTitle = [accountName, `Account Details`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useRecentlyAccessed(`/app/swgCsrTool/account/${id}`, documentTitle, `account-details-${id}`, Boolean(accountName));
  useBreadcrumbs([
    {
      text: 'Galaxy Search',
      href: '/search',
    },
    {
      text: documentTitle,
    },
  ]);

  let content = (
    <>
      <EuiTitle>
        <h2>Characters</h2>
      </EuiTitle>
      <CharactersTable stationId={id} />
      <EuiSpacer size="l" />
      <>
        <EuiTitle>
          <h2>Structures</h2>
        </EuiTitle>
        <AccountStructureTable stationId={id} />
      </>
      <EuiSpacer size="l" />
      <>
        <EuiTitle>
          <h2>Veteran Rewards</h2>
        </EuiTitle>
        <EuiSpacer />
        <AccountVeteranRewardTable stationId={id} />
      </>
      {/* Prevents this page being sized based on its content */}
      <EuiSpacer style={{ width: '2000px' }} />
    </>
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
