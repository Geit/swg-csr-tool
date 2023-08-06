import React from 'react';
import { ApolloError, gql } from '@apollo/client';
import {
  EuiCallOut,
  EuiEmptyPrompt,
  EuiSkeletonText,
  EuiTable,
  EuiTableBody,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableRow,
  EuiTableRowCell,
  EuiText,
} from '@elastic/eui';

import { BUILDING_TAG, HARVESTER_TAG, INSTALLATION_TAG, MANF_INSTALLATION_TAG } from '../../utils/tagify';
import ObjectLink from '../ObjectLink';
import DeletedItemBadge from '../DeletedItemBadge';
import UGCName from '../UGCName';

import { useGetStructuresForAccountQuery, useGetStructuresForCharacterQuery } from './StructuresTable.queries';

const STRUCTURE_TYPE_IDS = [BUILDING_TAG, HARVESTER_TAG, INSTALLATION_TAG, MANF_INSTALLATION_TAG];

export const GET_STRUCTURE_FOR_CHARACTER = gql`
  query getStructuresForCharacter($objectId: String!, $structureObjectTypes: [Int!]!) {
    object(objectId: $objectId) {
      id
      ... on PlayerCreatureObject {
        structures: ownedObjects(objectTypes: $structureObjectTypes) {
          id
          resolvedName
          basicName: resolvedName(resolveCustomNames: false)
          location
          scene
          deletionDate
          deletionReason
          containedById
        }
      }
    }
  }
`;

export const GET_STRUCTURES_FOR_ACCOUNT = gql`
  query getStructuresForAccount($stationId: String!, $structureObjectTypes: [Int!]!) {
    account(stationId: $stationId) {
      id
      structures: ownedObjects(objectTypes: $structureObjectTypes) {
        id
        resolvedName
        basicName: resolvedName(resolveCustomNames: false)
        location
        sceneName
        deletionDate
        deletionReason
        containedById

        ... on ITangibleObject {
          owner {
            id
            resolvedName
          }
        }
      }
    }
  }
`;

interface Structure {
  __typename?: string;
  id: string;
  resolvedName: string;
  location?: number[] | null | undefined;
  sceneName?: string | null | undefined;
  deletionDate?: string | null | undefined;
  deletionReason?: number | null | undefined;
  containedById?: string | null | undefined;
  basicName: string;
  owner?: {
    id: string;
    resolvedName: string;
  } | null;
}

const StructureTableRow: React.FC<Structure & { enableOwnerDisplay: boolean }> = ({
  __typename,
  id,
  resolvedName,
  location,
  sceneName,
  deletionDate,
  deletionReason,
  containedById,
  basicName,
  owner,
  enableOwnerDisplay,
}) => {
  return (
    <EuiTableRow key={`item-${id}`}>
      <EuiTableRowCell>
        <ObjectLink disablePopup objectId={id} />
      </EuiTableRowCell>
      <EuiTableRowCell>
        <UGCName rawName={resolvedName} /> <br />
        <EuiText color="subdued" size="xs">
          {basicName}
        </EuiText>
      </EuiTableRowCell>
      <EuiTableRowCell>
        {containedById !== '0' ? (
          <>
            <EuiText color="subdued" size="xs">
              Packed in: <br />
            </EuiText>
            <ObjectLink objectId={containedById} />
          </>
        ) : (
          <>
            {[location?.map(Math.round).join(' ')].filter(Boolean).join(' - ')} <br />
            <EuiText color="subdued" size="xs">
              {sceneName ?? 'Unknown Scene'}
            </EuiText>
          </>
        )}
      </EuiTableRowCell>

      {enableOwnerDisplay && (
        <EuiTableRowCell>
          {owner ? <ObjectLink objectId={owner.id} textToDisplay={owner.resolvedName}></ObjectLink> : 'Unknown'}
        </EuiTableRowCell>
      )}

      <EuiTableRowCell>
        <DeletedItemBadge deletionDate={deletionDate ?? null} deletionReason={deletionReason ?? null} />
      </EuiTableRowCell>
    </EuiTableRow>
  );
};

const StructureTableLoadingRows: React.FC = () => (
  <>
    {Array(5)
      .fill(true)
      .map((a, idx) => {
        return (
          <EuiTableRow key={`expectedItem-${idx}`}>
            <EuiTableRowCell colSpan={5} textOnly={false}>
              <EuiSkeletonText lines={1} className="inTableLoadingIndicator" />
            </EuiTableRowCell>
          </EuiTableRow>
        );
      })}
  </>
);

const StructureTableEmpty: React.FC = () => (
  <EuiTableRow>
    <EuiTableRowCell colSpan={5} align="center">
      <EuiEmptyPrompt iconType="home" title={<h3>This player is homeless</h3>} titleSize="xs" />
    </EuiTableRowCell>
  </EuiTableRow>
);

const StructureTableContainer: React.FC<{ enableOwnerDisplay: boolean }> = ({ children, enableOwnerDisplay }) => {
  return (
    <EuiTable className="objectListingTable" tableLayout="auto">
      <EuiTableHeader>
        <EuiTableHeaderCell className="narrowDataCol">Object ID</EuiTableHeaderCell>
        <EuiTableHeaderCell>Structure Name</EuiTableHeaderCell>
        <EuiTableHeaderCell>Location</EuiTableHeaderCell>
        {enableOwnerDisplay && <EuiTableHeaderCell>Owner</EuiTableHeaderCell>}
        <EuiTableHeaderCell className="narrowDataCol">Deletion Status</EuiTableHeaderCell>
      </EuiTableHeader>

      <EuiTableBody>{children}</EuiTableBody>
    </EuiTable>
  );
};

const StructureTable: React.FC<{
  error?: ApolloError;
  loading: boolean;
  structures: Structure[];
  enableOwnerDisplay?: boolean;
}> = ({ structures, error, loading, enableOwnerDisplay = false }) => {
  if (error)
    return (
      <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
        <p>There was an error while querying. The results displayed may be incorrect.</p>
      </EuiCallOut>
    );

  if (loading)
    return (
      <StructureTableContainer enableOwnerDisplay={enableOwnerDisplay}>
        <StructureTableLoadingRows />
      </StructureTableContainer>
    );

  if (structures.length === 0)
    return (
      <StructureTableContainer enableOwnerDisplay={enableOwnerDisplay}>
        <StructureTableEmpty />
      </StructureTableContainer>
    );

  return (
    <StructureTableContainer enableOwnerDisplay={enableOwnerDisplay}>
      {structures.map(structure => (
        <StructureTableRow {...structure} key={structure.id} enableOwnerDisplay={enableOwnerDisplay} />
      ))}
    </StructureTableContainer>
  );
};

export const CharacterStructureTable: React.FC<{ characterObjectId: string }> = ({ characterObjectId }) => {
  const { data, loading, error } = useGetStructuresForCharacterQuery({
    variables: {
      objectId: characterObjectId,
      structureObjectTypes: STRUCTURE_TYPE_IDS,
    },
    returnPartialData: true,
  });

  const structures = (data?.object?.__typename === 'PlayerCreatureObject' && data.object.structures) || [];

  return <StructureTable loading={loading} error={error} structures={structures} />;
};

export const AccountStructureTable: React.FC<{ stationId: string }> = ({ stationId }) => {
  const { data, loading, error } = useGetStructuresForAccountQuery({
    variables: {
      stationId,
      structureObjectTypes: STRUCTURE_TYPE_IDS,
    },
    returnPartialData: true,
  });

  const structures = data?.account?.structures ?? [];

  return <StructureTable loading={loading} error={error} structures={structures} enableOwnerDisplay />;
};
