import React from 'react';
import ReactDOM from 'react-dom';

import { AppMountParameters, CoreStart } from '../../../src/core/public';

import { AppPluginStartDependencies } from './types';
import SwgCsrToolApp from './components/App';

export const renderApp = (
  { http, uiSettings }: CoreStart,
  _injectedPlugins: AppPluginStartDependencies,
  { appBasePath, element, history }: AppMountParameters
) => {
  ReactDOM.render(
    <SwgCsrToolApp basename={appBasePath} http={http} history={history} uiSettings={uiSettings} />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
