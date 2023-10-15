import React, { createContext } from 'react';
import { Storage } from '@kbn/kibana-utils-plugin/public';

import { CoreStart } from '../../../../src/core/public';
import { AppPluginStartDependencies } from '../types';

interface KibanaCoreServicesContextContents extends CoreStart, AppPluginStartDependencies {
  storage: Storage;
}

export const KibanaCoreServicesContext = createContext<KibanaCoreServicesContextContents>({} as any);

export const KibanaCoreServicesProvider: React.FC<
  KibanaCoreServicesContextContents & { children: React.ReactNode }
> = ({ children, ...args }) => {
  return (
    <KibanaCoreServicesContext.Provider
      value={{
        ...args,
      }}
    >
      {children}
    </KibanaCoreServicesContext.Provider>
  );
};
