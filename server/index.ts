import { schema, TypeOf } from '@kbn/config-schema';

import { PluginInitializerContext, PluginConfigDescriptor } from '../../../src/core/server';

import { SwgCsrToolPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext) {
  return new SwgCsrToolPlugin(initializerContext);
}

const configSchema = schema.object({
  graphqlUrl: schema.string({ defaultValue: 'http://localhost:4000/' }),
});

type ConfigType = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<ConfigType> = {
  exposeToBrowser: {
    graphqlUrl: true,
  },
  schema: configSchema,
};

export type { SwgCsrToolPluginSetup, SwgCsrToolPluginStart } from './types';
