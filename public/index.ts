import './index.scss';

import { SwgCsrToolPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new SwgCsrToolPlugin();
}
export type { SwgCsrToolPluginSetup, SwgCsrToolPluginStart } from './types';
