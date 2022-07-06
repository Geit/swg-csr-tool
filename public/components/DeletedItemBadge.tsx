import { EuiBadge, EuiLoadingContent, EuiToolTip } from '@elastic/eui';
import React from 'react';

import { DeletionReasons } from '../utils/deletionReasons';

interface DeletedItemBadgeProps {
  deletionReason: DeletionReasons | null;
  deletionDate: string | null;
}

/**
 * Renders a coloured badge (with optional tooltip), which indicates
 * to the user if and when an object was deleted.
 */
const DeletedItemBadge: React.FC<DeletedItemBadgeProps> = ({ deletionReason, deletionDate }) => {
  if (deletionReason === null) {
    <EuiLoadingContent lines={1} />;
  }

  if (deletionReason === 0 || deletionDate === null) {
    return <EuiBadge color="success">Undeleted</EuiBadge>;
  }

  const deletionDateAsDate = new Date(deletionDate);

  return (
    <EuiToolTip
      position="top"
      content={`Item was deleted at ${deletionDateAsDate.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'long',
      })}`}
    >
      <EuiBadge color="danger">{DeletionReasons[deletionReason ?? 0]}</EuiBadge>
    </EuiToolTip>
  );
};

export default DeletedItemBadge;
