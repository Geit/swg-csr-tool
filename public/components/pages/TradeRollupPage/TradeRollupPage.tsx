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
  EuiFormRow,
  EuiFieldText,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { useQueryParam, StringParam, withDefault } from 'use-query-params';

import AppSidebar from '../../AppSidebar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { useKibanaDateRange } from '../../../hooks/useKibanaDateRange';
import commonlyUsedRanges from '../../../utils/commonlyUsedRanges';
import { TradeRollupQuery } from '../../TradeRollup';

const DEFAULT_START_DATE = 'now-1M';
const DEFAULT_END_DATE = 'now';

export const TradeRollupPage: React.FC = () => {
  const documentTitle = `Trade Rollup`;
  useDocumentTitle(documentTitle);
  useRecentlyAccessed(`/app/swgCsrTool/trade-rollup`, documentTitle, `trade-rollup`, true);
  useBreadcrumbs([
    {
      text: 'Trades',
      href: '/trades',
    },
    {
      text: 'Trade Rollups',
      href: '/trade-rollup',
    },
  ]);
  const [partyA, setPartyA] = useQueryParam('party_a', StringParam);
  const [partyB, setPartyB] = useQueryParam('party_b', StringParam);
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
                <h1>Trade Rollup</h1>
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
            <p>
              A rollup displays a summary of a pair of player&apos;s trading activity with one another over a period of
              time. It is useful for analysing potential foul-play (e.g. Credit Selling) as any trade-backs are
              eliminated from the summary.
            </p>
          </EuiText>
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <EuiSpacer />
          <EuiFlexGroup gutterSize="xl">
            <EuiFlexItem grow={3}>
              <EuiFormRow label="Party A" id={'party-a'} fullWidth>
                <EuiFieldText
                  fullWidth
                  icon={'search'}
                  placeholder="Enter a station ID or OID"
                  value={partyA ?? ''}
                  onChange={e => setPartyA(e.target.value || undefined, 'replaceIn')}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={3}>
              <EuiFormRow label="Party B" id={'party-b'} fullWidth>
                <EuiFieldText
                  fullWidth
                  icon={'search'}
                  placeholder="Enter a station ID or OID"
                  value={partyB ?? ''}
                  onChange={e => setPartyB(e.target.value || undefined, 'replaceIn')}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />
          {partyA && partyB ? (
            <TradeRollupQuery partyAId={partyA} partyBId={partyB} fromDate={timeRangeStart} toDate={timeRangeEnd} />
          ) : (
            <EuiEmptyPrompt iconType="users" title={<h3>Enter account IDs to start a rollup</h3>} titleSize="s" />
          )}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
