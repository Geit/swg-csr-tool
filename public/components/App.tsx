import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, defaultDataIdFromObject } from '@apollo/client';
import { QueryParamProvider } from 'use-query-params';

import { CoreStart } from '../../../../src/core/public';

import ObjectSearch from './pages/ObjectSearch';
import ObjectDetails from './pages/ObjectDetails';

interface CSRToolAppProps {
  basename: string;
  http: CoreStart['http'];
}

export default function CSRToolApp(props: CSRToolAppProps) {
  const client = new ApolloClient({
    uri: props.http.basePath.prepend(`/api/swg_csr_tool/graphql`),
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
      <Router basename={props.basename}>
        <QueryParamProvider ReactRouterRoute={Route}>
          <Switch>
            <Route path="/search">
              <ObjectSearch />
            </Route>
            <Route path="/object/:id">
              <ObjectDetails />
            </Route>
          </Switch>
        </QueryParamProvider>
      </Router>
    </ApolloProvider>
  );
}
