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
  EuiText,
} from '@elastic/eui';

import ObjectLink from '../ObjectLink';
import DeletedItemBadge from '../DeletedItemBadge';
import SimpleValue from '../SimpleValue';

import { GetCharactersForAccountQuery, useGetCharactersForAccountQuery } from './CharactersTable.queries';

export const GET_CHARACTERS_FOR_ACCOUNT = gql`
  query getCharactersForAccount($stationId: String!) {
    account(stationId: $stationId) {
      id
      characters {
        id
        resolvedName
        lastLoginTime
        createdTime
        deletionDate
        deletionReason
        scene
        sceneName
        location
        worldspaceLocation
        playerObject {
          id
          workingSkill
          playedTime
        }
      }
    }
  }
`;

interface CharactersTableRowsProps {
  isLoading: boolean;
  data?: GetCharactersForAccountQuery;
}

const NUM_COLUMNS = 6;
const NUM_FAKE_LOADING_ROWS = 5;

const CharactersTableRows: React.FC<CharactersTableRowsProps> = ({ isLoading, data }) => {
  if (isLoading)
    return (
      <>
        {Array(NUM_FAKE_LOADING_ROWS)
          .fill(true)
          .map((a, idx) => {
            return (
              <EuiTableRow key={`expectedItem-${idx}`}>
                <EuiTableRowCell colSpan={NUM_COLUMNS} textOnly={false}>
                  <EuiLoadingContent lines={1} className="inTableLoadingIndicator" />
                </EuiTableRowCell>
              </EuiTableRow>
            );
          })}
      </>
    );

  if (data?.account?.characters && data.account.characters.length > 0) {
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {data.account?.characters.map(character => {
          const location = character.worldspaceLocation ?? character.location;

          return (
            <EuiTableRow key={`item-${character.id}`}>
              <EuiTableRowCell>
                <ObjectLink disablePopup objectId={character.id} />
              </EuiTableRowCell>
              <EuiTableRowCell>
                {character.resolvedName}
                <EuiText color="subdued" size="xs">
                  {character.playerObject.workingSkill}
                </EuiText>
              </EuiTableRowCell>
              <EuiTableRowCell>
                <SimpleValue isLoading={false} numeric>
                  {[location?.map(Math.round).join(' ')].filter(Boolean).join(' - ')}
                  <EuiText color="subdued" size="xs">
                    {character.sceneName ?? 'Unknown Scene'}
                  </EuiText>
                </SimpleValue>
              </EuiTableRowCell>
              <EuiTableRowCell>
                {character.lastLoginTime
                  ? new Date(character.lastLoginTime).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'long',
                    })
                  : 'Unknown'}
              </EuiTableRowCell>
              <EuiTableRowCell>
                {character.createdTime
                  ? new Date(character.createdTime).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'long',
                    })
                  : 'Unknown'}
              </EuiTableRowCell>
              <EuiTableRowCell>
                <SimpleValue isLoading={false} numeric>
                  {Math.round((character.playerObject.playedTime ?? 0) / 3600)}
                </SimpleValue>
              </EuiTableRowCell>
              <EuiTableRowCell>
                <DeletedItemBadge
                  deletionDate={character.deletionDate ?? null}
                  deletionReason={character.deletionReason ?? null}
                />
              </EuiTableRowCell>
            </EuiTableRow>
          );
        })}
      </>
    );
  }

  return (
    <EuiTableRow>
      <EuiTableRowCell colSpan={NUM_COLUMNS} align="center">
        <EuiEmptyPrompt iconType="home" title={<h3>This account has no characters</h3>} titleSize="xs" />
      </EuiTableRowCell>
    </EuiTableRow>
  );
};

interface CharactersTableProps {
  stationId: string;
}
/**
 *
 */
const CharactersTable: React.FC<CharactersTableProps> = ({ stationId }) => {
  const { data, loading, error } = useGetCharactersForAccountQuery({
    variables: {
      stationId,
    },
    returnPartialData: true,
  });

  if (error)
    return (
      <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
        <p>There was an error while querying. The results displayed may be incorrect.</p>
      </EuiCallOut>
    );

  const rows = <CharactersTableRows isLoading={loading} data={data} />;

  return (
    <EuiTable className="objectListingTable" tableLayout="auto">
      <EuiTableHeader>
        <EuiTableHeaderCell className="narrowDataCol">Object ID</EuiTableHeaderCell>
        <EuiTableHeaderCell>Character Name</EuiTableHeaderCell>
        <EuiTableHeaderCell>Location</EuiTableHeaderCell>
        <EuiTableHeaderCell>Last Login</EuiTableHeaderCell>
        <EuiTableHeaderCell>Created At</EuiTableHeaderCell>
        <EuiTableHeaderCell className="narrowDataCol">Hours Played</EuiTableHeaderCell>
        <EuiTableHeaderCell className="narrowDataCol">Deleted</EuiTableHeaderCell>
      </EuiTableHeader>

      <EuiTableBody>{rows}</EuiTableBody>
    </EuiTable>
  );
};

export default CharactersTable;
