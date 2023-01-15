import React, { useState, ReactNode } from 'react';
import { EuiPopover } from '@elastic/eui';
import { Link } from 'react-router-dom';

import ObjectLinkPopoverDetails from './ObjectLinkPopoverContents';

interface ObjectLinkProps {
  objectId?: string | null;
  textToDisplay?: ReactNode | null;
  disablePopup?: boolean;
}

const ObjectLink: React.FC<ObjectLinkProps> = ({ objectId, disablePopup, textToDisplay }) => {
  const [mouseOverLink, setMouseOverLink] = useState(false);
  const [mouseOverPopover, setMouseOverPopOver] = useState(false);

  if (typeof objectId !== 'string') return null;

  if (parseInt(objectId) <= 0) {
    return <span>{objectId}</span>;
  }

  const button = (
    <Link
      className="euiLink euiLink--primary"
      to={`/object/${objectId}`}
      onMouseEnter={() => setMouseOverLink(true)}
      onMouseLeave={() => setMouseOverLink(false)}
    >
      {textToDisplay ? textToDisplay : <code>{objectId}</code>}
    </Link>
  );

  if (disablePopup) {
    return button;
  }

  const popOverOpen = mouseOverLink || mouseOverPopover;

  return (
    <EuiPopover
      button={button}
      isOpen={popOverOpen}
      ownFocus={false}
      hasArrow={false}
      anchorPosition="upCenter"
      onMouseEnter={() => setMouseOverPopOver(true)}
      onMouseLeave={() => setMouseOverPopOver(false)}
    >
      {popOverOpen && <ObjectLinkPopoverDetails objectId={objectId} />}
    </EuiPopover>
  );
};

export default ObjectLink;
