import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  defaultDataIdFromObject,
  split,
  HttpLink,
  concat,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { QueryParamProvider } from 'use-query-params';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Redirect } from 'react-router';
import { EuiErrorBoundary } from '@elastic/eui';

import { CoreStart, ScopedHistory } from '../../../../src/core/public';
import introspectionResult from '../fragment-possibleTypes.generated.json';

import ObjectSearch from './pages/ObjectSearch';
import ObjectDetails from './pages/ObjectDetails';
import PlanetWatcherPage from './pages/PlanetWatcherPage';
import { KibanaCoreServicesProvider } from './KibanaCoreServicesContext';

interface CSRToolAppProps {
  coreServices: CoreStart;
  history: ScopedHistory;
}

export default function CSRToolApp({ coreServices, history }: CSRToolAppProps) {
  const uri = `${location.host}${coreServices.http.basePath.prepend(`/api/swg_csr_tool/graphql`)}`;

  const wsLink = new WebSocketLink({
    uri: coreServices.uiSettings.get('csrToolWebsocketUrl'),
    options: {
      reconnect: true,
      lazy: true,
      connectionParams: async () => {
        const result = await coreServices.http.post('/api/swg_csr_tool/graphql/websocket_auth', {
          body: '{ "auth": 1}',
        });

        return result;
      },
    },
  });

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
          },
        },
      },
    }),
  });

  return (
    <EuiErrorBoundary>
      <KibanaCoreServicesProvider coreServices={coreServices}>
        <ApolloProvider client={client}>
          <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
              <Switch>
                <Route path="/search">
                  <ObjectSearch />
                </Route>
                <Route path="/object/:id">
                  <ObjectDetails />
                </Route>
                <Route path="/planets/:planet">
                  <PlanetWatcherPage />
                </Route>
                <Redirect exact from="/planets" to="/planets/tatooine" />
              </Switch>
            </QueryParamProvider>
          </Router>
        </ApolloProvider>
      </KibanaCoreServicesProvider>
    </EuiErrorBoundary>
  );
}
