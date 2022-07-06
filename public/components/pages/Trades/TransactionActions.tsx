import React, { useState, MouseEventHandler } from 'react';
import { EuiButtonIcon, EuiPopover, EuiContextMenuPanel, EuiContextMenuItem } from '@elastic/eui';
import { useHistory } from 'react-router';

import { useKibana } from '../../../hooks/useKibana';

interface TransactionActionsParty {
  oid: string;
  stationId: string;
  name: string;
}

interface TranasctionActionsProps {
  id: string;
  partyA: TransactionActionsParty;
  partyB: TransactionActionsParty;
}

const TransactionActions: React.FC<TranasctionActionsProps> = ({ id, partyA, partyB }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const coreServices = useKibana();
  const history = useHistory();
  const appUrl = coreServices?.application.getUrlForApp('swgCsrTool');

  const handleLinkClick: MouseEventHandler = evt => {
    if (evt.shiftKey || evt.ctrlKey || evt.button === 1) return;

    evt.preventDefault();

    const target = evt.currentTarget as HTMLAnchorElement;

    const targetUrl = target.getAttribute('href')?.replace(appUrl!, '');

    if (targetUrl) history.push(targetUrl);
  };

  return (
    <EuiPopover
      id={`${id}-actions`}
      button={
        <EuiButtonIcon
          aria-label="Actions"
          iconType="boxesHorizontal"
          size="s"
          color="text"
          onClick={() => setPopoverOpen(true)}
        />
      }
      isOpen={popoverOpen}
      closePopover={() => setPopoverOpen(false)}
      panelPaddingSize="none"
      anchorPosition="leftCenter"
    >
      <EuiContextMenuPanel
        items={[
          <EuiContextMenuItem
            key="view-character-trades"
            icon="user"
            href={`${appUrl}/trades?parties=${partyA.oid}_${partyB.oid}`}
            onClick={handleLinkClick}
          >
            View all trades between characters
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key="view-account-trades"
            icon="users"
            href={`${appUrl}/trades?parties=${partyA.stationId}_${partyB.stationId}`}
            onClick={handleLinkClick}
          >
            View all trades between accounts
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key="view-character-rollup"
            icon="fold"
            href={`${appUrl}/trade-rollup?party_a=${partyA.oid}&party_b=${partyB.oid}`}
            onClick={handleLinkClick}
          >
            View rollup between characters
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key="view-account-rollup"
            icon="reporter"
            href={`${appUrl}/trade-rollup?party_a=${partyA.stationId}&party_b=${partyB.stationId}`}
            onClick={handleLinkClick}
          >
            View rollup between accounts
          </EuiContextMenuItem>,
        ]}
      />
    </EuiPopover>
  );
};

export default TransactionActions;
