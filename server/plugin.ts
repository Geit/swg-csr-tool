import { schema } from '@kbn/config-schema';

import { PluginInitializerContext, CoreSetup, Plugin, Logger } from '../../../src/core/server';
import type { PluginSetupContract as FeaturesPluginSetup } from '../../../x-pack/plugins/features/server';
import { APP_CATEGORY } from '../common';

import { SwgCsrToolPluginSetup, SwgCsrToolPluginStart } from './types';
import { defineRoutes } from './routes';

interface CsrToolSetupDeps {
  features: FeaturesPluginSetup;
}

export class SwgCsrToolPlugin implements Plugin<SwgCsrToolPluginSetup, SwgCsrToolPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup, deps: CsrToolSetupDeps) {
    const sharedPrivileges = {
      all: {
        // These privileges should be checked by Kibana when a user accesses the route
        api: ['csrToolGraphQl'],
        app: ['swgCsrTool'],
        ui: ['show'],
        savedObject: {
          all: [],
          read: [],
        },
      },
      read: {
        api: ['csrToolGraphQl'],
        savedObject: {
          all: [],
          read: [],
        },
        ui: ['show'],
        app: ['swgCsrTool'],
      },
    };

    deps.features.registerKibanaFeature({
      id: 'galaxySearch',
      name: 'Galaxy Search',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'logSearch',
      name: 'Logs',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'planetWatcher',
      name: 'Planet Watcher',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'sessionListings',
      name: 'Session Listings',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'coalitionListings',
      name: 'Coalition Listings',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'tradeListings',
      name: 'Trades',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'resourceListings',
      name: 'Resources',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    deps.features.registerKibanaFeature({
      id: 'marketListings',
      name: 'Auctions',
      order: 0,
      category: APP_CATEGORY,
      app: ['swgCsrTool'],
      privileges: sharedPrivileges,
    });

    this.logger.debug('swgCsrTool: Setup');
    core.uiSettings.register({
      csrToolGraphQlUrl: {
        name: 'GraphQL URL',
        category: ['CSR Tool'],
        description: 'The URL of the swg-graphql instance to use for CSR tool',
        value: 'http://localhost:4000/graphql',
        schema: schema.uri(),
      },
    });

    core.uiSettings.register({
      csrToolWebsocketUrl: {
        name: 'GraphQL Websocket URL',
        category: ['CSR Tool'],
        description: 'The URL of the swg-graphql instance to use for websocket/livedata connections',
        value: 'ws://localhost:4000/graphql',
        schema: schema.uri(),
      },
    });

    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start() {
    this.logger.debug('swgCsrTool: Started');
    return {};
  }

  public stop() {
    // Do nothing
  }
}
