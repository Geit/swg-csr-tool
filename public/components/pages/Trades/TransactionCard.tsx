import React from 'react';
import {
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';

import ObjectLink from '../../ObjectLink';

import { SearchForTransactionsQuery } from './Trades.queries';
import TransactionItem from './TransactionItem';
import TransactionActions from './TransactionActions';

type Transaction = NonNullable<SearchForTransactionsQuery['transactions']>['results'][number];

const TransactionCard: React.FC<{
  transaction: Transaction;
}> = ({ transaction }) => {
  return (
    <>
      <EuiPanel color="transparent" hasBorder>
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiDescriptionList className="objectInformationList" textStyle="reverse">
              <div>
                <EuiDescriptionListTitle>Type</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>{transaction.type}</EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Date</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {new Date(transaction.date).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Same Account</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {transaction.arePartiesSameAccount ? 'Yes' : 'No'}
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Value</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {transaction.transactionValue.toLocaleString()} Credits, {transaction.itemCount} Items
                </EuiDescriptionListDescription>
              </div>
            </EuiDescriptionList>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <TransactionActions id={transaction.id} partyA={transaction.parties[0]} partyB={transaction.parties[1]} />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiHorizontalRule margin="m" />
        <EuiFlexGroup>
          {transaction.parties.map(party => (
            <EuiFlexItem key={party.oid}>
              <EuiPanel color="subdued" hasBorder borderRadius="none">
                <EuiText textAlign="center">
                  <h3 style={{ marginBottom: 0 }}>
                    <ObjectLink objectId={party.oid} textToDisplay={party.name} />
                  </h3>
                </EuiText>
                <EuiText textAlign="center" size="xs" color="subdued">
                  Received
                </EuiText>
                {party.itemsReceived.length || party.creditsReceived > 0 ? (
                  <ul style={{ listStyle: 'none' }}>
                    {party.creditsReceived > 0 && <li>{party.creditsReceived.toLocaleString()} Credits</li>}
                    {party.itemsReceived.map(item => (
                      <li key={item.oid}>
                        <TransactionItem {...item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <EuiSpacer />
                    <EuiText textAlign="center" size="m" color="subdued">
                      Nothing
                    </EuiText>
                    <EuiSpacer />
                  </>
                )}
              </EuiPanel>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiPanel>

      <EuiSpacer />
    </>
  );
};

export default TransactionCard;
