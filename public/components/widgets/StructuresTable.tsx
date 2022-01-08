import React from 'react';
import { gql } from '@apollo/client';
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

import { GetStructuresForCharacterQuery, useGetStructuresForCharacterQuery } from './StructuresTable.queries';

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

interface SturcturesTableRowsProps {
  isLoading: boolean;
  data?: GetStructuresForCharacterQuery;
}

const StructuresTableRows: React.FC<SturcturesTableRowsProps> = ({ isLoading, data }) => {
  if (isLoading)
    return (
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

  if (
    data?.object?.__typename === 'PlayerCreatureObject' &&
    data.object.structures &&
    data.object.structures.length > 0
  ) {
    return (
      <>
        {data.object.structures.map(structure => (
          <EuiTableRow key={`item-${structure.id}`}>
            <EuiTableRowCell>
              <ObjectLink disablePopup objectId={structure.id} />
            </EuiTableRowCell>
            <EuiTableRowCell>{structure.__typename}</EuiTableRowCell>
            <EuiTableRowCell>
              <UGCName rawName={structure.resolvedName} /> ({structure.basicName})
            </EuiTableRowCell>
            <EuiTableRowCell>
              <DeletedItemBadge
                deletionDate={structure.deletionDate ?? null}
                deletionReason={structure.deletionReason ?? null}
              />
            </EuiTableRowCell>
            <EuiTableRowCell>
              {structure.containedById !== '0'
                ? `In Container ${structure.containedById}`
                : [structure.location?.map(Math.round).join(' '), structure.scene].filter(Boolean).join(' - ')}
            </EuiTableRowCell>
          </EuiTableRow>
        ))}
      </>
    );
  }

  return (
    <EuiTableRow>
      <EuiTableRowCell colSpan={5} align="center">
        <EuiEmptyPrompt iconType="home" title={<h3>This player is homeless</h3>} titleSize="xs" />
      </EuiTableRowCell>
    </EuiTableRow>
  );
};

interface StructuresTableProps {
  characterObjectId: string;
}
/**
 *
 */
const StructuresTable: React.FC<StructuresTableProps> = ({ characterObjectId }) => {
  const { data, loading, error } = useGetStructuresForCharacterQuery({
    variables: {
      objectId: characterObjectId,
      structureObjectTypes: STRUCTURE_TYPE_IDS,
    },
    returnPartialData: true,
  });

  if (error)
    return (
      <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
        <p>There was an error while querying. The results displayed may be incorrect.</p>
      </EuiCallOut>
    );

  const rows = <StructuresTableRows isLoading={loading} data={data} />;

  return (
    <EuiTable className="objectListingTable" tableLayout="auto">
      <EuiTableHeader>
        <EuiTableHeaderCell className="narrowDataCol">Object ID</EuiTableHeaderCell>
        <EuiTableHeaderCell className="narrowDataCol">Type</EuiTableHeaderCell>
        <EuiTableHeaderCell>Structure Name</EuiTableHeaderCell>
        <EuiTableHeaderCell className="narrowDataCol">Deletion Status</EuiTableHeaderCell>
        <EuiTableHeaderCell>Location</EuiTableHeaderCell>
      </EuiTableHeader>

      <EuiTableBody>{rows}</EuiTableBody>
    </EuiTable>
  );
};

export default StructuresTable;
