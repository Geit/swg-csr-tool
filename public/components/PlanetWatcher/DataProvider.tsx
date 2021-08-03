import { gql } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Subject } from 'rxjs';

import {
  OnObjectUpdatedSubscription,
  useOnObjectUpdatedSubscription,
  OnPlanetNodeStatusUpdateSubscription,
  useOnPlanetNodeStatusUpdateSubscription,
} from './DataProvider.queries';

export type PlanetWatcherObject = OnObjectUpdatedSubscription['planetWatcherObject'][number];
export type NodeStatus = OnPlanetNodeStatusUpdateSubscription['planetWatcherNodeStatus'][number];

interface ObjectUpdateMessage {
  type: 'UPDATED' | 'DELETED' | 'CREATED';
  data: PlanetWatcherObject;
}

interface NodeStatusMessage {
  type: 'UPDATED';
  data: NodeStatus;
}

const initialData = {
  objects: new Map<PlanetWatcherObject['networkId'], PlanetWatcherObject>(),
  objectUpdates: new Subject<ObjectUpdateMessage>(),
  nodeStatus: new Map<string, NodeStatus>(),
  nodeUpdates: new Subject<NodeStatusMessage>(),
  planet: 'tatooine',
};

export type DataProviderContextData = typeof initialData;

export const PlanetWatcherContext = React.createContext(initialData);

export const OBJECT_UPDATES_SUBSCRIPTION = gql`
  subscription OnObjectUpdated($clientID: ID!, $planet: ID!) {
    planetWatcherObject(clientId: $clientID, planet: $planet) {
      networkId
      deleteObject
      location
      objectTypeTag
    }
  }
`;

export const NODE_UPDATES_SUBSCRIPTION = gql`
  subscription OnPlanetNodeStatusUpdate($clientID: ID!, $planet: ID!) {
    planetWatcherNodeStatus(clientId: $clientID, planet: $planet) {
      cellIndex
      serverIds
      isLoaded
      location
    }
  }
`;

interface DataProviderProps {
  planet: string;
}

const DataProvider: React.FC<DataProviderProps> = ({ children, planet }) => {
  const [data, setData] = useState(initialData);
  const [clientId] = useState(Math.floor(Math.random() * 1000000).toString(36));

  useEffect(() => {
    for (const obj of data.objects.values()) {
      data.objectUpdates.next({
        type: 'DELETED',
        data: obj,
      });
    }
    setData({
      planet,
      nodeStatus: new Map(),
      objects: new Map(),
      objectUpdates: new Subject<ObjectUpdateMessage>(),
      nodeUpdates: new Subject<NodeStatusMessage>(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planet]);

  useOnObjectUpdatedSubscription({
    fetchPolicy: 'no-cache',
    variables: {
      clientID: clientId,
      planet,
    },
    onSubscriptionData: opt => {
      if (opt.subscriptionData.data) {
        opt.subscriptionData.data.planetWatcherObject.forEach(objectUpdate => {
          if (objectUpdate.deleteObject > 0) {
            data.objects.delete(objectUpdate.networkId);
            data.objectUpdates.next({
              type: 'DELETED',
              data: objectUpdate,
            });
          } else {
            const isUpdate = data.objects.has(objectUpdate.networkId);
            data.objects.set(objectUpdate.networkId, objectUpdate);
            if (isUpdate) {
              // Updated
              data.objectUpdates.next({
                type: 'UPDATED',
                data: objectUpdate,
              });
            } else {
              // Created
              data.objectUpdates.next({
                type: 'CREATED',
                data: objectUpdate,
              });
            }
          }
        });
      }
    },
  });

  useOnPlanetNodeStatusUpdateSubscription({
    fetchPolicy: 'no-cache',
    variables: {
      clientID: clientId,
      planet,
    },
    onSubscriptionData: opt => {
      if (opt.subscriptionData.data) {
        opt.subscriptionData.data.planetWatcherNodeStatus.forEach(nodeStatus => {
          const previousNodeStatus = data.nodeStatus.get(`${nodeStatus.location[0]}|${nodeStatus.location[2]}`);

          if (
            previousNodeStatus !== undefined &&
            previousNodeStatus.isLoaded === nodeStatus.isLoaded &&
            previousNodeStatus.serverIds?.length === nodeStatus.serverIds?.length &&
            nodeStatus.serverIds?.every((val, index) => val === nodeStatus.serverIds?.[index])
          ) {
            // Ignore empty updates.
            return;
          }

          data.nodeStatus.set(`${nodeStatus.location[0]}|${nodeStatus.location[2]}`, nodeStatus);
          data.nodeUpdates.next({
            type: 'UPDATED',
            data: nodeStatus,
          });
        });
      }
    },
  });

  return <PlanetWatcherContext.Provider value={data}>{children}</PlanetWatcherContext.Provider>;
};

export default DataProvider;
