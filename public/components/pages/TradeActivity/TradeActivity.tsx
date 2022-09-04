import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiTitle,
  EuiSuperDatePicker,
  EuiText,
  EuiFieldText,
  EuiLoadingContent,
  EuiEmptyPrompt,
  EuiLoadingSpinner,
  EuiDelayRender,
} from '@elastic/eui';
import { useQueryParam, StringParam, withDefault } from 'use-query-params';
import { gql } from '@apollo/client';

import AppSidebar from '../../AppSidebar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { useKibanaDateRange } from '../../../hooks/useKibanaDateRange';
import commonlyUsedRanges from '../../../utils/commonlyUsedRanges';
import { TradeRollup } from '../../TradeRollup';

import { useGetTradeReportQuery } from './TradeActivity.queries';

export const GET_TRADE_REPORT = gql`
  query getTradeReport($stationId: String, $from: String, $until: String) {
    tradeReport(stationId: $stationId, from: $from, until: $until) {
      totalValue
      parties {
        identifier
        entity {
          __typename
          ... on Account {
            id
            accountName
          }

          ... on PlayerCreatureObject {
            id
            resolvedName
          }
        }
        itemsReceived {
          name
          basicName
          oid
          count
          wasOriginalOwner
        }
        creditsReceived
      }
    }
  }
`;

const DEFAULT_START_DATE = 'now-1M';
const DEFAULT_END_DATE = 'now';

interface TradeActivityResultsProps {
  dateRange: { to: string; from: string };
  stationId?: string | null;
}

export const TradeActivityResults: React.FC<TradeActivityResultsProps> = ({ dateRange, stationId }) => {
  const { data, error, loading } = useGetTradeReportQuery({
    variables: {
      stationId,
      until: dateRange.to,
      from: dateRange.from,
    },
    skip: !stationId || stationId.trim().length < 3,
  });

  if (loading)
    return (
      <EuiDelayRender delay={500}>
        <EuiEmptyPrompt icon={<EuiLoadingSpinner size="xl" />} title={<h2>Loading</h2>} />
      </EuiDelayRender>
    );

  if (error)
    return (
      <EuiEmptyPrompt
        color="danger"
        iconType="alert"
        title={<h2>Unable to get a trade activity report.</h2>}
        body={<p>Please contact a developer for assistance.</p>}
      />
    );

  if (!data || !data.tradeReport)
    return <EuiEmptyPrompt iconType="search" title={<h2>Enter a Account ID to generate a report</h2>} titleSize="s" />;

  if (data.tradeReport.length === 0)
    return (
      <EuiEmptyPrompt
        iconType="questionInCircle"
        title={<h2>No trade activity found.</h2>}
        body={<p>Try adjusting your search terms, or your chosen date range.</p>}
      />
    );

  return (
    <>
      {data.tradeReport.map(rollup => {
        return (
          <>
            <TradeRollup key={rollup.parties[1].identifier} parties={rollup.parties} />
            <EuiSpacer />
          </>
        );
      })}
    </>
  );
};

export const TradeActivity: React.FC = () => {
  const documentTitle = `Trade Report`;
  useDocumentTitle(documentTitle);
  useRecentlyAccessed(`/app/swgCsrTool/trade-report`, documentTitle, `trade-report`, true);
  useBreadcrumbs([
    {
      text: 'Trades',
      href: '/trades',
    },
    {
      text: 'Trade Rollups',
      href: '/trade-report',
    },
  ]);
  const [stationId, setStationId] = useQueryParam('stationId', StringParam);
  const [timeRangeStart, setTimeRangeStart] = useQueryParam('ds', withDefault(StringParam, DEFAULT_START_DATE));
  const [timeRangeEnd, setTimeRangeEnd] = useQueryParam('de', withDefault(StringParam, DEFAULT_END_DATE));
  const { setDateRange, currentDateRange, recentDateRanges } = useKibanaDateRange(
    timeRangeStart,
    timeRangeEnd,
    timeRangeStart !== DEFAULT_START_DATE || timeRangeEnd !== DEFAULT_END_DATE
  );

  return (
    <EuiPage paddingSize="l">
      <AppSidebar />
      <EuiPageBody panelled restrictWidth>
        <EuiPageHeaderSection>
          <EuiFlexGroup gutterSize="s">
            <EuiFlexItem grow={2}>
              <EuiTitle size="l">
                <h1>Trade Report</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiSuperDatePicker
                width="auto"
                onTimeChange={evt => {
                  const from = evt.start === DEFAULT_START_DATE ? undefined : evt.start;
                  const to = evt.end === DEFAULT_END_DATE ? undefined : evt.end;

                  setDateRange({ from: from ?? DEFAULT_START_DATE, to: to ?? DEFAULT_END_DATE });
                  setTimeRangeStart(from, 'replaceIn');
                  setTimeRangeEnd(to, 'replaceIn');
                }}
                start={currentDateRange.from}
                end={currentDateRange.to}
                recentlyUsedRanges={recentDateRanges.map(m => ({ start: m.from, end: m.to }))}
                isLoading={false}
                showUpdateButton={false}
                commonlyUsedRanges={commonlyUsedRanges}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />
          <EuiText>
            <p>A trade report summarises all of a player&apos;s trade activity over a given time period.</p>
          </EuiText>
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <EuiSpacer />
          <EuiFlexGroup gutterSize="xl">
            <EuiFlexItem grow={3}>
              <EuiFieldText
                fullWidth
                icon={'search'}
                placeholder="Enter a station ID or OID"
                value={stationId ?? ''}
                onChange={e => setStationId(e.target.value || undefined, 'replaceIn')}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />
          <TradeActivityResults stationId={stationId} dateRange={currentDateRange} />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
