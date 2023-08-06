import React from 'react';
import {
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiPanel,
  EuiCallOut,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';

import DeletedItemBadge from '../DeletedItemBadge';
import ObjectLink from '../ObjectLink';
import ConditionListing from '../ConditionListing';
import SimpleValue from '../SimpleValue';
import ShipPartPercentiles from '../ShipPartPercentiles';
import UGCName from '../UGCName';

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
      sceneName

      template
      templateId

      container {
        id
        resolvedName
      }

      loadsWith {
        id
        resolvedName
      }

      ... on ITangibleObject {
        condition
        count
        owner {
          __typename
          id
          resolvedName
        }
        creator {
          id
          resolvedName
        }
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

      ... on WeaponObject {
        minDamage
        maxDamage
        elementalValue
        attackSpeed
        dps
      }

      ... on BuildingObject {
        bankBalance
        cashBalance
      }

      ... on CreatureObject {
        worldspaceLocation
        bankBalance
        cashBalance
      }

      ... on PlayerCreatureObject {
        bankBalance
        cashBalance
        account {
          id
          accountName
        }
        guild {
          id
          name
          abbreviation
        }
        city {
          id
          name
        }
      }
    }
  }
`;

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

  const location =
    data?.object && 'worldspaceLocation' in data.object && data.object.worldspaceLocation
      ? data.object.worldspaceLocation
      : data?.object?.location;

  const ObjectInformation = [
    {
      title: 'Object ID',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {data?.object?.id}
        </SimpleValue>
      ),
    },
    {
      title: 'Object Type',
      description: <SimpleValue isLoading={loading}>{data?.object?.__typename}</SimpleValue>,
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
        <SimpleValue isLoading={loading}>
          {data?.object?.loadWithId && data.object.id !== data.object.loadWithId ? (
            <ObjectLink
              key={`loadWith-${data?.object.id}`}
              objectId={data?.object?.loadWithId}
              textToDisplay={<UGCName rawName={data?.object?.loadsWith?.resolvedName} />}
            />
          ) : null}
        </SimpleValue>
      ),
    },
    {
      title: 'Contained By',
      description: (
        <SimpleValue isLoading={loading}>
          <ObjectLink
            key={`containedBy-${data?.object?.id ?? 'unknown'}`}
            objectId={data?.object?.containedById}
            textToDisplay={<UGCName rawName={data?.object?.container?.resolvedName} />}
          />
        </SimpleValue>
      ),
    },
    {
      title: 'Location',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {[location?.map(Math.round).join(' ')].filter(Boolean).join(' - ')}
          <EuiText color="subdued" size="xs">
            {data?.object?.sceneName ?? data?.object?.scene ?? 'Unknown Scene'}
          </EuiText>
        </SimpleValue>
      ),
    },
    {
      title: 'Template',
      description: (
        <SimpleValue isLoading={loading}>
          <abbr title={data?.object?.template || data?.object?.templateId?.toString() || ''}>
            {data?.object?.template?.split('/')?.at(-1) || data?.object?.templateId}
          </abbr>
        </SimpleValue>
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
        <SimpleValue isLoading={loading}>
          <ConditionListing conditionBits={data.object.condition} />
        </SimpleValue>
      ),
    });
  }

  if (data?.object && 'shipPartSummary' in data.object && data.object.shipPartSummary) {
    ObjectInformation.push({
      title: 'Ship Part Percentile',
      description: (
        <SimpleValue isLoading={loading} numeric>
          <ShipPartPercentiles {...data.object.shipPartSummary} />
        </SimpleValue>
      ),
    });
  }

  if (data?.object && 'count' in data.object && data?.object?.__typename !== 'PlayerCreatureObject') {
    ObjectInformation.push({
      title: 'Count',
      description: <SimpleValue isLoading={loading}>{data.object.count}</SimpleValue>,
    });
  }

  if (data?.object && 'owner' in data.object && data.object.owner) {
    ObjectInformation.push({
      title: 'Owner',
      description: (
        <SimpleValue isLoading={loading}>
          <ObjectLink
            key={`ownerId-${data.object.owner.id}`}
            objectId={data.object.owner.id}
            textToDisplay={data.object.owner.resolvedName}
          />
        </SimpleValue>
      ),
    });
  }

  if (data?.object && 'creator' in data.object && data.object.creator) {
    ObjectInformation.push({
      title: 'Creator',
      description: (
        <SimpleValue isLoading={loading}>
          <ObjectLink
            key={`ownerId-${data.object.creator.id}`}
            objectId={data.object.creator.id}
            textToDisplay={data.object.creator.resolvedName}
          />
        </SimpleValue>
      ),
    });
  }

  if (data?.object?.__typename === 'WeaponObject') {
    ObjectInformation.push({
      title: 'Damage',
      description: (
        <SimpleValue isLoading={loading}>{`${data.object.minDamage} - ${data.object.maxDamage} (${Math.round(
          data.object.dps ?? 0
        )} DPS)`}</SimpleValue>
      ),
    });
  }

  if (data?.object && 'cashBalance' in data.object && 'bankBalance' in data.object) {
    ObjectInformation.push(
      {
        title: 'Cash',
        description: (
          <SimpleValue isLoading={loading}>
            {data.object.cashBalance != null && `${data.object.cashBalance?.toLocaleString()} Credits`}
          </SimpleValue>
        ),
      },
      {
        title: 'Bank',
        description: (
          <SimpleValue isLoading={loading}>
            {data.object.bankBalance != null && `${data.object.bankBalance.toLocaleString()} Credits`}
          </SimpleValue>
        ),
      }
    );
  }

  if (data?.object?.__typename === 'PlayerCreatureObject') {
    if (data.object.account)
      ObjectInformation.push({
        title: 'Account',
        description: (
          <SimpleValue isLoading={loading}>
            <Link to={`/account/${data.object.account.id}`}>
              {data.object.account.accountName ?? data.object.account.id}
            </Link>
          </SimpleValue>
        ),
      });

    if (data.object.guild)
      ObjectInformation.push({
        title: 'Guild',
        description: (
          <SimpleValue isLoading={loading}>
            <Link to={`/coalitions/guilds/${data.object.guild.id}`}>{data.object.guild.abbreviation}</Link>
          </SimpleValue>
        ),
      });

    if (data.object.city)
      ObjectInformation.push({
        title: 'City',
        description: (
          <SimpleValue isLoading={loading}>
            <Link to={`/coalitions/cities/${data.object.city.id}`}>{data.object.city.name}</Link>
          </SimpleValue>
        ),
      });
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
