import { EuiSpacer, EuiTabbedContent } from '@elastic/eui';
import React from 'react';

import ObjectVariables from './ObjectVariables';

interface ExtraObjectInformationProps {
  objectId: string;
}

/**
 * Tabbed interface that contains object information that is useful, but may not
 * be essential to display above-the-fold.
 */
const ExtraObjectInformation: React.FC<ExtraObjectInformationProps> = ({ objectId }) => {
  const tabs = [
    {
      id: 'object-variables',
      name: 'Object Variables',
      content: <ObjectVariables objectId={objectId} />,
    },
  ];

  return (
    <>
      <EuiSpacer size="l" />
      <EuiTabbedContent tabs={tabs} />
    </>
  );
};

export default ExtraObjectInformation;
