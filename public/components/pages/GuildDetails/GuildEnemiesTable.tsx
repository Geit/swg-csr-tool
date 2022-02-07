import React from 'react';
import { EuiInMemoryTable, EuiLoadingContent, EuiSpacer, EuiTableFieldDataColumnType, EuiTitle } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import ObjectLink from '../../ObjectLink';

import { GetGuildEnemiesQuery, useGetGuildEnemiesQuery } from './GuildEnemiesTable.queries';

type Enemy = NonNullable<NonNullable<GetGuildEnemiesQuery['guild']>['enemies']>[number];

export const GET_ALL_ENEMIES = gql`
  query getGuildEnemies($guildId: String!) {
    guild(guildId: $guildId) {
      id
      enemyCount
      enemies {
        guild {
          id
          name
        }
        killCount
        lastUpdateTime
      }
    }
  }
`;

export const GuildEnemiesTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetGuildEnemiesQuery({
    variables: {
      guildId: id,
    },
    returnPartialData: true,
  });

  if (loading)
    return (
      <>
        <EuiTitle size="m">
          <h2>Enemies</h2>
        </EuiTitle>
        <EuiSpacer />
        <EuiLoadingContent lines={5} />
      </>
    );

  const columns: EuiTableFieldDataColumnType<Enemy>[] = [
    {
      field: 'guild.id',
      name: 'ID',
      truncateText: true,
      render(val) {
        return <ObjectLink objectId={val} />;
      },
      width: '20ex',
    },
    {
      field: 'guild.name',
      name: 'Name',
      truncateText: true,
      render(val, record) {
        return <ObjectLink objectId={record?.guild?.id} textToDisplay={val} />;
      },
    },
    {
      field: 'killCount',
      name: 'Kill Count',
      truncateText: true,
      width: '20ex',
    },
    {
      field: 'lastUpdateTime',
      name: 'Last Update Time',
      truncateText: true,
    },
  ];

  const items = data?.guild?.enemies ?? [];
  const paginationOptions = items.length > 10 ? { initialPageSize: 10 } : false;

  return (
    <>
      <EuiTitle size="m">
        <h2>
          {data?.guild?.enemyCount ?? 0} {data?.guild?.enemyCount === 1 ? 'Enemy' : 'Enemies'}
        </h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiInMemoryTable pagination={paginationOptions} items={items} columns={columns} />
    </>
  );
};
