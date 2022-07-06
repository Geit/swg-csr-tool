import React from 'react';
import {
  EuiListGroup,
  EuiListGroupItem,
  EuiTable,
  EuiTableBody,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableRow,
  EuiTableRowCell,
  EuiText,
} from '@elastic/eui';

import ObjectLink from '../../ObjectLink';

import { SearchForTransactionsQuery } from './Trades.queries';
import TransactionItem from './TransactionItem';
import TransactionActions from './TransactionActions';

type Transactions = NonNullable<SearchForTransactionsQuery['transactions']>['results'];
type TransactionParty = Transactions[number]['parties'][number];

const PartyItemSummary: React.FC<{ party: TransactionParty }> = ({ party }) => {
  if (!party.itemsReceived.length && party.creditsReceived === 0)
    return (
      <>
        <EuiText style={{ marginBottom: '8px' }}>
          <ObjectLink objectId={party.oid} textToDisplay={party.name} /> received
        </EuiText>
        <EuiText textAlign="left" size="m" color="subdued">
          Nothing
        </EuiText>
      </>
    );

  return (
    <>
      <EuiText style={{ marginBottom: '8px' }}>
        <ObjectLink objectId={party.oid} textToDisplay={party.name} /> received
      </EuiText>
      <EuiListGroup flush={true} maxWidth={false} bordered={false}>
        {party.itemsReceived.map(item => (
          <EuiListGroupItem key={item.oid} label={<TransactionItem {...item} />} />
        ))}
        {party.creditsReceived > 0 && <EuiListGroupItem label={`${party.creditsReceived.toLocaleString()} Credits`} />}
      </EuiListGroup>
    </>
  );
};

const TransactionTable: React.FC<{
  transactions: Transactions | null;
  showSameAccountTransactions: boolean;
}> = ({ transactions, showSameAccountTransactions }) => {
  return (
    <EuiTable tableLayout="fixed">
      <EuiTableHeader>
        <EuiTableHeaderCell width="7ex">Date</EuiTableHeaderCell>
        <EuiTableHeaderCell width="7ex">Type</EuiTableHeaderCell>
        {/* <EuiTableHeaderCell width="7ex">Value</EuiTableHeaderCell>
        <EuiTableHeaderCell width="5ex">Items</EuiTableHeaderCell> */}
        {showSameAccountTransactions && (
          <EuiTableHeaderCell width="5ex">
            <abbr title="Same Account">Same Acc.</abbr>
          </EuiTableHeaderCell>
        )}
        <EuiTableHeaderCell width="20ex">Party A</EuiTableHeaderCell>
        <EuiTableHeaderCell width="20ex">Party B</EuiTableHeaderCell>
        <EuiTableHeaderCell width="2ex" title="Actions" />
      </EuiTableHeader>

      <EuiTableBody>
        {transactions?.map(trx => (
          <EuiTableRow key={trx.id}>
            <EuiTableRowCell>
              {new Date(trx.date).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </EuiTableRowCell>
            <EuiTableRowCell>{trx.type}</EuiTableRowCell>
            {/* <EuiTableRowCell>{trx.transactionValue.toLocaleString()}</EuiTableRowCell>
            <EuiTableRowCell>{trx.itemCount}</EuiTableRowCell> */}
            {showSameAccountTransactions && (
              <EuiTableRowCell>{trx.parties[0].stationId === trx.parties[1].stationId ? '✅' : '❌'}</EuiTableRowCell>
            )}
            <EuiTableRowCell>
              <PartyItemSummary party={trx.parties[0]} />
            </EuiTableRowCell>
            <EuiTableRowCell>
              <PartyItemSummary party={trx.parties[1]} />
            </EuiTableRowCell>
            <EuiTableRowCell>
              <TransactionActions id={trx.id} partyA={trx.parties[0]} partyB={trx.parties[1]} />
            </EuiTableRowCell>
          </EuiTableRow>
        ))}
      </EuiTableBody>
    </EuiTable>
  );
};

export default TransactionTable;
