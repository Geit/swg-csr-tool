import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, defaultDataIdFromObject, split, HttpLink } from '@apollo/client';
import { QueryParamProvider } from 'use-query-params';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Redirect } from 'react-router';

import { CoreStart, ScopedHistory } from '../../../../src/core/public';

import ObjectSearch from './pages/ObjectSearch';
import ObjectDetails from './pages/ObjectDetails';
import PlanetWatcherPage from './pages/PlanetWatcherPage';

interface CSRToolAppProps {
  http: CoreStart['http'];
  uiSettings: CoreStart['uiSettings'];
  history: ScopedHistory;
}

export default function CSRToolApp(props: CSRToolAppProps) {
  const uri = `${location.host}${props.http.basePath.prepend(`/api/swg_csr_tool/graphql`)}`;

  const wsLink = new WebSocketLink({
    uri: props.uiSettings.get('csrToolWebsocketUrl'),
    options: {
      reconnect: true,
      lazy: true,
      connectionParams: async () => {
        const result = await props.http.post('/api/swg_csr_tool/graphql/websocket_auth', { body: '{ "auth": 1}' });

        return result;
      },
    },
  });

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

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
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
            object(_, { args, toReference }) {
              return toReference({
                __typename: 'IServerObject',
                id: args!.objectId,
              });
            },
          },
        },
      },
    }),
  });

  return (
    <ApolloProvider client={client}>
      <Router history={props.history}>
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
  );
}
