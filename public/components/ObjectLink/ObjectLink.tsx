import React, { useState } from 'react';
import { EuiPopover } from '@elastic/eui';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import ObjectLinkPopoverDetails from './ObjectLinkPopoverContents';

interface ObjectLinkProps {
  objectId?: string | null;
  disablePopup?: boolean;
}

const ObjectLink: React.FC<ObjectLinkProps> = ({ objectId, disablePopup }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [debouncedPopoverVisible, setDebouncedPopoverVisible] = useState(false);
  useDebounce(
    () => {
      setDebouncedPopoverVisible(popoverVisible);
    },
    100,
    [popoverVisible]
  );

  if (!objectId) return null;

  if (parseInt(objectId) <= 0) {
    return <span>{objectId}</span>;
  }

  const button = (
    <Link
      className="euiLink euiLink--primary"
      to={`/object/${objectId}`}
      onMouseEnter={() => setPopoverVisible(true)}
      onMouseLeave={() => setPopoverVisible(false)}
    >
      <code>{objectId}</code>
    </Link>
  );

  if (disablePopup) {
    return button;
  }

  const popOverOpen = debouncedPopoverVisible || popoverVisible;

  return (
    <EuiPopover
      button={button}
      isOpen={popOverOpen}
      initialFocus={false}
      ownFocus={false}
      hasArrow={false}
      anchorPosition="upCenter"
      onMouseEnter={() => setPopoverVisible(true)}
      onMouseLeave={() => setPopoverVisible(false)}
    >
      {popOverOpen && <ObjectLinkPopoverDetails objectId={objectId} />}
    </EuiPopover>
  );
};

export default ObjectLink;
