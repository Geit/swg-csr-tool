import React, { useContext, useEffect } from 'react';
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

import { KibanaCoreServicesContext } from '../KibanaCoreServicesContext';
import CharactersTable from '../widgets/CharactersTable';

import { useGetAccountNameQuery } from './AccountDetails.queries';

export const GET_ACCOUNT_NAME = gql`
  query getAccountName($id: String!) {
    account(stationId: $id) {
      id
      accountName
    }
  }
`;

const AccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { coreServices } = useContext(KibanaCoreServicesContext);
  const { data, loading } = useGetAccountNameQuery({
    variables: {
      id,
    },
    returnPartialData: true,
  });

  const accountName = data?.account?.accountName;

  useEffect(() => {
    const title = [accountName, `Account Details`].filter(Boolean).join(' - ');

    coreServices?.chrome.docTitle.change(title);

    if (accountName) {
      coreServices?.chrome.recentlyAccessed.add(`/app/swgCsrTool/account/${id}`, title, `account-details-${id}`);
    }
  }, [coreServices, accountName]);

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
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
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

export default AccountDetails;
