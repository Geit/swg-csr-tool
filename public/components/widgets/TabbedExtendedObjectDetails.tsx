import { EuiSpacer, EuiTabbedContent } from '@elastic/eui';
import React from 'react';

import CharactersTable from './CharactersTable';
import ObjectVariables from './ObjectVariables';
import AttachedScripts from './AttachedScripts';
import { CharacterStructureTable } from './StructuresTable';

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
    {
      id: 'script-list',
      name: 'Scripts',
      content: <AttachedScripts objectId={objectId} />,
    },
  ];

  if (objectType === 'PlayerCreatureObject') {
    tabs.push({
      id: 'structures',
      name: 'Structures',
      content: <CharacterStructureTable characterObjectId={objectId} />,
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
