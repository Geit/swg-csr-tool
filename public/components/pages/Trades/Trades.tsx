import React, { useState, useEffect } from 'react';
import { EuiPage, EuiPageBody, EuiPageContent, EuiPageHeaderSection, EuiSpacer, EuiTitle } from '@elastic/eui';
import { Query } from '@kbn/es-query';

import { TimeRange, DataView } from '../../../../../../src/plugins/data/common';
import AppSidebar from '../../AppSidebar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { useKibanaPlugins } from '../../../hooks/useKibanaPlugins';

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
  const { data } = useKibanaPlugins()!;
  const [searchQuery, setSearchQuery] = useState<Query | undefined>({
    query: '',
    language: 'kuery',
  });
  const [timeRange, setTimeRange] = useState<TimeRange>({ from: 'now-15m', to: 'now' });
  const { SearchBar } = data.ui;
  const [dataView, setDataView] = useState<DataView | null>(null);

  useEffect(() => {
    async function findDataview() {
      const foundDataviews = await data.dataViews.find('transaction-log');

      const dv = foundDataviews[0];
      setDataView(dv);
    }

    findDataview();
  });

  return (
    <EuiPage paddingSize="l">
      <AppSidebar />
      <EuiPageBody panelled restrictWidth>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Trades</h1>
          </EuiTitle>
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <SearchBar
            appName={'tradeViewer'}
            showFilterBar={true}
            showDatePicker={true}
            showQueryInput={true}
            query={searchQuery}
            onQuerySubmit={(params: { dateRange: TimeRange; query?: Query | undefined }) => {
              setSearchQuery(params.query);
              setTimeRange(params.dateRange);
            }}
            dateRangeFrom={timeRange.from}
            dateRangeTo={timeRange.to}
            // @ts-expect-error
            indexPatterns={[dataView]}
          />
          <EuiSpacer />
          Current thing is: {searchQuery?.query}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
