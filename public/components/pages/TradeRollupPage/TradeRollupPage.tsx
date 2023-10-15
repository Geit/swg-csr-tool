import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSuperDatePicker,
  EuiText,
  EuiFormRow,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { useQueryParam, StringParam } from 'use-query-params';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { useKibanaDateRange } from '../../../hooks/useKibanaDateRange';
import commonlyUsedRanges from '../../../utils/commonlyUsedRanges';
import { TradeRollupQuery } from '../../TradeRollup';
import { FullWidthPage } from '../layouts/FullWidthPage';
import { ObjectSearchAutoComplete } from '../../ObjectSearchAutoComplete';

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
      text: 'Trade Rollup',
      href: '/trade-rollup',
    },
  ]);
  const [partyA, setPartyA] = useQueryParam('party_a', StringParam);
  const [partyB, setPartyB] = useQueryParam('party_b', StringParam);
  const { setDateRange, currentDateRange, recentDateRanges } = useKibanaDateRange();

  const titleAsides = (
    <div style={{ minWidth: '200px' }}>
      <EuiSuperDatePicker
        width="full"
        onTimeChange={evt => {
          const from = evt.start;
          const to = evt.end;

          setDateRange({ from, to });
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

  const [partyAType, partyAId] = partyA?.split('_') ?? [];
  const [partyBType, partyBId] = partyB?.split('_') ?? [];

  return (
    <FullWidthPage title="Trade Rollup" titleAsides={titleAsides}>
      <EuiText>
        <p>
          A rollup displays a summary of a pair of player&apos;s trading activity with one another over a period of
          time. It is useful for analysing potential foul-play (e.g. Credit Selling) as any trade-backs are eliminated
          from the summary.
        </p>
      </EuiText>
      <EuiSpacer />
      <EuiFlexGroup gutterSize="xl">
        <EuiFlexItem grow={1}>
          <EuiFormRow label="Party A" id={'party-a'} fullWidth>
            <ObjectSearchAutoComplete
              initialSearchItem={partyA ? { itemType: partyAType as any, itemId: partyAId } : undefined}
              onItemSelected={({ itemType, itemId }) => setPartyA(`${itemType}_${itemId}`)}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={1}>
          <EuiFormRow label="Party B" id={'party-b'} fullWidth>
            <ObjectSearchAutoComplete
              initialSearchItem={partyB ? { itemType: partyBType as any, itemId: partyBId } : undefined}
              onItemSelected={({ itemType, itemId }) => setPartyB(`${itemType}_${itemId}`)}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      {partyAId && partyBId ? (
        <TradeRollupQuery
          partyAId={partyAId}
          partyBId={partyBId}
          fromDate={currentDateRange.from}
          toDate={currentDateRange.to}
        />
      ) : (
        <EuiEmptyPrompt iconType="users" title={<h3>Enter account IDs to start a rollup</h3>} titleSize="s" />
      )}
    </FullWidthPage>
  );
};
