import React from 'react';
import {
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiLoadingContent,
  EuiPanel,
  EuiCallOut,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { gql } from '@apollo/client';

import DeletedItemBadge from '../DeletedItemBadge';
import ObjectLink from '../ObjectLink';
import ConditionListing from '../ConditionListing';

import { useGetObjectDetailsQuery } from './BasicObjectKeyValues.queries';

interface ObjectInfoWidgetProps {
  objectId: string;
}

export const GET_OBJECT_DETAILS = gql`
  query getObjectDetails($objectId: String!) {
    object(objectId: $objectId) {
      __typename
      id
      resolvedName
      deletionReason
      deletionDate
      loadWithId
      containedById
      location
      scene

      ... on ITangibleObject {
        ownerId
        condition
        count
      }

      ... on WeaponObject {
        minDamage
        maxDamage
        elementalValue
        attackSpeed
        dps
      }

      ... on CreatureObject {
        bankBalance
        cashBalance
      }

      ... on PlayerCreatureObject {
        bankBalance
        cashBalance
      }
    }
  }
`;

interface InfoDescriptionProps {
  children?: any | null;
  isLoading: boolean;
  fallbackText?: string;
  numeric?: boolean;
}

/**
 *
 */
const InfoDescription: React.FC<InfoDescriptionProps> = ({
  children,
  isLoading,
  fallbackText = 'Not Set',
  numeric,
}) => {
  if (!children) {
    if (isLoading) return <EuiLoadingContent lines={1} />;

    return fallbackText;
  }

  if (numeric) return <code>{children}</code>;

  return children;
};

/**
 * Displays high level information about an Object, such as its
 * name and containment. Also displays additional information for
 * some object types.
 */
const ObjectInfoWidget: React.FC<ObjectInfoWidgetProps> = ({ objectId }) => {
  const { data, loading, error } = useGetObjectDetailsQuery({
    variables: {
      objectId,
    },
    returnPartialData: true,
  });

  if (error)
    return (
      <>
        <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
          <p>There was an error while querying. The results displayed may be incorrect.</p>
        </EuiCallOut>
        <EuiSpacer />
      </>
    );

  const ObjectInformation = [
    {
      title: 'Object ID',
      description: (
        <InfoDescription isLoading={loading} numeric>
          {data?.object?.id}
        </InfoDescription>
      ),
    },
    {
      title: 'Object Type',
      description: <InfoDescription isLoading={loading}>{data?.object?.__typename}</InfoDescription>,
    },
    {
      title: 'Deletion Status',
      description: (
        <DeletedItemBadge
          deletionDate={data?.object?.deletionDate ?? null}
          deletionReason={data?.object?.deletionReason ?? null}
        />
      ),
    },
    {
      title: 'Loads With',
      description: (
        <InfoDescription isLoading={loading} numeric>
          {data?.object?.loadWithId && data.object.id !== data.object.loadWithId && (
            <ObjectLink key={`loadWith-${data?.object.id}`} objectId={data?.object?.loadWithId} />
          )}
        </InfoDescription>
      ),
    },
    {
      title: 'Contained By',
      description: (
        <InfoDescription isLoading={loading} numeric>
          <ObjectLink key={`containedBy-${data?.object?.id ?? 'unknown'}`} objectId={data?.object?.containedById} />
        </InfoDescription>
      ),
    },
    {
      title: 'Location',
      description: (
        <InfoDescription isLoading={loading} numeric>
          {[data?.object?.location?.map(Math.round).join(' ')].filter(Boolean).join(' - ')}
          <EuiText color="subdued" size="xs">
            {data?.object?.scene ?? 'Unknown Scene'}
          </EuiText>
        </InfoDescription>
      ),
    },
  ];

  /**
   * TODO: Could probably do with a nicer component for condition bits, and perhaps bitfields in general.
   * This is useful for a developer to avoid a database session, but still requires using the bitfield definition
   * from dsrc as a reference to decode.
   */
  if (data?.object && 'condition' in data.object && data.object.condition) {
    ObjectInformation.push({
      title: 'Conditions',
      description: (
        <InfoDescription isLoading={loading}>
          <ConditionListing conditionBits={data.object.condition} />
        </InfoDescription>
      ),
    });
  }

  if (data?.object && 'count' in data.object) {
    ObjectInformation.push({
      title: 'Count',
      description: <InfoDescription isLoading={loading}>{data.object.count}</InfoDescription>,
    });
  }

  if (data?.object && 'ownerId' in data.object) {
    ObjectInformation.push({
      title: 'Owner',
      description: (
        <InfoDescription isLoading={loading} numeric>
          <ObjectLink key={`ownerId-${data.object.ownerId}`} objectId={data.object.ownerId} />
        </InfoDescription>
      ),
    });
  }

  if (data?.object?.__typename === 'WeaponObject') {
    ObjectInformation.push({
      title: 'Damage',
      description: (
        <InfoDescription isLoading={loading}>{`${data.object.minDamage} - ${data.object.maxDamage} (${Math.round(
          data.object.dps ?? 0
        )} DPS)`}</InfoDescription>
      ),
    });
  } else if (data?.object?.__typename === 'PlayerCreatureObject' || data?.object?.__typename === 'CreatureObject') {
    ObjectInformation.push(
      {
        title: 'Cash',
        description: (
          <InfoDescription isLoading={loading}>
            {data.object.cashBalance != null && `${data.object.cashBalance?.toLocaleString()} Credits`}
          </InfoDescription>
        ),
      },
      {
        title: 'Bank',
        description: (
          <InfoDescription isLoading={loading}>
            {data.object.bankBalance != null && `${data.object.bankBalance.toLocaleString()} Credits`}
          </InfoDescription>
        ),
      }
    );
  }

  return (
    <EuiPanel color="subdued" hasBorder>
      <EuiDescriptionList className="objectInformationList" textStyle="reverse">
        {ObjectInformation.map((item, index) => {
          return (
            <div key={`container-${index}`}>
              <EuiDescriptionListTitle key={`title-${index}`}>{item.title}</EuiDescriptionListTitle>
              <EuiDescriptionListDescription key={`description-${index}`}>
                {item.description}
              </EuiDescriptionListDescription>
            </div>
          );
        })}
      </EuiDescriptionList>
    </EuiPanel>
  );
};

export default ObjectInfoWidget;
