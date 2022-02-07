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

import GalaxySearch from './pages/GalaxySearch';
import ObjectDetails from './pages/ObjectDetails';
import AccountDetails from './pages/AccountDetails';
import PlanetWatcherPage from './pages/PlanetWatcherPage';
import { KibanaCoreServicesProvider } from './KibanaCoreServicesContext';
import CoalitionListings from './pages/CoalitionListings';
import { CityDetails } from './pages/CityDetails';
import { GuildDetails } from './pages/GuildDetails';

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
                  <GalaxySearch />
                </Route>
                <Route path="/object/:id">
                  <ObjectDetails />
                </Route>
                <Route path="/account/:id">
                  <AccountDetails />
                </Route>
                <Route path="/planets/:planet">
                  <PlanetWatcherPage />
                </Route>
                <Redirect exact from="/planets" to="/planets/kashyyyk_main" />

                <Route path="/coalitions/cities/:id">
                  <CityDetails />
                </Route>
                <Route path="/coalitions/guilds/:id">
                  <GuildDetails />
                </Route>
                <Route path="/coalitions/:type">
                  <CoalitionListings />
                </Route>
                <Redirect exact from="/coalitions" to="/coalitions/guilds" />
              </Switch>
            </QueryParamProvider>
          </Router>
        </ApolloProvider>
      </KibanaCoreServicesProvider>
    </EuiErrorBoundary>
  );
}
