import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiListGroup, EuiListGroupItem, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { Link } from 'react-router-dom';

import ObjectLink from '../ObjectLink';
import TransactionItem from '../pages/Trades/TransactionItem';

interface TradeRollupParty {
  identifier: string;
  creditsReceived: number;
  itemsReceived: {
    oid: string;
    name: string;
    count: number;
  }[];
  entity?:
    | { __typename: 'Account'; id: string; accountName?: string | null | undefined }
    | { __typename: 'PlayerCreatureObject'; id: string; resolvedName: string }
    | null;
}

interface TradeRollupProps {
  parties: TradeRollupParty[];
}

export const TradeRollup: React.FC<TradeRollupProps> = ({ parties }) => {
  return (
    <EuiPanel color="transparent" hasBorder>
      <EuiFlexGroup>
        {parties.map(party => (
          <EuiFlexItem key={party.identifier}>
            <EuiPanel color="subdued" hasBorder borderRadius="none">
              <EuiText textAlign="center">
                <h3 style={{ marginBottom: 0 }}>
                  {party.entity?.__typename === 'Account' && (
                    <Link to={`/account/${party.entity.id}`}>{party.entity.accountName ?? party.entity.id}</Link>
                  )}

                  {party.entity?.__typename === 'PlayerCreatureObject' && (
                    <ObjectLink objectId={party.identifier} textToDisplay={party.entity.resolvedName} />
                  )}

                  {!party.entity && party.identifier}
                </h3>
              </EuiText>
              <EuiText textAlign="center" size="xs" color="subdued">
                Received
              </EuiText>
              {party.itemsReceived.length || party.creditsReceived > 0 ? (
                <EuiListGroup flush={true} maxWidth={false} bordered={false}>
                  {party.creditsReceived > 0 && (
                    <EuiListGroupItem label={`${party.creditsReceived.toLocaleString()} Credits`} />
                  )}
                  {party.itemsReceived.map(item => (
                    <EuiListGroupItem key={item.oid} label={<TransactionItem {...item} />} />
                  ))}
                </EuiListGroup>
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
  );
};
