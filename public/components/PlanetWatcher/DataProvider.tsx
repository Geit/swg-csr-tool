import { gql } from '@apollo/client';
import React, { useState, useEffect, useReducer, useRef } from 'react';
import { Subject } from 'rxjs';

import { colorPalette } from './ColorPalette';
import {
  OnObjectUpdatedSubscription,
  useOnObjectUpdatedSubscription,
  OnPlanetNodeStatusUpdateSubscription,
  useOnPlanetNodeStatusUpdateSubscription,
  useOnGameServerUpdateSubscription,
  OnGameServerUpdateSubscription,
  useOnPlanetFrameEndSubscription,
  OnPlanetFrameEndSubscription,
} from './DataProvider.queries';

interface ObjectFilters {
  objectLevel: [minimum: number, maximum: number];
  objectTypes: number[];
  serverIds: number[];
  aiActivity: number[];
  CRC: number;
  showHibernating: boolean;
}

interface ClientGameServerProperties {
  color: string;
}

interface ClientObjectProperties {
  visible: boolean;
}

export type PlanetWatcherObject = OnObjectUpdatedSubscription['planetWatcherObject'][number] & ClientObjectProperties;
export type NodeStatus = OnPlanetNodeStatusUpdateSubscription['planetWatcherNodeStatus'][number];
export type GameServerStatus = OnGameServerUpdateSubscription['planetWatcherGameServerStatus'][number] &
  ClientGameServerProperties;

export type FrameEnd = OnPlanetFrameEndSubscription['planetWatcherFrameEnd'][number];

interface ObjectUpdateMessage {
  type: 'UPDATED' | 'DELETED' | 'CREATED';
  data: PlanetWatcherObject;
  prevData?: PlanetWatcherObject;
}

interface NodeStatusMessage {
  type: 'UPDATED';
  data: NodeStatus;
}

interface GameServerMessage {
  type: 'UPDATED';
  data: GameServerStatus;
}

interface FrameEndMessage {
  type: 'UPDATED';
  data: FrameEnd;
}

const initialFilterState: ObjectFilters = {
  objectLevel: [0, 100],
  objectTypes: [],
  serverIds: [],
  aiActivity: [],
  CRC: 0,
  showHibernating: true,
};

const fakeDispatch: React.Dispatch<ReducerActionOptions> = () => {
  // Do nothing
};

const createInitialData = () => ({
  objects: new Map<PlanetWatcherObject['networkId'], PlanetWatcherObject>(),
  objectUpdates: new Subject<ObjectUpdateMessage>(),
  nodeStatus: new Map<string, NodeStatus>(),
  nodeUpdates: new Subject<NodeStatusMessage>(),
  gameServerStatus: new Map<number, GameServerStatus>(),
  gameServerUpdates: new Subject<GameServerMessage>(),
  frameEndUpdates: new Subject<FrameEndMessage>(),
  planet: 'tatooine',
  objectFilters: initialFilterState,
  dispatch: fakeDispatch,
});

export type DataProviderContextData = ReturnType<typeof createInitialData>;

export const PlanetWatcherContext = React.createContext(createInitialData());

export const OBJECT_UPDATES_SUBSCRIPTION = gql`
  subscription OnObjectUpdated($clientID: ID!, $planet: ID!) {
    planetWatcherObject(clientId: $clientID, planet: $planet) {
      networkId
      deleteObject
      location
      objectTypeTag
      templateCrc
      interestRadius
      authoritativeServer
      level
      hibernating
      aiActivity
      creationType
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
      subscriptions
    }
  }
`;

export const GAMESERVER_UPDATES_SUBSCRIPTION = gql`
  subscription OnGameServerUpdate($clientID: ID!, $planet: ID!) {
    planetWatcherGameServerStatus(clientId: $clientID, planet: $planet) {
      serverId
      ipAddress
      isOnline
      sceneId
      systemPid
      hostName
    }
  }
`;

export const FRAMEEND_SUBSCRIPTION = gql`
  subscription OnPlanetFrameEnd($clientID: ID!, $planet: ID!) {
    planetWatcherFrameEnd(clientId: $clientID, planet: $planet) {
      serverId
      frameTime
    }
  }
`;

interface DataProviderProps {
  planet: string;
  children: React.ReactNode;
}

interface ReducerClearAll {
  type: 'CLEAR_DATA';
  planet: string;
}

interface ReducerUpdateFilters {
  type: 'UPDATE_FILTERS';
  newFilters: ObjectFilters;
}

type ReducerActionOptions = ReducerClearAll | ReducerUpdateFilters;

const isObjectVisible = (obj: Omit<PlanetWatcherObject, 'visible'>, filterState: ObjectFilters): boolean => {
  if (obj.level < filterState.objectLevel[0]) return false;

  if (obj.level > filterState.objectLevel[1]) return false;

  if (obj.hibernating > 0 && filterState.showHibernating === false) return false;

  if (filterState.aiActivity.length > 0 && !filterState.aiActivity.includes(obj.aiActivity)) return false;

  if (filterState.CRC !== 0 && filterState.CRC !== obj.templateCrc) return false;

  if (filterState.objectTypes.length > 0 && !filterState.objectTypes.includes(obj.objectTypeTag)) return false;

  if (filterState.serverIds.length > 0 && !filterState.serverIds.includes(obj.authoritativeServer)) return false;

  return true;
};

const reducer: React.Reducer<ReturnType<typeof createInitialData>, ReducerActionOptions> = (state, action) => {
  switch (action.type) {
    case 'CLEAR_DATA':
      // for (const obj of state.objects.values()) {
      //   state.objectUpdates.next({
      //     type: 'DELETED',
      //     data: obj,
      //   });
      // }

      return { ...createInitialData(), objectFilters: state.objectFilters, planet: action.planet };
    case 'UPDATE_FILTERS':
      // When updating the filters, first we need to loop over the object map and update
      // the filtered object map, sending objectUpdates as we go.
      for (const [, obj] of state.objects.entries()) {
        const previouslyVisible = obj.visible;

        obj.visible = isObjectVisible(obj, action.newFilters);

        if (previouslyVisible !== obj.visible) {
          if (obj.visible) {
            state.objectUpdates.next({
              type: 'CREATED',
              data: obj,
            });
          } else {
            state.objectUpdates.next({
              type: 'DELETED',
              data: obj,
            });
          }
        }
      }

      return { ...state, objectFilters: action.newFilters };

    default:
      throw new Error('Unrecognised Reducer Action');
  }
};

const DataProvider: React.FC<DataProviderProps> = ({ children, planet }) => {
  const [data, dispatch] = useReducer(reducer, createInitialData());
  const gameServerIndex = useRef(0);
  const [clientId] = useState(Math.floor(Math.random() * 1000000).toString(36));

  useEffect(() => {
    dispatch({ type: 'CLEAR_DATA', planet });
    gameServerIndex.current = 0;
  }, [planet]);

  useOnGameServerUpdateSubscription({
    fetchPolicy: 'no-cache',
    variables: {
      clientID: clientId,
      planet,
    },
    onSubscriptionData: opt => {
      if (opt.subscriptionData.data) {
        opt.subscriptionData.data.planetWatcherGameServerStatus.forEach(gameServer => {
          const previousNodeStatus = data.gameServerStatus.get(gameServer.serverId);

          const gsWithClientData = {
            ...gameServer,
            color: previousNodeStatus?.color ?? colorPalette[gameServerIndex.current % colorPalette.length],
          };

          if (previousNodeStatus === undefined) {
            gameServerIndex.current += 1;
          }

          data.gameServerStatus.set(gameServer.serverId, gsWithClientData);
          data.gameServerUpdates.next({
            type: 'UPDATED',
            data: gsWithClientData,
          });
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

  useOnObjectUpdatedSubscription({
    fetchPolicy: 'no-cache',
    variables: {
      clientID: clientId,
      planet,
    },
    onSubscriptionData: opt => {
      if (opt.subscriptionData.data) {
        opt.subscriptionData.data.planetWatcherObject.forEach(objectUpdate => {
          const isVisible = isObjectVisible(objectUpdate, data.objectFilters);

          const objectUpdateWithVisibility: PlanetWatcherObject = {
            ...objectUpdate,
            visible: isVisible,
          };

          if (objectUpdate.deleteObject > 0) {
            data.objects.delete(objectUpdate.networkId);
            if (isVisible) {
              data.objectUpdates.next({
                type: 'DELETED',
                data: objectUpdateWithVisibility,
              });
            }
          } else {
            const prevObject = data.objects.get(objectUpdate.networkId);
            const isUpdate = prevObject !== undefined;

            data.objects.set(objectUpdate.networkId, objectUpdateWithVisibility);
            if (isVisible) {
              if (isUpdate) {
                // Updated
                data.objectUpdates.next({
                  type: 'UPDATED',
                  data: objectUpdateWithVisibility,
                  prevData: prevObject,
                });
              } else {
                // Created
                data.objectUpdates.next({
                  type: 'CREATED',
                  data: objectUpdateWithVisibility,
                });
              }
            }
          }
        });
      }
    },
  });

  useOnPlanetFrameEndSubscription({
    fetchPolicy: 'no-cache',
    variables: {
      clientID: clientId,
      planet,
    },
    onSubscriptionData: opt => {
      if (!opt.subscriptionData.data) return;

      opt.subscriptionData.data.planetWatcherFrameEnd.forEach(fe => {
        data.frameEndUpdates.next({
          type: 'UPDATED',
          data: fe,
        });
      });
    },
  });

  Object.assign(data, { dispatch });

  return <PlanetWatcherContext.Provider value={data}>{children}</PlanetWatcherContext.Provider>;
};

export default DataProvider;
