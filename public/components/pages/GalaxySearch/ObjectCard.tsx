import React from 'react';
import { EuiDescriptionListTitle, EuiDescriptionListDescription, EuiDescriptionList } from '@elastic/eui';

import DeletedItemBadge from '../../DeletedItemBadge';
import UGCName from '../../UGCName';

import { ResultIcon } from './ResultIcon';
import { SearchResultCard } from './SearchResultCard';

import { ObjectResult } from '.';

export const ObjectCard: React.FC<{ object: ObjectResult }> = ({ object }) => {
  return (
    <SearchResultCard
      href={`/object/${object.id}`}
      title={
        <span>
          <ResultIcon resultType={object.__typename} />
          <UGCName rawName={object.resolvedName} />
        </span>
      }
    >
      <EuiDescriptionList className="galaxySearchKeyValues" textStyle="reverse">
        <div>
          <EuiDescriptionListTitle>Type</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{object.__typename}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Object ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{object.id}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Basic Name</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{object.basicName}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Deleted</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <DeletedItemBadge
              deletionDate={object.deletionDate ?? null}
              deletionReason={object.deletionReason ?? null}
            />
          </EuiDescriptionListDescription>
        </div>
      </EuiDescriptionList>
    </SearchResultCard>
  );
};
