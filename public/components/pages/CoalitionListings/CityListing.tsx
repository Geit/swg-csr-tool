import React from 'react';
import { gql } from '@apollo/client';
import { EuiInMemoryTable, EuiSpacer, EuiTableFieldDataColumnType, SortDirection } from '@elastic/eui';
import { Link } from 'react-router-dom';

import { useGetAllCitiesQuery, GetAllCitiesQuery } from './CityListing.queries';

export const GET_ALL_CITIES = gql`
  query getAllCities {
    cities(limit: 1000) {
      totalResults
      results {
        id
        name
        planet
        location
        radius
        citizenCount
        structureCount
        mayor {
          id
          resolvedName
        }
      }
    }
  }
`;

type City = NonNullable<GetAllCitiesQuery['cities']['results']>[number];

const CityListing: React.FC = () => {
  const { data, loading } = useGetAllCitiesQuery();

  const columns: EuiTableFieldDataColumnType<City>[] = [
    {
      field: 'id',
      name: 'ID',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/cities/${record.id}`}>{val}</Link>;
      },
      width: '10ex',
    },
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/cities/${record.id}`}>{val}</Link>;
      },
    },
    {
      field: 'mayor.resolvedName',
      name: 'Mayor',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'citizenCount',
      name: 'Citzens',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'structureCount',
      name: 'Structures',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
  ];

  const sorting = {
    sort: {
      field: 'citizenCount',
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
        items={data?.cities.results ?? []}
        columns={columns}
        sorting={sorting}
        loading={loading}
        message={loading ? 'Loading cities...' : 'No cities found'}
      />
    </>
  );
};

export default CityListing;
