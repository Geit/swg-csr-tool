import { useContext } from 'react';

import { KibanaCoreServicesContext } from '../components/KibanaCoreServicesContext';

export const useKibanaPlugins = () => {
  const { injectedPlugins } = useContext(KibanaCoreServicesContext);

  return injectedPlugins;
};
