import React from 'react';
import { EuiSpacer } from '@elastic/eui';
import { useParams } from 'react-router-dom';

import { AccountVeteranRewardTable } from '../../widgets/VeteranRewardTable';

import { AccountDetailsRouteParams } from './AccountDetails';

export const AccountVeteranRewardTab: React.FC = () => {
  const { id: accountStationId } = useParams<AccountDetailsRouteParams>();

  return (
    <>
      <EuiSpacer />
      <AccountVeteranRewardTable stationId={accountStationId} />
    </>
  );
};
