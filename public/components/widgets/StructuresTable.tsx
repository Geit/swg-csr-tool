import React from 'react';
import { ApolloError, gql } from '@apollo/client';
import {
  EuiCallOut,
  EuiEmptyPrompt,
  EuiLoadingContent,
  EuiTable,
  EuiTableBody,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableRow,
  EuiTableRowCell,
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
        scene
        deletionDate
        deletionReason
        containedById
      }
    }
  }
`;

interface Structure {
  __typename?: string;
  id: string;
  resolvedName: string;
  location?: number[] | null | undefined;
  scene?: string | null | undefined;
  deletionDate?: string | null | undefined;
  deletionReason?: number | null | undefined;
  containedById?: string | null | undefined;
  basicName: string;
}

const StructureTableRow: React.FC<Structure> = ({
  __typename,
  id,
  resolvedName,
  location,
  scene,
  deletionDate,
  deletionReason,
  containedById,
  basicName,
}) => {
  return (
    <EuiTableRow key={`item-${id}`}>
      <EuiTableRowCell>
        <ObjectLink disablePopup objectId={id} />
      </EuiTableRowCell>
      <EuiTableRowCell>
        <UGCName rawName={resolvedName} /> ({basicName})
      </EuiTableRowCell>
      <EuiTableRowCell>
        <DeletedItemBadge deletionDate={deletionDate ?? null} deletionReason={deletionReason ?? null} />
      </EuiTableRowCell>
      <EuiTableRowCell>
        {containedById !== '0' ? (
          <>
            Packed in: <ObjectLink objectId={containedById} />
          </>
        ) : (
          [location?.map(Math.round).join(' '), scene].filter(Boolean).join(' - ')
        )}
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
              <EuiLoadingContent lines={1} className="inTableLoadingIndicator" />
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

const StructureTableContainer: React.FC = ({ children }) => {
  return (
    <EuiTable className="objectListingTable" tableLayout="auto">
      <EuiTableHeader>
        <EuiTableHeaderCell className="narrowDataCol">Object ID</EuiTableHeaderCell>
        <EuiTableHeaderCell>Structure Name</EuiTableHeaderCell>
        <EuiTableHeaderCell className="narrowDataCol">Deletion Status</EuiTableHeaderCell>
        <EuiTableHeaderCell>Location</EuiTableHeaderCell>
      </EuiTableHeader>

      <EuiTableBody>{children}</EuiTableBody>
    </EuiTable>
  );
};

const StructureTable: React.FC<{ error?: ApolloError; loading: boolean; structures: Structure[] }> = ({
  structures,
  error,
  loading,
}) => {
  if (error)
    return (
      <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
        <p>There was an error while querying. The results displayed may be incorrect.</p>
      </EuiCallOut>
    );

  if (loading)
    return (
      <StructureTableContainer>
        <StructureTableLoadingRows />
      </StructureTableContainer>
    );

  if (structures.length === 0)
    return (
      <StructureTableContainer>
        <StructureTableEmpty />
      </StructureTableContainer>
    );

  return (
    <StructureTableContainer>
      {structures.map(structure => (
        <StructureTableRow {...structure} key={structure.id} />
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

  return <StructureTable loading={loading} error={error} structures={structures} />;
};
