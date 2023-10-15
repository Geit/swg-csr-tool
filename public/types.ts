//import { FeaturesPluginStart } from '../../../x-pack/plugins/features/public';
import { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import { UiActionsStart } from '@kbn/ui-actions-plugin/public';
import { FieldFormatsStart } from '@kbn/field-formats-plugin/public';
import { LensPublicStart } from '@kbn/lens-plugin/public';
import { ExpressionsStart } from '@kbn/expressions-plugin/public';

import { DataPublicPluginStart } from '../../../src/plugins/data/public';

/**
 * Type describing the public API of this plugin to other
 * Kibana plugins that might want to depend on it.
 */
export interface SwgCsrToolPluginSetup {}

/**
 * Type describing the public API of this plugin to other
 * Kibana plugins that might want to depend on it.
 */
export interface SwgCsrToolPluginStart {}

/**
 * Types for any plugin interfaces that this plugin needs to be aware of
 * when it is mounted by Kibana.
 */
export interface AppPluginStartDependencies {
  //navigation: NavigationPublicPluginStart;
  //features: FeaturesPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
  uiActions: UiActionsStart;
  fieldFormats: FieldFormatsStart;
  lens: LensPublicStart;
  expressions: ExpressionsStart;
}
