import React, { useState } from 'react';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiToolTip,
  htmlIdGenerator,
} from '@elastic/eui';
import { Link } from 'react-router-dom';

import ObjectLink from '../ObjectLink';
import TransactionItem from '../pages/Trades/TransactionItem';

import TransactionRollupActions from './TradeRollupActions';

interface TradeRollupParty {
  identifier: string;
  creditsReceived: number;
  itemsReceived: {
    oid: string;
    name: string;
    count: number;
    wasOriginalOwner: boolean;
  }[];
  entity?:
    | { __typename: 'Account'; id: string; accountName?: string | null | undefined }
    | { __typename: 'PlayerCreatureObject'; id: string; resolvedName: string }
    | null;
}

interface TradeRollupProps {
  parties: TradeRollupParty[];
}

const TradeRollupPartyComponent: React.FC<{ party: TradeRollupParty }> = ({ party }) => {
  const [accordionId] = useState(htmlIdGenerator()());
  let title = <span>{party.identifier}</span>;

  if (party.entity?.__typename === 'Account')
    title = <Link to={`/account/${party.entity.id}`}>{party.entity.accountName ?? party.entity.id}</Link>;
  else if (party.entity?.__typename === 'PlayerCreatureObject')
    title = <ObjectLink objectId={party.identifier} textToDisplay={party.entity.resolvedName} />;

  const itemsReceived = party.itemsReceived.filter(ir => !ir.wasOriginalOwner);
  const itemsReturned = party.itemsReceived.filter(ir => ir.wasOriginalOwner);

  return (
    <EuiFlexItem key={party.identifier} grow={1}>
      <EuiPanel color="subdued" hasBorder borderRadius="none">
        <EuiText textAlign="center">
          <h3 style={{ marginBottom: 0 }}>{title}</h3>
        </EuiText>
        <EuiText textAlign="center" size="xs" color="subdued">
          Received
        </EuiText>
        {itemsReceived.length || party.creditsReceived > 0 ? (
          <ul style={{ listStyle: 'none' }}>
            {party.creditsReceived > 0 && <li>{party.creditsReceived.toLocaleString()} Credits</li>}

            {itemsReceived.map(item => (
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
          </>
        )}
        {itemsReturned.length > 0 && (
          <EuiAccordion
            id={accordionId}
            buttonContent={
              <EuiToolTip content="These items were traded between the two parties, but ended up being returned to this player">
                <span>Returned items</span>
              </EuiToolTip>
            }
          >
            <ul style={{ listStyle: 'none' }}>
              {itemsReturned.map(item => (
                <li key={item.oid}>
                  <TransactionItem {...item} />
                </li>
              ))}
            </ul>
          </EuiAccordion>
        )}
      </EuiPanel>
    </EuiFlexItem>
  );
};

export const TradeRollup: React.FC<TradeRollupProps> = ({ parties }) => {
  return (
    <EuiPanel color="transparent" hasBorder style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', right: '8px', top: '8px' }}>
        <TransactionRollupActions
          id={`rollup-${parties[0].identifier}-${parties[1].identifier}`}
          partyA={parties[0]}
          partyB={parties[1]}
        />
      </div>
      <EuiFlexGroup>
        {parties.map(party => (
          <TradeRollupPartyComponent party={party} key={party.identifier} />
        ))}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
