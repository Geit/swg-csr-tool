import { AppMountParameters, AppNavLinkStatus, CoreSetup, Plugin } from '../../../src/core/public';
import { APP_CATEGORY } from '../common';

import { SwgCsrToolPluginSetup, SwgCsrToolPluginStart, AppPluginStartDependencies } from './types';

export class SwgCsrToolPlugin implements Plugin<SwgCsrToolPluginSetup, SwgCsrToolPluginStart> {
  public setup(core: CoreSetup): SwgCsrToolPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'objectSearch',
      title: 'Object Search',
      appRoute: '/app/swgCsrTool',
      defaultPath: '/search',
      category: APP_CATEGORY,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    core.application.register({
      id: 'planetWatcher',
      title: 'Planet Watcher',
      appRoute: '//app/swgCsrTool', // Leading slashes are a dirty hack to let Kibana let us have multiple entries for the same app route.
      defaultPath: '/planets',
      category: APP_CATEGORY,
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
