import React, { useState, MouseEventHandler } from 'react';
import { EuiButtonIcon, EuiPopover, EuiContextMenuPanel, EuiContextMenuItem } from '@elastic/eui';
import { useHistory } from 'react-router';

import { useKibana } from '../../hooks/useKibana';

interface TransactionRollupActionsParty {
  identifier: string;
  entity?:
    | { __typename: 'Account'; id: string; accountName?: string | null | undefined }
    | { __typename: 'PlayerCreatureObject'; id: string; resolvedName: string }
    | null;
}

interface TranasctionRollupActionsProps {
  id: string;
  partyA: TransactionRollupActionsParty;
  partyB: TransactionRollupActionsParty;
}

const TransactionRollupActions: React.FC<TranasctionRollupActionsProps> = ({ id, partyA, partyB }) => {
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

  const partyAName =
    (partyA.entity?.__typename === 'Account' ? partyA.entity.accountName : partyA.entity?.resolvedName) ||
    partyA.identifier;
  const partyBName =
    (partyB.entity?.__typename === 'Account' ? partyB.entity.accountName : partyB.entity?.resolvedName) ||
    partyB.identifier;

  return (
    <EuiPopover
      id={`${id}-actions`}
      button={
        <EuiButtonIcon
          aria-label="Actions"
          iconType="boxesHorizontal"
          size="s"
          color="text"
          onClick={() => setPopoverOpen(v => !v)}
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
            href={`${appUrl}/trades?parties=${partyA.identifier}_${partyB.identifier}`}
            onClick={handleLinkClick}
          >
            View individual trades between accounts
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key="view-partya-report"
            icon="reporter"
            href={`${appUrl}/trade-report?stationId=${partyA.identifier}`}
            onClick={handleLinkClick}
          >
            View trade report for {partyAName}
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key="view-partyb-report"
            icon="reporter"
            href={`${appUrl}/trade-report?stationId=${partyB.identifier}`}
            onClick={handleLinkClick}
          >
            View trade report for {partyBName}
          </EuiContextMenuItem>,
        ]}
      />
    </EuiPopover>
  );
};

export default TransactionRollupActions;
