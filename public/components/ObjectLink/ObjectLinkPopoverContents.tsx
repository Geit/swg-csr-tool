import React from 'react';
import {
  EuiPopoverTitle,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';
import { gql } from '@apollo/client';

import DeletedItemBadge from '../DeletedItemBadge';

import { useGetObjectDetailsTooltipQuery } from './ObjectLinkPopoverContents.queries';

export const GET_OBJECT_DETAILS = gql`
  query getObjectDetailsTooltip($objectId: String!) {
    object(objectId: $objectId) {
      __typename
      id
      resolvedName
      deletionReason
      deletionDate
    }
  }
`;

interface ObjectLinkPopoverDetailsProps {
  objectId: string;
}

const ObjectLinkPopoverDetails: React.FC<ObjectLinkPopoverDetailsProps> = ({ objectId }) => {
  const { data } = useGetObjectDetailsTooltipQuery({
    variables: {
      objectId,
    },
  });

  return (
    <>
      <EuiPopoverTitle>{data?.object?.resolvedName ?? 'Object Details'}</EuiPopoverTitle>
      <EuiDescriptionList compressed>
        <EuiDescriptionListTitle>Object Type</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>{data?.object?.__typename ?? 'Unknown'}</EuiDescriptionListDescription>
        <EuiDescriptionListTitle>Deletion Status</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <DeletedItemBadge
            deletionDate={data?.object?.deletionDate ?? null}
            deletionReason={data?.object?.deletionReason ?? null}
          ></DeletedItemBadge>
        </EuiDescriptionListDescription>
      </EuiDescriptionList>
    </>
  );
};

export default ObjectLinkPopoverDetails;
