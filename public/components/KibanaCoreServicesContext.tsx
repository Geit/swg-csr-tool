import React, { createContext } from 'react';

import { CoreStart } from '../../../../src/core/public';
import { AppPluginStartDependencies } from '../types';

interface KibanaCoreServicesContextContents {
  coreServices?: CoreStart;
  injectedPlugins?: AppPluginStartDependencies;
}

export const KibanaCoreServicesContext = createContext<KibanaCoreServicesContextContents>({});

export const KibanaCoreServicesProvider: React.FC<
  KibanaCoreServicesContextContents & { children: React.ReactNode }
> = ({ coreServices, injectedPlugins, children }) => {
  return (
    <KibanaCoreServicesContext.Provider
      value={{
        coreServices,
        injectedPlugins,
      }}
    >
      {children}
    </KibanaCoreServicesContext.Provider>
  );
};
