import React, { createContext } from 'react';

import { CoreStart } from '../../../../src/core/public';

interface KibanaCoreServicesContextContents {
  coreServices?: CoreStart;
}

export const KibanaCoreServicesContext = createContext<KibanaCoreServicesContextContents>({});

export const KibanaCoreServicesProvider: React.FC<KibanaCoreServicesContextContents & { children: React.ReactNode }> =
  ({ coreServices, children }) => {
    return (
      <KibanaCoreServicesContext.Provider
        value={{
          coreServices,
        }}
      >
        {children}
      </KibanaCoreServicesContext.Provider>
    );
  };
