import React from 'react';
import ReactDOM from 'react-dom';

import { AppMountParameters, CoreStart } from '../../../src/core/public';

import { AppPluginStartDependencies } from './types';
import SwgCsrToolApp from './components/App';

export const renderApp = (
  coreServices: CoreStart,
  injectedPlugins: AppPluginStartDependencies,
  { appBasePath, element, history }: AppMountParameters
) => {
  ReactDOM.render(
    <SwgCsrToolApp history={history} coreServices={coreServices} injectedPlugins={injectedPlugins} />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
