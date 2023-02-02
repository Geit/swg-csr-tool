import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';
import { ApolloClient, InMemoryCache, defaultDataIdFromObject, split, HttpLink, concat } from '@apollo/client';

import introspectionResult from '../fragment-possibleTypes.generated.json';
import { CoreStart } from '../../../../src/core/public';

export const createApolloClient = (coreServices: CoreStart) => {
  const uri = `${location.host}${coreServices.http.basePath.prepend(`/api/swg_csr_tool/graphql`)}`;

  const wsLink = new GraphQLWsLink(
    createWsClient({
      url: coreServices.uiSettings.get('csrToolWebsocketUrl'),
      connectionParams: async () => {
        const result = await coreServices.http.post('/api/swg_csr_tool/graphql/websocket_auth', {
          body: '{ "auth": 1 }',
        });

        return result;
      },
      lazy: true,
      lazyCloseTimeout: 60 * 1000,
    })
  );

  const retryLink = new RetryLink();

  const httpLink = new HttpLink({
    uri: `${location.protocol}//${uri}`,
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink
  );

  const combinedLink = concat(retryLink, splitLink);

  const client = new ApolloClient({
    link: combinedLink,
    cache: new InMemoryCache({
      possibleTypes: introspectionResult.possibleTypes,
      dataIdFromObject(responseObject) {
        // Collapse all *Object types down into IServerObject
        // This is fine, as different *Object types can never share
        // the same OID.
        if (responseObject.__typename?.endsWith('Object')) {
          return `IServerObject:${responseObject.id}`;
        }

        return defaultDataIdFromObject(responseObject);
      },
      typePolicies: {
        Query: {
          fields: {
            // We should look up cache entries in IServerObject for the object
            // field. This is because we collapsed all subtypes down into this
            // in the dataIdFromObject function.
            object: {
              read(_, { args, toReference }) {
                return toReference({
                  __typename: 'IServerObject',
                  id: args!.objectId,
                });
              },
              keyArgs: ['objectId'],
            },
            account: {
              read(_, { args, toReference }) {
                return toReference({
                  __typename: 'Account',
                  id: args!.stationId,
                });
              },
              keyArgs: ['stationId'],
            },
            city: {
              read(_, { args, toReference }) {
                return toReference({
                  __typename: 'City',
                  id: args!.cityId,
                });
              },
              keyArgs: ['cityId'],
            },
            guild: {
              read(_, { args, toReference }) {
                return toReference({
                  __typename: 'Guild',
                  id: args!.guildId,
                });
              },
              keyArgs: ['guildId'],
            },
            resource: {
              read(_, { args, toReference }) {
                return toReference({
                  __typename: 'ResourceType',
                  id: args!.resourceId,
                });
              },
              keyArgs: ['resourceId'],
            },
          },
        },
      },
    }),
  });

  return client;
};
