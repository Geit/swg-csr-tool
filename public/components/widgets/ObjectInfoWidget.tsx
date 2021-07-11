import React from 'react';
import {
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiLoadingContent,
  EuiPanel,
  EuiCallOut,
  EuiSpacer,
} from '@elastic/eui';
import { gql } from '@apollo/client';

import DeletedItemBadge from '../DeletedItemBadge';
import ObjectLink from '../ObjectLink';

import { useGetObjectDetailsQuery } from './ObjectInfoWidget.queries';

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
    }
  }
`;

/**
 *
 */
const InfoDescription: React.FC<{ children?: any | null; isLoading: boolean; fallbackText?: string }> = ({
  children,
  isLoading,
  fallbackText = 'Not Set',
}) => {
  if (!children) {
    if (isLoading) return <EuiLoadingContent lines={1} />;

    return fallbackText;
  }

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
      description: <InfoDescription isLoading={loading}>{data?.object?.id}</InfoDescription>,
    },
    {
      title: 'Object Type',
      description: <InfoDescription isLoading={loading}>{data?.object?.__typename}</InfoDescription>,
    },
    {
      title: 'Object Name',
      description: <InfoDescription isLoading={loading}>{data?.object?.resolvedName}</InfoDescription>,
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
        <InfoDescription isLoading={loading}>
          {data?.object?.loadWithId && <ObjectLink objectId={data?.object?.loadWithId} />}
        </InfoDescription>
      ),
    },
    {
      title: 'Contained By',
      description: (
        <InfoDescription isLoading={loading}>
          <ObjectLink objectId={data?.object?.containedById} />
        </InfoDescription>
      ),
    },
    {
      title: 'Location',
      description: (
        <InfoDescription isLoading={loading}>
          {[data?.object?.location?.map(Math.round).join(' '), data?.object?.scene].filter(Boolean).join(' - ')}
        </InfoDescription>
      ),
    },
  ];

  if (data?.object?.__typename === 'WeaponObject') {
    ObjectInformation.push({
      title: 'Damage',
      description: (
        <InfoDescription isLoading={loading}>{`${data.object.minDamage} - ${data.object.maxDamage} (${Math.round(
          data.object.dps ?? 0
        )} DPS)`}</InfoDescription>
      ),
    });
  } else if (data?.object?.__typename === 'CreatureObject') {
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
      <EuiDescriptionList style={{ columns: '16rem' }} textStyle="reverse">
        {ObjectInformation.map((item, index) => {
          return (
            <div key={`container-${index}`} style={{ breakInside: 'avoid' }}>
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
