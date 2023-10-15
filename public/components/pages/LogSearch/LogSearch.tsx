import React, { useEffect, useRef, useState } from 'react';
import { EuiSpacer, EuiTableFieldDataColumnType, EuiSuperDatePicker } from '@elastic/eui';
import { useDebounce } from 'react-use';
import { useQueryParam, JsonParam, withDefault, StringParam, NumberParam } from 'use-query-params';
import { Filter } from '@kbn/es-query';
import { DataView } from '@kbn/data-views-plugin/common';
import { SearchHitsMetadata } from '@elastic/elasticsearch/lib/api/types';
import { SortDirection } from '@kbn/data-plugin/common';
import { css } from '@emotion/react';
import { UnifiedHistogramContainer, UnifiedHistogramCreationOptions } from '@kbn/unified-histogram-plugin/public';

import { useKibanaDateRange } from '../../../hooks/useKibanaDateRange';
import { isPresent } from '../../../utils/utility-types';
import { useKibanaPlugins } from '../../../hooks/useKibanaPlugins';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import LoadingCover from '../../LoadingCover';
import { FullWidthPage } from '../layouts/FullWidthPage';
import PaginatedGQLTable from '../../PaginatedGQLTable';
import commonlyUsedRanges from '../../../utils/commonlyUsedRanges';

import { LogMessage } from './LogMessage';
import { LogCategory } from './LogCategory';
import { CategoryHeader } from './CategoryHeader';

const FiltersParamJson = withDefault(JsonParam, []);

const histogramContainerStyles = css`
  > .euiResizablePanel,
  > .euiResizableButton,
  .euiSpacer {
    display: none;
  }

  > .euiResizablePanel:first-of-type {
    display: block;
    block-size: 200px !important;
  }
`;

interface LogMessageSource {
  category: string;
  channel: string;
  '@timestamp': string;
  message: string;
  source: string;
}

const columns: EuiTableFieldDataColumnType<LogMessageSource>[] = [
  {
    field: '@timestamp',
    name: 'Time',
    truncateText: false,
    width: '30ex',
    render(val) {
      return new Date(val).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'long',
      });
    },
  },
  {
    field: 'category',
    name: <CategoryHeader />,
    mobileOptions: {
      header: 'Category',
    },
    truncateText: false,
    width: '20ex',
    css: css`
      word-break: break-all;

      .actionButtons {
        display: none;
      }

      &:hover .actionButtons {
        display: inline;
      }
    `,
    render(val) {
      return <LogCategory category={val} />;
    },
  },
  {
    field: 'message',
    name: 'Message',
    truncateText: false,
    width: 'auto',
    render(val) {
      return <LogMessage message={val} />;
    },
  },
];

export const DEFAULT_PAGE = 0;
const PER_PAGE_OPTIONS = [50, 100, 250, 500, 1000];
export const DEFAULT_PER_PAGE: (typeof PER_PAGE_OPTIONS)[number] = 100;
const DEFAULT_START_DATE = 'now-1M';
const DEFAULT_END_DATE = 'now';

export const LogSearch: React.FC = () => {
  const services = useKibanaPlugins();
  const { unifiedSearch, data: dataPlugin } = services;
  const [dataView, setDataView] = useState<DataView>();
  const [loading, setIsLoading] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(123);
  const [elasticResults, setElasticResults] = useState<SearchHitsMetadata<LogMessageSource>>();

  const { SearchBar } = unifiedSearch.ui;
  const [rowsPerPage, setRowsPerPage] = useQueryParam('pp', withDefault(NumberParam, DEFAULT_PER_PAGE));
  const [page, setPage] = useQueryParam('p', withDefault(NumberParam, DEFAULT_PAGE));
  const [filters, setFilters] = useQueryParam<Filter[]>('f', FiltersParamJson);
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, ''));
  const realQuery = { language: 'kuery', query: query ?? '' };
  const { setDateRange, currentDateRange, recentDateRanges } = useKibanaDateRange();

  useDebounce(
    () => {
      const abortController = new AbortController();
      const search = async () => {
        if (!dataView) return;
        setIsLoading(true);
        const dateRange = dataPlugin.query.timefilter.timefilter.createFilter(dataView, currentDateRange);
        const searchSource = await dataPlugin.search.searchSource.create();
        searchSource.setField('index', dataView);
        searchSource.setField('size', rowsPerPage);
        searchSource.setField('from', page * rowsPerPage);
        searchSource.setField('sort', {
          '@timestamp': SortDirection.desc,
        });
        searchSource.setField('filter', [...filters, dateRange].filter(isPresent));
        searchSource.setField('query', realQuery);
        const resp = await searchSource.fetch({
          abortSignal: abortController.signal,
          sessionId: `${Math.random()}`,
          legacyHitsTotal: false,
        });
        setElasticResults(resp.hits as any);
        setIsLoading(false);
      };

      search().catch(error => {
        setIsLoading(false);
        if (error.name === 'AbortError') {
          // ignore abort errors
        } else {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      });

      return () => {
        abortController.abort();
      };
    },
    200,
    [filters, dataView, query, currentDateRange, refreshKey, rowsPerPage, page]
  );

  useEffect(() => {
    let canceled = false;
    const loadDataView = async () => {
      const [loadedDataView] = await dataPlugin.dataViews.find('legends_log_alias');
      if (canceled) return;
      setDataView(loadedDataView);
    };

    loadDataView();
    return () => {
      canceled = true;
    };
  }, [dataPlugin]);

  const documentTitle = [query, `Log Search`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useBreadcrumbs([
    {
      text: 'Log Search',
    },
  ]);

  const getCreationOptions = (): UnifiedHistogramCreationOptions => ({
    localStorageKeyPrefix: 'swgCsrToolLogSearch',
    initialState: {
      topPanelHeight: 200,
    },
  });

  useEffect(() => {
    const timeFilter = dataPlugin.query.timefilter.timefilter;
    const subscription = timeFilter.getTimeUpdate$().subscribe(() => {
      const newTime = timeFilter.getTime();
      setDateRange(newTime);
    });

    return () => {
      subscription?.unsubscribe();
    };
  });

  useEffect(() => {
    const filterManager = dataPlugin.query.filterManager;
    const subscription = filterManager.getUpdates$().subscribe(() => {
      const newFilters = filterManager.getFilters();
      setFilters(newFilters);
    });

    return () => {
      subscription?.unsubscribe();
    };
  });

  const titleAsides = (
    <div style={{ minWidth: '200px' }}>
      <EuiSuperDatePicker
        width="full"
        onTimeChange={evt => {
          const from = evt.start === DEFAULT_START_DATE ? undefined : evt.start;
          const to = evt.end === DEFAULT_END_DATE ? undefined : evt.end;

          setDateRange({ from: from ?? DEFAULT_START_DATE, to: to ?? DEFAULT_END_DATE });
        }}
        start={currentDateRange.from}
        end={currentDateRange.to}
        recentlyUsedRanges={recentDateRanges.map(m => ({ start: m.from, end: m.to }))}
        isLoading={false}
        showUpdateButton={false}
        commonlyUsedRanges={commonlyUsedRanges}
      />
    </div>
  );

  const fieldSearch = (
    <>
      <SearchBar
        appName="swgCsrTool_logSearch"
        isLoading={loading || !dataView}
        iconType="search"
        placeholder="Search for logs"
        indexPatterns={dataView ? [dataView] : undefined}
        useDefaultBehaviors
        showQueryInput
        showQueryMenu={false}
        showDatePicker={false}
        showSubmitButton
        disableQueryLanguageSwitcher
        displayStyle="inPage"
        key={`${filters.length}`} // HACK - Component doesn't react to changes?
        filters={filters}
        query={realQuery}
        onFiltersUpdated={newFilters => {
          dataPlugin.query.filterManager.setFilters(newFilters);
          setFilters(newFilters);
        }}
        onQuerySubmit={({ query: newQuery }) => {
          if (typeof newQuery?.query === 'object') {
            throw new Error('Unhandled query type!');
          }

          setQuery(newQuery?.query ?? '');
          setRefreshKey(Math.random());
        }}
        onRefresh={() => {
          setRefreshKey(Math.random());
        }}
        submitOnBlur={true}
      />
      <EuiSpacer />
    </>
  );

  const totalHits = typeof elasticResults?.total === 'number' ? elasticResults?.total : elasticResults?.total?.value;

  if (!dataView) return null;

  return (
    <FullWidthPage
      title="Log Search"
      titleAsides={titleAsides}
      pageContentProps={{
        style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'start' },
      }}
    >
      {fieldSearch}
      <div ref={resizeRef} style={{ marginBottom: '0', display: 'flex', flex: 1 }}>
        <UnifiedHistogramContainer
          // Pass the required services to Unified Histogram
          // @ts-expect-error fix later
          services={services}
          // Pass request parameters to Unified Histogram
          dataView={dataView}
          query={realQuery!}
          filters={filters}
          timeRange={currentDateRange}
          resizeRef={resizeRef}
          getCreationOptions={getCreationOptions}
          css={histogramContainerStyles}
        >
          <div></div>
        </UnifiedHistogramContainer>
      </div>
      <LoadingCover isLoading={loading} delay={5000}>
        <PaginatedGQLTable
          data={elasticResults?.hits.map(m => m._source).filter(isPresent) ?? []}
          columns={columns}
          loading={loading}
          page={page}
          onPageChanged={setPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChanged={setRowsPerPage}
          totalResultCount={Math.min(totalHits ?? 0, 10000)}
          perPageOptions={PER_PAGE_OPTIONS}
        />
      </LoadingCover>
    </FullWidthPage>
  );
};
