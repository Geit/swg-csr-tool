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
  EuiCallOut,
  EuiSpacer,
} from '@elastic/eui';
import { gql } from '@apollo/client';

import ObjectInfoWidget from '../widgets/ObjectInfoWidget';
import ContentsOfObject from '../widgets/ContentsOfObject';

import { PlanetWatcherContext, PlanetWatcherObject } from './DataProvider';
import { useGetObjectNameQuery } from './ObjectDetailsAside.queries';

export const GET_OBJECT_NAME = gql`
  query getObjectName($id: String!) {
    object(objectId: $id) {
      __typename
      id
      resolvedName
    }
  }
`;

interface SomeCustomEvent extends Event {
  detail?: {
    objectId: string;
  };
}

enum AiMovementType {
  Idle,
  Loitering,
  Wandering,
  Following,
  Fleeing,
  Moving,
  Patrolling,
  Facing,
  Swarming,
  Invalid,
}

const ObjectDetailsAside: React.FC = () => {
  const data = useContext(PlanetWatcherContext);
  const [selectedObject, setSelectedObject] = useState<null | PlanetWatcherObject>(null);
  const { data: objectData, loading: persistedDataLoading } = useGetObjectNameQuery({
    skip: !selectedObject,
    variables: { id: selectedObject?.networkId ?? '' },
  });

  useLayoutEffect(() => {
    const eventHandler = (evt: SomeCustomEvent): any => {
      const objectId = evt.detail?.objectId ?? null;

      if (!objectId || !data.objects.has(objectId)) return;
      const object = data.objects.get(objectId);

      setSelectedObject(object!);
    };

    document.addEventListener('objectSelected', eventHandler);

    return () => {
      document.removeEventListener('objectSelected', eventHandler);
    };
  });

  useEffect(() => {
    const sub = data.objectUpdates.subscribe(update => {
      if (!selectedObject || update.data.networkId !== selectedObject.networkId) return;

      if (update.type === 'DELETED') {
        setSelectedObject(null);
      }

      setSelectedObject(update.data);
    });

    return () => sub.unsubscribe();
  }, [data.objectUpdates, selectedObject]);

  if (!selectedObject) return null;

  const isNonPersistedObject = persistedDataLoading || !objectData || objectData.object === null;

  const nonPersistedCallout = (
    <EuiCallOut
      iconType="iInCircle"
      size="s"
      title="This object is not stored within the database, available information is limited."
    />
  );

  return (
    <EuiFlyout size="s" ownFocus={false} onClose={() => setSelectedObject(null)}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle>
          <h2>{objectData?.object?.resolvedName ?? 'Object Details'}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody banner={isNonPersistedObject ? nonPersistedCallout : null}>
        {isNonPersistedObject ? (
          <EuiPanel color="subdued" hasBorder>
            <EuiDescriptionList className="objectInformationList" textStyle="reverse">
              <div>
                <EuiDescriptionListTitle>Object ID</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.networkId}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Location</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.location.join(' ')}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Template CRC</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.templateCrc}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Type Tag</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>
                    {[
                      (selectedObject.objectTypeTag & 0xff000000) >> 24,
                      (selectedObject.objectTypeTag & 0x00ff0000) >> 16,
                      (selectedObject.objectTypeTag & 0x0000ff00) >> 8,
                      selectedObject.objectTypeTag & 0x000000ff,
                    ].reduce((acc, cur) => `${acc}${String.fromCharCode(cur)}`, '')}
                  </code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Interest Radius</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.interestRadius}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Authoritative Server</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.authoritativeServer}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Level</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.level}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Hibernating</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.hibernating > 0 ? 'Yes' : 'No'}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>AI Activity</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{AiMovementType[selectedObject.aiActivity] || 'Unknown'}</code>
                </EuiDescriptionListDescription>
              </div>
              <div>
                <EuiDescriptionListTitle>Creation Type</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  <code>{selectedObject.creationType}</code>
                </EuiDescriptionListDescription>
              </div>
            </EuiDescriptionList>
          </EuiPanel>
        ) : (
          <>
            <ObjectInfoWidget objectId={selectedObject.networkId} />
            <EuiSpacer />
            <ContentsOfObject objectId={selectedObject.networkId} />
          </>
        )}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default ObjectDetailsAside;
