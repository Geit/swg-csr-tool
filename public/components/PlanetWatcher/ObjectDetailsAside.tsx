import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiPanel,
  EuiSpacer,
  EuiAccordion,
  EuiBadge,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { css } from '@emotion/react';

import ObjectInfoWidget from '../widgets/BasicObjectKeyValues';
import ContentsOfObject from '../widgets/ContentsOfObject';
import { AiMovementType } from '../../types/AIMovementType';
import { typeTagToString } from '../../utils/typeTagToString';
import UGCName from '../UGCName';
import { isPresent } from '../../utils/utility-types';

import { PlanetWatcherContext, PlanetWatcherObject } from './DataProvider';
import { useGetObjectNamesQuery } from './ObjectDetailsAside.queries';

export const GET_OBJECT_NAMES = gql`
  query getObjectNames($objectIds: [ID!]!) {
    objects(objectIds: $objectIds) {
      __typename
      id
      resolvedName
    }
  }
`;

interface ObjectSelectedEvent extends Event {
  detail?: {
    objectIds: string[];
  };
}

const SingleObjectDetails: React.FC<{ object: PlanetWatcherObject }> = ({ object }) => {
  return (
    <EuiDescriptionList className="objectInformationList" textStyle="reverse">
      <div>
        <EuiDescriptionListTitle>Object ID</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.networkId}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Location</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.location.join(' ')}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Template CRC</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.templateCrc}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Type Tag</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{typeTagToString(object.objectTypeTag)}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Interest Radius</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.interestRadius}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Authoritative Server</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.authoritativeServer}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Level</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.level}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Hibernating</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.hibernating > 0 ? 'Yes' : 'No'}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>AI Activity</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{AiMovementType[object.aiActivity] || 'Unknown'}</code>
        </EuiDescriptionListDescription>
      </div>
      <div>
        <EuiDescriptionListTitle>Creation Type</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <code>{object.creationType}</code>
        </EuiDescriptionListDescription>
      </div>
    </EuiDescriptionList>
  );
};

const ObjectDetailsAccordion: React.FC<{
  baseObjectData: PlanetWatcherObject;
  enrichedObjectData?: { __typename: string; resolvedName: string };
  initialIsOpen: boolean;
}> = ({ baseObjectData, enrichedObjectData, initialIsOpen }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const badgeMargin = css`
    margin-right: 8px;
  `;

  let title = (
    <>
      <EuiBadge css={badgeMargin}>Non Persisted</EuiBadge>
      {baseObjectData.networkId}
    </>
  );
  let contents = isOpen ? <SingleObjectDetails object={baseObjectData} /> : null;

  if (enrichedObjectData) {
    title = (
      <>
        <EuiBadge css={badgeMargin}>{enrichedObjectData.__typename}</EuiBadge>
        <UGCName rawName={enrichedObjectData.resolvedName} />
      </>
    );
    contents = isOpen ? (
      <>
        <ObjectInfoWidget objectId={baseObjectData.networkId} />
        <EuiSpacer />
        <ContentsOfObject objectId={baseObjectData.networkId} />
      </>
    ) : null;
  }

  return (
    <EuiAccordion
      forceState={isOpen ? 'open' : 'closed'}
      onToggle={() => setIsOpen(s => !s)}
      id={`accordion-${baseObjectData.networkId}`}
      key={baseObjectData.networkId}
      buttonContent={title}
      paddingSize="m"
    >
      <EuiPanel color="subdued" hasBorder>
        {contents}
      </EuiPanel>
    </EuiAccordion>
  );
};

const ObjectDetailsAside: React.FC = () => {
  const data = useContext(PlanetWatcherContext);
  const [selectedObjects, setSelectedObjects] = useState<null | PlanetWatcherObject[]>(null);
  const { data: objectData } = useGetObjectNamesQuery({
    skip: !selectedObjects,
    variables: { objectIds: selectedObjects?.map(o => o.networkId) ?? '' },
  });

  useLayoutEffect(() => {
    const eventHandler = (evt: ObjectSelectedEvent): any => {
      const objectIds = evt.detail?.objectIds ?? null;

      const objects = objectIds?.map(oid => data.objects.get(oid)).filter(isPresent) ?? [];

      setSelectedObjects(objects);
    };

    document.addEventListener('objectSelected', eventHandler);

    return () => {
      document.removeEventListener('objectSelected', eventHandler);
    };
  });

  useEffect(() => {
    const sub = data.objectUpdates.subscribe(update => {
      if (
        !selectedObjects ||
        selectedObjects.length === 0 ||
        selectedObjects.findIndex(o => o.networkId === update.data.networkId) === -1
      )
        return;

      if (update.type === 'DELETED') {
        setSelectedObjects(selectedObjects.filter(s => s.networkId !== update.data.networkId));
      }

      // Don't do this with lots of selected objects, or we'll lag out the client with rerenders.
      if (selectedObjects.length < 5)
        setSelectedObjects(selectedObjects.map(s => (s.networkId !== update.data.networkId ? s : update.data)));
    });

    return () => sub.unsubscribe();
  }, [data.objectUpdates, selectedObjects]);

  if (!selectedObjects) return null;

  return (
    <EuiFlyout size="m" ownFocus={false} onClose={() => setSelectedObjects(null)}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle>
          <h2>Object Details</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {selectedObjects.map((obj, idx) => {
          const enrichedObjectData = objectData?.objects?.find(o => o.id === obj.networkId);

          return (
            <ObjectDetailsAccordion
              key={obj.networkId}
              baseObjectData={obj}
              enrichedObjectData={enrichedObjectData}
              initialIsOpen={idx === 0}
            />
          );
        })}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default ObjectDetailsAside;
