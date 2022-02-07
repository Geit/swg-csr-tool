import { AppMountParameters, AppNavLinkStatus, CoreSetup, Plugin } from '../../../src/core/public';
import { APP_CATEGORY } from '../common';

import { SwgCsrToolPluginSetup, SwgCsrToolPluginStart, AppPluginStartDependencies } from './types';

export class SwgCsrToolPlugin implements Plugin<SwgCsrToolPluginSetup, SwgCsrToolPluginStart> {
  public setup(core: CoreSetup): SwgCsrToolPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'swgCsrTool',
      title: 'SWG CSR Tooling',
      appRoute: '/app/swgCsrTool',
      category: APP_CATEGORY,
      navLinkStatus: AppNavLinkStatus.hidden,
      deepLinks: [
        {
          id: 'galaxySearch',
          title: 'Galaxy Search',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/search',
        },
        {
          id: 'planetWatcher',
          title: 'Planet Watcher',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/planets',
        },
        {
          id: 'coalitions',
          title: 'Coalition Listings',
          navLinkStatus: AppNavLinkStatus.visible,
          path: '/coalitions',
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

  public start(/*core: CoreStart*/): SwgCsrToolPluginStart {
    return {};
  }

  public stop() {
    // Do nothing
  }
}
