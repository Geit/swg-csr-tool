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
