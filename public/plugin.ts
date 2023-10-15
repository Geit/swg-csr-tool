import { BehaviorSubject } from 'rxjs';

import {
  AppMountParameters,
  AppNavLinkStatus,
  AppUpdater,
  CoreSetup,
  CoreStart,
  Plugin,
} from '../../../src/core/public';
import { APP_CATEGORY } from '../common';

import { SwgCsrToolPluginSetup, SwgCsrToolPluginStart, AppPluginStartDependencies } from './types';

export class SwgCsrToolPlugin implements Plugin<SwgCsrToolPluginSetup, SwgCsrToolPluginStart> {
  private appUpdater = new BehaviorSubject<AppUpdater>(() => ({}));

  public setup(core: CoreSetup, plugins: AppPluginStartDependencies): SwgCsrToolPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'swgCsrTool',
      title: 'SWG CSR Tooling',
      appRoute: '/app/swgCsrTool',
      category: APP_CATEGORY,
      navLinkStatus: AppNavLinkStatus.hidden,
      updater$: this.appUpdater,
      deepLinks: [
        {
          id: 'galaxySearch',
          title: 'Galaxy Search',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/search',
        },
        {
          id: 'logSearch',
          title: 'Log Search',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/logs',
        },
        {
          id: 'coalitionListings',
          title: 'Coalition Listings',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/coalitions',
        },
        {
          id: 'tradeListings',
          title: 'Trades',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/trades',
        },
        {
          id: 'resourceListings',
          title: 'Resources',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/resources',
        },
        {
          id: 'marketListings',
          title: 'Auctions',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/markets',
        },
        {
          id: 'planetWatcher',
          title: 'Planet Watcher',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/planets',
        },
      ],
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart, deps: AppPluginStartDependencies): SwgCsrToolPluginStart {
    this.appUpdater.next(app => ({
      navLinkStatus: AppNavLinkStatus.hidden,
      deepLinks: app.deepLinks?.map(dl => ({
        ...dl,
        navLinkStatus: core.application.capabilities[dl.id]?.show ? AppNavLinkStatus.visible : AppNavLinkStatus.hidden,
      })),
    }));

    return {};
  }

  public stop() {
    // Do nothing
  }
}
