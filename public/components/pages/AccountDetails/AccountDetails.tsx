import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiCallOut,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import CharactersTable from '../../widgets/CharactersTable';
import AppSidebar from '../../AppSidebar';

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

  return (
    <EuiPage paddingSize="l">
      <AppSidebar />
      <EuiPageBody panelled borderRadius={10} restrictWidth>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>{data?.account?.accountName ?? 'Account Details'}</h1>
          </EuiTitle>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          {content}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
