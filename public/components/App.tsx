import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { QueryParamProvider } from 'use-query-params';
import { Redirect } from 'react-router';
import { EuiErrorBoundary, EuiThemeProvider } from '@elastic/eui';
import { I18nProvider } from '@kbn/i18n-react';

import { CoreStart, ScopedHistory } from '../../../../src/core/public';
import { AppPluginStartDependencies } from '../types';
import { ReactRouter5Adapter } from '../utils/useQueryParamReactAdapter';

import { GalaxySearch } from './pages/GalaxySearch';
import { ObjectDetails } from './pages/ObjectDetails/ObjectDetails';
import { AccountDetails } from './pages/AccountDetails';
import { PlanetWatcher } from './pages/PlanetWatcher';
import { KibanaCoreServicesProvider } from './KibanaCoreServicesContext';
import { CoalitionListings } from './pages/CoalitionListings';
import { CityDetails } from './pages/CityDetails';
import { GuildDetails } from './pages/GuildDetails';
import { Trades } from './pages/Trades';
import { TradeRollupPage } from './pages/TradeRollupPage';
import { TradeReport } from './pages/TradeReport';
import { ResourceDetails } from './pages/ResourceDetails';
import { ResourceListing } from './pages/ResourceListing';
import { createApolloClient } from './apolloClient';

interface CSRToolAppProps {
  coreServices: CoreStart;
  history: ScopedHistory;
  injectedPlugins: AppPluginStartDependencies;
}

export default function CSRToolApp({ coreServices, history, injectedPlugins }: CSRToolAppProps) {
  const client = createApolloClient(coreServices);

  return (
    <EuiErrorBoundary>
      <I18nProvider>
        <KibanaCoreServicesProvider coreServices={coreServices} injectedPlugins={injectedPlugins}>
          <EuiThemeProvider colorMode={coreServices.uiSettings.get('theme:darkMode') ? 'dark' : 'light'}>
            <ApolloProvider client={client}>
              <Router history={history}>
                <QueryParamProvider adapter={ReactRouter5Adapter} options={{ removeDefaultsFromUrl: true }}>
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
                      <PlanetWatcher />
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

                    <Route path="/trades/">
                      <Trades />
                    </Route>

                    <Route path="/trade-rollup">
                      <TradeRollupPage />
                    </Route>

                    <Route path="/trade-report">
                      <TradeReport />
                    </Route>

                    <Route path="/resources/:id">
                      <ResourceDetails />
                    </Route>
                    <Route path="/resources">
                      <ResourceListing />
                    </Route>
                  </Switch>
                </QueryParamProvider>
              </Router>
            </ApolloProvider>
          </EuiThemeProvider>
        </KibanaCoreServicesProvider>
      </I18nProvider>
    </EuiErrorBoundary>
  );
}
