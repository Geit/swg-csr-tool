import React from 'react';
import { gql } from '@apollo/client';
import { EuiInMemoryTable, EuiSpacer, EuiTableFieldDataColumnType, SortDirection } from '@elastic/eui';
import { Link } from 'react-router-dom';

import { GetAllGuildsQuery, useGetAllGuildsQuery } from './GuildListing.queries';

export const GET_ALL_GUILDS = gql`
  query getAllGuilds {
    guilds(limit: 1500) {
      totalResults
      results {
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
  }
`;

type Guild = NonNullable<GetAllGuildsQuery['guilds']['results']>[number];

const GuildListing: React.FC = () => {
  const { data, loading } = useGetAllGuildsQuery();

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
        items={data?.guilds.results ?? []}
        columns={columns}
        sorting={sorting}
        loading={loading}
        message={loading ? 'Loading guilds...' : 'No guilds found'}
      />
    </>
  );
};

export default GuildListing;
