import React from 'react';
import { gql } from '@apollo/client';
import { EuiTableFieldDataColumnType, EuiText, EuiBadge, EuiToolTip, EuiEmptyPrompt } from '@elastic/eui';
import { Link } from 'react-router-dom';
import { useThrottle } from 'react-use';

import { resourceAttributes } from '../../../utils/resourceAttributes';
import PaginatedGQLTable from '../../PaginatedGQLTable';

import { SearchForResourcesQuery, useSearchForResourcesQuery } from './ResourceListingTable.queries';
import { RangeQueryFilter } from './ResourceListingFilters';

export const GET_RESOURCE_LISTING = gql`
  query searchForResources(
    $searchText: String!
    $resourceAttributes: [IntRangeInput!]
    $resourceDepletionDate: DateRangeInput
    $limit: Int
    $offset: Int
  ) {
    search(
      types: ["ResourceType"]
      searchText: $searchText
      resourceAttributes: $resourceAttributes
      resourceDepletionDate: $resourceDepletionDate
      size: $limit
      from: $offset
    ) {
      totalResults
      results {
        ... on ResourceType {
          id
          name
          classId
          className
          depletedTimeReal
          depletedTime
          planetDistribution {
            sceneId
            sceneName
            planetId
            seed
          }
          attributes {
            attributeId
            attributeName
            value
          }
        }
      }
    }
  }
`;

type SearchResult = NonNullable<NonNullable<SearchForResourcesQuery['search']>['results']>[number];
type Resource = SearchResult & {
  __typename: 'ResourceType';
};

const isResourceType = (r: SearchResult): r is Resource => r.__typename === 'ResourceType';

const columns: EuiTableFieldDataColumnType<Resource>[] = [
  {
    field: 'name',
    name: 'Name',
    truncateText: true,
    render(val, record) {
      return (
        <div>
          <Link to={`/resources/${record.id}`}>{val}</Link>
          <br />
          <EuiText color="subdued" size="xs">
            {record.className}
          </EuiText>
        </div>
      );
    },
  },
  {
    field: 'depletedTimeReal',
    name: 'Status',
    width: '12ex',
    render(val, record) {
      if (!record.depletedTimeReal) return null;

      const depletedTime = new Date(record.depletedTimeReal);
      return (
        <EuiToolTip
          position="top"
          content={`Expiry on ${depletedTime.toLocaleString(undefined, {
            dateStyle: 'full',
            timeStyle: 'long',
          })}`}
        >
          {depletedTime > new Date() ? (
            <EuiBadge color="success">Active</EuiBadge>
          ) : (
            <EuiBadge color="danger">Inactive</EuiBadge>
          )}
        </EuiToolTip>
      );
    },
  },
  ...resourceAttributes.map((attribute): EuiTableFieldDataColumnType<Resource> => {
    return {
      field: 'attributes',
      name: <abbr title={attribute.name}>{attribute.abbr}</abbr>,
      width: '6ex',
      render(val, record) {
        const realVal = record.attributes?.find(a => a.attributeId === attribute.id);

        const strVal = realVal?.value && realVal.value >= 1000 ? '1k' : realVal?.value ?? '--';

        return (
          <div>
            <code>{strVal}</code>
            <EuiText color="subdued" size="xs">
              {attribute.abbr}
            </EuiText>
          </div>
        );
      },
    };
  }),
];

interface ResourceListingTableProps {
  searchText: string;
  rowsPerPage: number;
  page: number;
  resourceAttributesQueryFilters: RangeQueryFilter[];
  showInactiveResources: boolean;
  onPageChanged: (pageNum: number) => void;
  onRowsPerPageChanged: (rowsPerPage: number) => void;
}

const ResourceListingTable: React.FC<ResourceListingTableProps> = ({
  searchText,
  page,
  rowsPerPage,
  resourceAttributesQueryFilters,
  showInactiveResources,
  onPageChanged,
  onRowsPerPageChanged,
}) => {
  const resultToStartAtRaw = page * rowsPerPage;

  const { data, loading, previousData, error } = useSearchForResourcesQuery({
    variables: {
      searchText,
      resourceAttributes: resourceAttributesQueryFilters,
      resourceDepletionDate: showInactiveResources ? null : { gte: 'now' },
      limit: rowsPerPage,
      offset: resultToStartAtRaw,
    },
    returnPartialData: true,
    fetchPolicy: 'cache-first',
  });

  const hasCurrentData = Object.keys(data ?? {}).length > 0;
  const realData = hasCurrentData ? data : previousData;

  const filteredResults = realData?.search.results?.filter(isResourceType) ?? [];

  return error ? (
    <EuiEmptyPrompt
      color="danger"
      iconType="alert"
      title={<h3>Search Error</h3>}
      body={<p>There was an error while querying. The results displayed may be incorrect.</p>}
    />
  ) : (
    <PaginatedGQLTable
      data={filteredResults}
      columns={columns}
      loading={loading}
      page={page}
      onPageChanged={onPageChanged}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChanged={onRowsPerPageChanged}
      totalResults={realData?.search?.totalResults ?? 0}
    />
  );
};

export default React.memo(ResourceListingTable);
