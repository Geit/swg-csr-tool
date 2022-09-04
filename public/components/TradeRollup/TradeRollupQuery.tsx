import React from 'react';
import { gql } from '@apollo/client';
import { EuiEmptyPrompt, EuiLoadingContent } from '@elastic/eui';

import { useGetTransactionRollupQuery } from './TradeRollupQuery.queries';

import { TradeRollup } from '.';

interface TradeRollupProps {
  partyAId: string;
  partyBId: string;
  fromDate: string;
  toDate: string;
}

export const GET_TRANSACTION_ROLLUP = gql`
  query getTransactionRollup($partyA: String, $partyB: String, $from: String, $until: String) {
    transactionRollup(partyA: $partyA, partyB: $partyB, from: $from, until: $until) {
      totalValue
      totalItems
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
        creditsReceived
        itemsReceived {
          oid
          basicName
          name
          count
          wasOriginalOwner
        }
      }
    }
  }
`;

export const TradeRollupQuery: React.FC<TradeRollupProps> = props => {
  const { loading, data, error } = useGetTransactionRollupQuery({
    variables: {
      partyA: props.partyAId,
      partyB: props.partyBId,
      until: props.toDate,
      from: props.fromDate,
    },
  });

  if (loading || !data?.transactionRollup) return <EuiLoadingContent lines={10} />;

  if (error) return <div>Error while querying</div>;

  if (!data || (data.transactionRollup.totalItems === 0 && data.transactionRollup.totalValue === 0))
    return <EuiEmptyPrompt iconType="search" title={<h3>No Trades Found</h3>} titleSize="s" />;

  return <TradeRollup parties={data.transactionRollup.parties} />;
};
