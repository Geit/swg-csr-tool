import React from 'react';
import { EuiInMemoryTable, EuiLoadingContent, EuiSpacer, EuiTableFieldDataColumnType, EuiTitle } from '@elastic/eui';
import { gql } from '@apollo/client';

import ObjectLink from '../../ObjectLink';
import UGCName from '../../UGCName';

import { GetCityStructuresQuery, useGetCityStructuresQuery } from './StructuresTable.queries';

type Structure = NonNullable<GetCityStructuresQuery['city']>['structures'][number];

export const GET_ALL_STRUCTURES = gql`
  query getCityStructures($cityId: String!) {
    city(cityId: $cityId) {
      id
      structureCount
      structures {
        id
        isValid
        object {
          id
          resolvedName
        }
        type
      }
    }
  }
`;

interface StructuresTableProps {
  cityId: string;
}

export const StructuresTable: React.FC<StructuresTableProps> = ({ cityId }) => {
  const { data, loading } = useGetCityStructuresQuery({
    variables: {
      cityId,
    },
    returnPartialData: true,
  });

  if (loading)
    return (
      <>
        <EuiTitle size="m">
          <h2>Structures</h2>
        </EuiTitle>
        <EuiSpacer />
        <EuiLoadingContent lines={5} />
      </>
    );

  const columns: EuiTableFieldDataColumnType<Structure>[] = [
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
        return <ObjectLink objectId={record.object?.id} textToDisplay={<UGCName rawName={val} />} />;
      },
    },
    {
      field: 'isValid',
      name: 'Valid',
      truncateText: true,
      render(val) {
        return val ? 'Yes' : 'No';
      },
      width: '10ex',
    },
    {
      field: 'type',
      name: 'Type bits',
      truncateText: true,
    },
  ];

  const items = data?.city?.structures.filter(({ object }) => object) ?? [];
  const paginationOptions = items.length > 10 ? { initialPageSize: 10 } : false;

  return (
    <>
      <EuiTitle size="m">
        <h2>
          {data?.city?.structureCount ?? 0} {data?.city?.structureCount === 1 ? 'Structure' : 'Structures'}
        </h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiInMemoryTable pagination={paginationOptions} items={items} columns={columns} />
    </>
  );
};
