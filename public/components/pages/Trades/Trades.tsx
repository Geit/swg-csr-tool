import React, { useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTablePagination,
  EuiText,
  EuiSwitch,
  EuiEmptyPrompt,
  EuiSuperDatePicker,
  OnRefreshChangeProps,
  EuiSelect,
  EuiFieldText,
  EuiIcon,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import {
  useQueryParam,
  StringParam,
  NumberParam,
  withDefault,
  BooleanParam,
  DelimitedArrayParam,
} from 'use-query-params';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import commonlyUsedRanges from '../../../utils/commonlyUsedRanges';
import { useKibanaDateRange } from '../../../hooks/useKibanaDateRange';
import { isPresent } from '../../../utils/utility-types';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useSearchForTransactionsQuery } from './Trades.queries';
import TransactionCard from './TransactionCard';
import TransactionTable from './TransactionTable';

export const SEARCH_FOR_TRANSACTIONS = gql`
  query searchForTransactions(
    $searchText: String
    $arePartiesSameAccount: Boolean
    $afterDate: String
    $beforeDate: String
    $from: Int
    $limit: Int
    $sortDirection: String
    $sortField: String
    $parties: [String!]
  ) {
    transactions(
      arePartiesSameAccount: $arePartiesSameAccount
      searchText: $searchText
      afterDate: $afterDate
      beforeDate: $beforeDate
      from: $from
      limit: $limit
      sortDirection: $sortDirection
      sortField: $sortField
      parties: $parties
    ) {
      totalResults
      results {
        id
        arePartiesSameAccount
        parties {
          oid
          name
          itemsReceived {
            oid
            basicName
            staticName
            template
            count
            name
          }
          creditsReceived
          stationId
        }
        type
        date
        transactionValue
        itemCount
      }
    }
  }
`;

const DEFAULT_START_DATE = 'now-1M';
const DEFAULT_END_DATE = 'now';
const DEFAULT_PAGE = 0;
const PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PER_PAGE: (typeof PER_PAGE_OPTIONS)[number] = 25;

const SORT_OPTIONS = [
  {
    value: 'most_recent',
    text: 'Date: Most recent first',
    sortDirection: 'DESC',
    sortField: '@timestamp',
  },
  {
    value: 'least_recent',
    text: 'Date: Least recent first',
    sortDirection: 'ASC',
    sortField: '@timestamp',
  },
  {
    value: 'most_expensive',
    text: 'Value: High to low',
    sortDirection: 'DESC',
    sortField: 'transactionValue',
  },
  {
    value: 'least_expensive',
    text: 'Value: Low to high',
    sortDirection: 'ASC',
    sortField: 'transactionValue',
  },
];
const DEFAULT_SORT_OPTION = SORT_OPTIONS[0];

export const Trades: React.FC = () => {
  const documentTitle = `Trades`;
  useDocumentTitle(documentTitle);
  useRecentlyAccessed(`/app/swgCsrTool/trades`, documentTitle, `trades-search`, true);
  useBreadcrumbs([
    {
      text: 'Trades',
      href: '/trades',
    },
  ]);
  const [rowsPerPage, setRowsPerPage] = useQueryParam('perPage', withDefault(NumberParam, DEFAULT_PER_PAGE));
  const [page, setPage] = useQueryParam('p', withDefault(NumberParam, DEFAULT_PAGE));
  const [viewAsTable, setViewAsTable] = useQueryParam('table', withDefault(BooleanParam, true));
  const [showSameAccountTransactions, setShowSameAccountTransactions] = useQueryParam(
    'sameAccount',
    withDefault(BooleanParam, false)
  );
  const [searchQuery, setSearchQuery] = useQueryParam('q', StringParam);
  const [parties] = useQueryParam('parties', DelimitedArrayParam);
  const { setDateRange, currentDateRange, recentDateRanges } = useKibanaDateRange();

  const [sortOption, setSortOption] = useQueryParam('sort', withDefault(StringParam, DEFAULT_SORT_OPTION.value));
  const [refresh, setRefreshOptions] = useState<OnRefreshChangeProps>({ isPaused: true, refreshInterval: 10000 });

  const currentSortOption = SORT_OPTIONS.find(({ value }) => value === sortOption) || DEFAULT_SORT_OPTION;

  const searchText = typeof searchQuery === 'string' ? searchQuery : null;

  const resultToStartAtRaw = page * rowsPerPage;

  const { loading, data, error, refetch, previousData } = useSearchForTransactionsQuery({
    variables: {
      afterDate: currentDateRange.from,
      beforeDate: currentDateRange.to,
      searchText,
      from: resultToStartAtRaw,
      limit: rowsPerPage,
      arePartiesSameAccount: showSameAccountTransactions ? null : false,
      sortDirection: currentSortOption.sortDirection,
      sortField: currentSortOption.sortField,
      parties: parties?.filter(isPresent) ?? null,
    },
    returnPartialData: true,
  });

  const hasCurrentData = Object.keys(data ?? {}).length > 0;
  const realData = hasCurrentData ? data : previousData;

  const resultCount = realData?.transactions?.totalResults ?? 0;
  const curStartingResult = Math.min(resultToStartAtRaw + 1, resultCount);
  const curEndingResult = Math.min((page + 1) * rowsPerPage, resultCount);

  useEffect(() => {
    if (!loading && resultToStartAtRaw > resultCount) {
      setPage(undefined);
    }
  }, [resultCount, resultToStartAtRaw, loading, setPage]);

  const emptyMessage =
    resultCount > 0 ? (
      <EuiEmptyPrompt iconType="search" title={<h3>No Trades Found</h3>} titleSize="s" />
    ) : (
      <EuiEmptyPrompt iconType="search" title={<h3>Search to find trades</h3>} titleSize="s" />
    );

  const titleAsides = (
    <div style={{ minWidth: '200px' }}>
      <EuiSuperDatePicker
        width="auto"
        onTimeChange={evt => {
          const from = evt.start === DEFAULT_START_DATE ? undefined : evt.start;
          const to = evt.end === DEFAULT_END_DATE ? undefined : evt.end;

          setDateRange({ from: from ?? DEFAULT_START_DATE, to: to ?? DEFAULT_END_DATE });
        }}
        start={currentDateRange.from}
        end={currentDateRange.to}
        recentlyUsedRanges={recentDateRanges.map(m => ({ start: m.from, end: m.to }))}
        onRefresh={() => {
          refetch();
        }}
        showUpdateButton="iconOnly"
        onRefreshChange={setRefreshOptions}
        refreshInterval={Math.max(1000, refresh.refreshInterval)}
        isPaused={refresh.isPaused}
        isLoading={loading}
        commonlyUsedRanges={commonlyUsedRanges}
      />
    </div>
  );

  return (
    <FullWidthPage title="Trades" titleAsides={titleAsides}>
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem grow={3}>
          <EuiFieldText
            fullWidth
            icon="search"
            placeholder="e.g. geit"
            isLoading={loading}
            value={searchQuery ?? ''}
            onChange={e => setSearchQuery(e.target.value, 'replaceIn')}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            prepend={<EuiIcon type="sortable" />}
            fullWidth
            options={SORT_OPTIONS}
            value={sortOption}
            onChange={e => {
              setSortOption(e.target.value, 'replaceIn');
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem>
              <EuiSwitch
                label="View as table"
                checked={viewAsTable}
                onChange={e => setViewAsTable(e.target.checked, 'replaceIn')}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiSwitch
                label="Show same account transactions"
                checked={showSameAccountTransactions}
                onChange={e => setShowSameAccountTransactions(e.target.checked, 'replaceIn')}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          {resultCount > 0 && (
            <EuiText textAlign="right">
              Viewing {curStartingResult}-{curEndingResult} of {resultCount}
            </EuiText>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />

      {resultCount > 0 ? (
        <>
          {viewAsTable ? (
            <>
              <TransactionTable
                key="transaction-table"
                transactions={realData?.transactions?.results ?? null}
                showSameAccountTransactions={showSameAccountTransactions}
              />
              <EuiSpacer />
            </>
          ) : (
            <div key="transaction-cards">
              {realData?.transactions?.results.map(tx => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
          <EuiTablePagination
            pageCount={Math.ceil((realData?.transactions?.totalResults ?? 0) / rowsPerPage)}
            activePage={page}
            onChangePage={pageNum => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setPage(pageNum === DEFAULT_PAGE ? undefined : pageNum);
            }}
            itemsPerPage={rowsPerPage}
            onChangeItemsPerPage={perPage => setRowsPerPage(perPage, 'replaceIn')}
            itemsPerPageOptions={PER_PAGE_OPTIONS}
          />
        </>
      ) : (
        emptyMessage
      )}
    </FullWidthPage>
  );
};
