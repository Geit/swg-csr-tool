import React from 'react';
import { EuiDescriptionList, EuiDescriptionListDescription, EuiDescriptionListTitle } from '@elastic/eui';

import { SearchResultCard } from './SearchResultCard';
import { ResultIcon } from './ResultIcon';

import { AccountResult } from '.';

export const AccountCard: React.FC<{ account: AccountResult }> = ({ account }) => {
  return (
    <SearchResultCard
      href={`/account/${account.id}`}
      title={
        (
          <span>
            <ResultIcon resultType={account.__typename} />
            {account.accountName}
          </span>
        ) ?? 'Unknown account'
      }
    >
      <EuiDescriptionList className="galaxySearchKeyValues" textStyle="reverse">
        <div>
          <EuiDescriptionListTitle>Type</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{account.__typename}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Station ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{account.id}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Characters</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {account.characters?.map(c => c.resolvedName).join(', ')}
          </EuiDescriptionListDescription>
        </div>
      </EuiDescriptionList>
    </SearchResultCard>
  );
};
