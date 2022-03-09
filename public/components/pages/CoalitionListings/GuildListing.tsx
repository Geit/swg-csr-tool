import React from 'react';
import { gql } from '@apollo/client';
import {
  EuiInMemoryTable,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  SortDirection,
} from '@elastic/eui';
import { Link } from 'react-router-dom';

import { GetAllGuildsQuery, useGetAllGuildsQuery } from './GuildListing.queries';

export const GET_ALL_GUILDS = gql`
  query getAllGuilds {
    guilds {
      id
      name
      abbreviation
      leader {
        id
        resolvedName
      }
      memberCount
      enemyCount
      faction
      gcwDefenderRegion
    }
  }
`;

type Guild = NonNullable<GetAllGuildsQuery['guilds']>[number];

const GuildListing: React.FC = () => {
  const { data, loading } = useGetAllGuildsQuery();

  if (loading)
    return (
      <>
        <EuiSpacer />
        <EuiLoadingSpinner />
      </>
    );

  const columns: EuiTableFieldDataColumnType<Guild>[] = [
    {
      field: 'id',
      name: 'ID',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/guilds/${record.id}`}>{val}</Link>;
      },
      width: '10ex',
    },
    {
      field: 'abbreviation',
      name: 'Abbreviation',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/guilds/${record.id}`}>{val}</Link>;
      },
      width: '10ex',
    },
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/guilds/${record.id}`}>{val}</Link>;
      },
    },
    {
      field: 'leader.resolvedName',
      name: 'Leader',
      sortable: false,
      truncateText: true,
      dataType: 'string',
    },
    {
      field: 'memberCount',
      name: 'Members',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'enemyCount',
      name: 'Enemies',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
  ];

  const sorting = {
    sort: {
      field: 'memberCount',
      direction: SortDirection.DESC,
    },
  };

  const paginationOptions = { pageSize: 100, hidePerPageOptions: true };

  return (
    <>
      <EuiSpacer />
      <EuiInMemoryTable
        search={{
          box: {
            incremental: true,
          },
        }}
        pagination={paginationOptions}
        items={data?.guilds ?? []}
        columns={columns}
        sorting={sorting}
      />
    </>
  );
};

export default GuildListing;
