import React from 'react';
import {
  EuiPopoverTitle,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiText,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';

import DeletedItemBadge from '../DeletedItemBadge';
import UGCName from '../UGCName';
import SimpleValue from '../SimpleValue';
import ShipPartPercentiles from '../ShipPartPercentiles';

import { useGetObjectDetailsTooltipQuery } from './ObjectLinkPopoverContents.queries';

export const GET_OBJECT_DETAILS = gql`
  query getObjectDetailsTooltip($objectId: String!) {
    object(objectId: $objectId) {
      __typename
      id
      resolvedName
      deletionReason
      deletionDate

      ... on PlayerCreatureObject {
        account {
          id
          accountName
          characters {
            id
            resolvedName
          }
        }
      }
      ... on ITangibleObject {
        shipPartSummary {
          headlinePercentile
          isReverseEngineered
          reverseEngineeringLevel
          stats {
            name
            value
            percentile
            stajTier {
              name
              color
            }
          }
        }
      }
    }
  }
`;

interface ObjectLinkPopoverDetailsProps {
  objectId: string;
}

const ObjectLinkPopoverDetails: React.FC<ObjectLinkPopoverDetailsProps> = ({ objectId }) => {
  const { data, loading } = useGetObjectDetailsTooltipQuery({
    variables: {
      objectId,
    },
  });

  if (loading || !data) {
    return (
      <>
        <EuiPopoverTitle>Object Details</EuiPopoverTitle>
        <EuiText>
          <p>Loading...</p>
        </EuiText>
      </>
    );
  }

  if (!data?.object) {
    return (
      <>
        <EuiPopoverTitle>Object Details</EuiPopoverTitle>
        <EuiText>
          <p>Object not found</p>
        </EuiText>
      </>
    );
  }

  return (
    <>
      <EuiPopoverTitle>
        {data.object.resolvedName ? <UGCName rawName={data.object.resolvedName} /> : 'Object Details'}
      </EuiPopoverTitle>
      <EuiDescriptionList compressed>
        <div>
          <EuiDescriptionListTitle>Object ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{data?.object?.id}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Object Type</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{data?.object?.__typename ?? 'Unknown'}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Deletion Status</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <DeletedItemBadge
              deletionDate={data.object.deletionDate ?? null}
              deletionReason={data.object.deletionReason ?? null}
            />
          </EuiDescriptionListDescription>
        </div>
        {'account' in data.object && data.object.account && (
          <div>
            <EuiDescriptionListTitle>Account</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              <Link to={`/account/${data.object.account.id}`}>
                {data.object.account.accountName ?? data.object.account.id}
              </Link>
            </EuiDescriptionListDescription>
          </div>
        )}
        {'account' in data.object && data.object.account && 'characters' in data.object.account && (
          <div>
            <EuiDescriptionListTitle>Alt Characters</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {data.object.account.characters?.map(c => c.resolvedName).join(', ')}
            </EuiDescriptionListDescription>
          </div>
        )}
        {'shipPartSummary' in data.object && data.object.shipPartSummary && (
          <div>
            <EuiDescriptionListTitle>Ship Part Percentile</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              <SimpleValue isLoading={loading} numeric>
                <ShipPartPercentiles {...data.object.shipPartSummary} />
              </SimpleValue>
            </EuiDescriptionListDescription>
          </div>
        )}
      </EuiDescriptionList>
    </>
  );
};

export default ObjectLinkPopoverDetails;
