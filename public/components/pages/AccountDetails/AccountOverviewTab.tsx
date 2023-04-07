import React from 'react';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { useParams } from 'react-router-dom';

import CharactersTable from '../../widgets/CharactersTable';
import { AccountStructureTable } from '../../widgets/StructuresTable';

import { AccountDetailsRouteParams } from './AccountDetails';

export const AccountOverviewTab: React.FC = () => {
  const { id: accountStationId } = useParams<AccountDetailsRouteParams>();

  return (
    <>
      <EuiSpacer />
      <EuiTitle>
        <h2>Characters</h2>
      </EuiTitle>
      <CharactersTable stationId={accountStationId} />
      <EuiSpacer size="l" />
      <>
        <EuiTitle>
          <h2>Structures</h2>
        </EuiTitle>
        <AccountStructureTable stationId={accountStationId} />
      </>
    </>
  );
};
