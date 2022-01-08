import { EuiSpacer, EuiTabbedContent } from '@elastic/eui';
import React from 'react';

import CharactersTable from './CharactersTable';
import ObjectVariables from './ObjectVariables';
import StructuresTable from './StructuresTable';

interface ExtraObjectInformationProps {
  objectId: string;
  objectType?: string;
  stationId?: string;
}

/**
 * Tabbed interface that contains object information that is useful, but may not
 * be essential to display above-the-fold.
 */
const TabbedExtendedObjectDetails: React.FC<ExtraObjectInformationProps> = ({ objectId, objectType, stationId }) => {
  const tabs = [
    {
      id: 'object-variables',
      name: 'Object Variables',
      content: <ObjectVariables objectId={objectId} />,
    },
  ];

  if (objectType === 'PlayerCreatureObject') {
    tabs.push({
      id: 'structures',
      name: 'Structures',
      content: <StructuresTable characterObjectId={objectId} />,
    });

    if (stationId)
      tabs.push({
        id: 'alts',
        name: 'Alt Toons',
        content: <CharactersTable stationId={stationId} />,
      });
  }

  return (
    <>
      <EuiSpacer size="l" />
      <EuiTabbedContent tabs={tabs} />
    </>
  );
};

export default TabbedExtendedObjectDetails;
