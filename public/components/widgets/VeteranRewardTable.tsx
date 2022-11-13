import React from 'react';
import { ApolloError, gql } from '@apollo/client';
import { EuiCallOut, EuiEmptyPrompt, EuiInMemoryTable, EuiTableFieldDataColumnType } from '@elastic/eui';

import ObjectLink from '../ObjectLink';

import { useGetVeteranRewardsForAccountQuery } from './VeteranRewardTable.queries';

export const GET_VET_REWARDS_FOR_ACCOUNT = gql`
  query getVeteranRewardsForAccount($stationId: String!) {
    account(stationId: $stationId) {
      id
      veteranRewards {
        type
        id
        name
        claimDate
        characterId
        character {
          id
          name
        }
      }
    }
  }
`;

interface VetReward {
  __typename?: string;
  type: string;
  id: string;
  name?: string | null;
  characterId: string;
  characterName?: string | null;
  claimDate: string;
}

const columns: EuiTableFieldDataColumnType<VetReward>[] = [
  {
    field: 'type',
    name: 'Type',
    truncateText: true,
    width: '10ex',
  },
  {
    field: 'name',
    name: 'Name',
    truncateText: false,
    render(val, record) {
      return record.name ? record.name : record.id;
    },
  },
  {
    field: 'character.name',
    name: 'Claimed on',
    truncateText: true,
    render(val, record) {
      return <ObjectLink objectId={record.characterId} textToDisplay={record.characterName ?? record.characterId} />;
    },
    width: '25ex',
  },
  {
    field: 'claimDate',
    name: 'Claim Date',
    width: '40ex',
    render(val, record) {
      const claimDateDate = new Date(record.claimDate);

      return (
        <div>
          {claimDateDate.toLocaleString(undefined, {
            dateStyle: 'full',
            timeStyle: undefined,
          })}
          &nbsp;
          <wbr />
          {claimDateDate.toLocaleString(undefined, {
            dateStyle: undefined,
            timeStyle: 'long',
          })}
        </div>
      );
    },
  },
];

const VetRewardTableEmpty: React.FC = () => (
  <EuiEmptyPrompt title={<h3>This player has not claimed any rewards</h3>} titleSize="xs" />
);

export const AccountVeteranRewardTable: React.FC<{ stationId: string }> = ({ stationId }) => {
  const { data, loading, error } = useGetVeteranRewardsForAccountQuery({
    variables: {
      stationId,
    },
    returnPartialData: true,
  });

  if (error)
    return (
      <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
        <p>There was an error while querying. The results displayed may be incorrect.</p>
      </EuiCallOut>
    );

  // EuiInMemoryTable can only do searches on totally flat objects, so we flatten characterName into the main object.
  const items = data?.account?.veteranRewards?.map(c => ({ ...c, characterName: c.character?.name })) ?? [];

  return (
    <EuiInMemoryTable
      pagination={{ initialPageSize: 10 }}
      loading={loading}
      error={error}
      items={items}
      columns={columns}
      search={{
        box: {
          incremental: true,
          compressed: true,
        },
      }}
      message={loading ? 'Loading veteran rewards...' : <VetRewardTableEmpty />}
    />
  );
};
