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
    deps.features.registerKibanaFeature({
      id: 'objectSearch',
      name: 'Object Search',
      order: 0,
      category: APP_CATEGORY,
      app: ['objectSearch'],
      privileges: {
        all: {
          // These privileges should be checked by Kibana when a user accesses the route
          api: ['csrToolGraphQl'],
          app: ['objectSearch'],
          ui: [],
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
          ui: [],
          app: ['objectSearch'],
        },
      },
    });

    deps.features.registerKibanaFeature({
      id: 'planetWatcher',
      name: 'Planet Watcher',
      order: 0,
      category: APP_CATEGORY,
      app: ['planetWatcher'],
      privileges: {
        all: {
          // These privileges should be checked by Kibana when a user accesses the route
          api: ['csrToolGraphQl'],
          app: ['planetWatcher'],
          ui: [],
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
          ui: [],
          app: ['planetWatcher'],
        },
      },
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
