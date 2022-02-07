import React from 'react';
import { EuiInMemoryTable, EuiLoadingContent, EuiSpacer, EuiTableFieldDataColumnType, EuiTitle } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import ObjectLink from '../../ObjectLink';

import { GetCityCitizensQuery, useGetCityCitizensQuery } from './CitizensTable.queries';

type Citizen = NonNullable<GetCityCitizensQuery['city']>['citizens'][number];

export const GET_CITY_CITIZENS = gql`
  query getCityCitizens($cityId: String!) {
    city(cityId: $cityId) {
      id
      citizenCount
      citizens {
        id
        skillTemplateTitle
        level
        object {
          id
          resolvedName
        }
      }
    }
  }
`;

export const CitizensTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetCityCitizensQuery({
    variables: {
      cityId: id,
    },
    returnPartialData: true,
  });

  if (loading)
    return (
      <>
        <EuiTitle size="m">
          <h2>Citizens</h2>
        </EuiTitle>
        <EuiSpacer />
        <EuiLoadingContent lines={5} />
      </>
    );

  const columns: EuiTableFieldDataColumnType<Citizen>[] = [
    {
      field: 'object.id',
      name: 'ID',
      truncateText: true,
      render(val) {
        return <ObjectLink objectId={val} />;
      },
      width: '20ex',
    },
    {
      field: 'object.resolvedName',
      name: 'Name',
      truncateText: true,
      render(val, record) {
        return <ObjectLink objectId={record.id} textToDisplay={val} />;
      },
    },
    {
      field: 'level',
      name: 'Level',
      truncateText: true,
      width: '10ex',
    },
    {
      field: 'skillTemplateTitle',
      name: 'Class',
      truncateText: true,
    },
  ];

  const items = data?.city?.citizens ?? [];
  const paginationOptions = items.length > 10 ? { initialPageSize: 10 } : false;

  return (
    <>
      <EuiTitle size="m">
        <h2>
          {data?.city?.citizenCount ?? 0} {data?.city?.citizenCount === 1 ? 'Citizen' : 'Citizens'}
        </h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiInMemoryTable pagination={paginationOptions} items={items} columns={columns} />
    </>
  );
};
