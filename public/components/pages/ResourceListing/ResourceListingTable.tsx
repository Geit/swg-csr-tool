import React, { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import {
  EuiDualRange,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiBasicTable,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiBadge,
  EuiToolTip,
  EuiSwitch,
  EuiTablePagination,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { Link } from 'react-router-dom';

import { useDebouncedMemo } from '../../../hooks/useDebouncedMemo';
import { resourceAttributes } from '../../../utils/resourceAttributes';

import { SearchForResourcesQuery, useSearchForResourcesQuery } from './ResourceListingTable.queries';

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
      totalResultCount
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

const DEFAULT_MAX = 1000;
const DEFAULT_MIN = 0;

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

const DEFAULT_PAGE = 0;
const PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PER_PAGE: typeof PER_PAGE_OPTIONS[number] = 25;

const ResourceListingTable: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PER_PAGE);
  const [page, setPage] = useState(DEFAULT_PAGE);

  const [showInactiveResources, setShowInactiveResources] = useState(false);
  const [resourceAttributeFilters, setResourceAttributeFilters] = useState(
    Object.fromEntries(resourceAttributes.map(a => [a.id, { min: DEFAULT_MIN, max: DEFAULT_MAX }]))
  );

  const resourceAttributesQueryFilters = useDebouncedMemo(
    () =>
      Object.entries(resourceAttributeFilters).flatMap(([key, value]) => {
        if (value.max === DEFAULT_MAX && value.min === DEFAULT_MIN) return [];

        const range = {
          key,
          gte: undefined as number | undefined,
          lte: undefined as number | undefined,
        };

        if (value.max !== DEFAULT_MAX) range.lte = value.max;
        if (value.min !== DEFAULT_MIN) range.gte = value.min;

        return range;
      }),
    [resourceAttributeFilters],
    200
  );

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

  useEffect(() => {
    if (!loading && realData && resultToStartAtRaw > realData.search.totalResultCount) {
      setPage(0);
    }
  }, [realData, resultToStartAtRaw, loading, setPage]);

  return (
    <>
      <EuiSpacer />
      <EuiFlexGroup alignItems="center" gutterSize="xl">
        <EuiFlexItem grow={3}>
          <EuiFieldText
            placeholder="Search by resource class name or name..."
            icon="search"
            fullWidth
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSwitch
            label="Show inactive resources"
            checked={showInactiveResources}
            onChange={e => setShowInactiveResources(e.target.checked)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiFlexGroup gutterSize="xl">
        <EuiFlexItem grow={3}>
          {error ? (
            <EuiEmptyPrompt
              color="danger"
              iconType="alert"
              title={<h3>Search Error</h3>}
              body={<p>There was an error while querying. The results displayed may be incorrect.</p>}
            />
          ) : (
            <>
              <EuiBasicTable
                items={realData?.search.results?.filter(isResourceType) ?? []}
                columns={columns}
                loading={loading}
              />
              <EuiTablePagination
                pageCount={Math.ceil((realData?.search?.totalResultCount ?? 0) / rowsPerPage)}
                activePage={page}
                onChangePage={pageNum => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setPage(pageNum);
                }}
                itemsPerPage={rowsPerPage}
                onChangeItemsPerPage={perPage => setRowsPerPage(perPage)}
                itemsPerPageOptions={PER_PAGE_OPTIONS}
              />
            </>
          )}
        </EuiFlexItem>
        <EuiFlexItem>
          {resourceAttributes.map(attribute => {
            return (
              <EuiFormRow label={attribute.name} key={attribute.id}>
                <EuiDualRange
                  showTicks
                  tickInterval={250}
                  min={0}
                  max={1000}
                  value={[resourceAttributeFilters[attribute.id].min, resourceAttributeFilters[attribute.id].max]}
                  onChange={([min, max]) => {
                    const realMin = typeof min === 'number' ? min : parseInt(min);
                    const realMax = typeof max === 'number' ? max : parseInt(max);

                    setResourceAttributeFilters(raf => ({
                      ...raf,
                      [attribute.id]: { min: realMin, max: realMax },
                    }));
                  }}
                />
              </EuiFormRow>
            );
          })}
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default ResourceListingTable;
