import {
  EuiText,
  EuiTitle,
  EuiTable,
  EuiTableHeader,
  EuiTableBody,
  EuiTableHeaderCell,
  EuiSpacer,
  EuiEmptyPrompt,
  EuiIcon,
  EuiTableRow,
  EuiTableRowCell,
  EuiLoadingContent,
  EuiDelayRender,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSwitch,
  EuiNotificationBadge,
} from '@elastic/eui';
import React, { useState } from 'react';
import { gql } from '@apollo/client';

import { DeletionReasons } from '../../utils/deletionReasons';
import DeletedItemBadge from '../DeletedItemBadge';
import ObjectLink from '../ObjectLink';
import UGCName from '../UGCName';

import { useGetObjectContentsQuery } from './ContentsOfObject.queries';

export const GET_OBJECT_CONTENTS = gql`
  query getObjectContents($objectId: String!, $excludeDeleted: Boolean!) {
    object(objectId: $objectId) {
      id
      contents(excludeDeleted: $excludeDeleted, limit: 5000) {
        __typename
        id
        resolvedName
        basicName: resolvedName(resolveCustomNames: false)
        deletionReason
        deletionDate
        loadWithId
        containedById
        containedItemCount
      }
    }
  }
`;

interface ContentsOfObjectProps {
  objectId: string | null;
}

const ContentsOfObjectTable: React.FC<{ objectId: string; showDeletedItems: boolean; showDepth: boolean }> = ({
  objectId,
  showDeletedItems,
  showDepth,
}) => {
  const htmlId = `objectContents-${objectId}`;

  const rows = <ContentsOfObjectRows objectId={objectId} showDeletedItems={showDeletedItems} showDepth={showDepth} />;
  return (
    <>
      <EuiSpacer size="s" />
      <EuiTable id={htmlId} className="objectListingTable" tableLayout="auto">
        <EuiTableHeader>
          <EuiTableHeaderCell className="nestingObjectId">Object ID</EuiTableHeaderCell>
          <EuiTableHeaderCell>Object Name</EuiTableHeaderCell>
          <EuiTableHeaderCell className="narrowDataCol">Deletion Status</EuiTableHeaderCell>
        </EuiTableHeader>

        <EuiTableBody>{rows}</EuiTableBody>
      </EuiTable>
    </>
  );
};

/**
 * Renders the items contained by this object as a "nested" table.
 * The user can click on rows that contain other items to expand them.
 *
 * By default, deleted items will be hidden from the user.
 */
const ContentsOfObject: React.FC<ContentsOfObjectProps> = ({ objectId }) => {
  const [showDeletedItems, setShowDeletedItems] = useState(false);
  const [showDepth, setShowDepth] = useState(true);

  if (!objectId) {
    return null;
  }

  return (
    <>
      <EuiFlexGroup justifyContent="spaceBetween" gutterSize="m">
        <EuiFlexItem>
          <EuiTitle>
            <h2>Contents</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch label="Show depth" checked={showDepth} onChange={() => setShowDepth(val => !val)} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            label="Show deleted"
            checked={showDeletedItems}
            onChange={() => setShowDeletedItems(val => !val)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <ContentsOfObjectTable objectId={objectId} showDeletedItems={showDeletedItems} showDepth={showDepth} />
    </>
  );
};

interface ContentsOfObjectRowsProps {
  objectId: string;
  level?: number;
  expectedItemCount?: number;
  showDeletedItems: boolean;
  showDepth: boolean;
}

interface ContainedItem {
  id: string;
  resolvedName?: string | null;
  basicName?: string | null;
  deletionDate?: string | null;
  deletionReason?: DeletionReasons | null;
  containedItemCount: number;
  __typename: string;
}

const ContentsOfObjectRow: React.FC<{ containedItem: ContainedItem } & ContentsOfObjectRowsProps> = props => {
  const { containedItem, level = 0 } = props;
  const [collapsed, setCollapsed] = useState(true);

  let iconType = containedItem.containedItemCount > 0 ? 'arrowRight' : 'empty';

  if (!collapsed) {
    iconType = 'arrowDown';
  }

  return (
    <>
      <EuiTableRow
        key={`item-${containedItem.id}`}
        onClick={
          containedItem.containedItemCount > 0
            ? () => {
                setCollapsed(!collapsed);
              }
            : undefined
        }
      >
        <EuiTableRowCell>
          <EuiIcon type={iconType} style={{ marginLeft: 16 * level, marginRight: 16 }} />
          {props.showDepth && (
            <EuiNotificationBadge className="levelIndicator" color="subdued">
              {level}
            </EuiNotificationBadge>
          )}
          <ObjectLink disablePopup objectId={containedItem.id} />
        </EuiTableRowCell>
        <EuiTableRowCell>
          {containedItem.resolvedName === containedItem.basicName ? (
            containedItem.resolvedName
          ) : (
            <>
              <UGCName rawName={containedItem.resolvedName} />
              <EuiText color="subdued" size="xs">
                {containedItem.basicName}
              </EuiText>
            </>
          )}
        </EuiTableRowCell>
        <EuiTableRowCell>
          <DeletedItemBadge
            deletionDate={containedItem.deletionDate ?? null}
            deletionReason={containedItem.deletionReason ?? null}
          />
        </EuiTableRowCell>
      </EuiTableRow>
      {containedItem.containedItemCount > 0 && !collapsed && (
        <ContentsOfObjectRows
          level={level + 1}
          objectId={containedItem.id}
          expectedItemCount={containedItem.containedItemCount}
          showDeletedItems={props.showDeletedItems}
          showDepth={props.showDepth}
        />
      )}
    </>
  );
};

const ContentsOfObjectRows: React.FC<ContentsOfObjectRowsProps> = props => {
  const { level = 0, objectId, expectedItemCount = 5 } = props;
  const { data, loading, previousData } = useGetObjectContentsQuery({
    variables: {
      objectId,
      excludeDeleted: !props.showDeletedItems,
    },
    returnPartialData: true,
  });

  let dataToRender = data;

  if (loading && previousData && previousData.object) {
    dataToRender = previousData;
  }

  if (!dataToRender?.object || (dataToRender?.object?.contents?.length ?? 0) === 0) {
    if (loading) {
      return (
        <EuiDelayRender delay={100}>
          {Array(expectedItemCount)
            .fill(true)
            .map((a, idx) => {
              return (
                <EuiTableRow key={`expectedItem-${idx}`}>
                  <EuiTableRowCell colSpan={3} textOnly={false}>
                    <EuiLoadingContent lines={1} className="inTableLoadingIndicator" />
                  </EuiTableRowCell>
                </EuiTableRow>
              );
            })}
        </EuiDelayRender>
      );
    } else if (level === 0) {
      return (
        <EuiTableRow>
          <EuiTableRowCell colSpan={3} align="center">
            <EuiEmptyPrompt iconType="eraser" title={<h3>This object is empty</h3>} titleSize="xs" />
          </EuiTableRowCell>
        </EuiTableRow>
      );
    }

    return null;
  }

  if (!dataToRender.object.contents) {
    return null;
  }

  return (
    <>
      {dataToRender.object.contents
        .filter(item => props.showDeletedItems || item.deletionReason === 0)
        .map(containedItem => (
          <ContentsOfObjectRow containedItem={containedItem} key={containedItem.id} {...props} />
        ))}
    </>
  );
};

export default ContentsOfObject;
