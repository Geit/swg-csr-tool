import { useContext } from 'react';

import { KibanaCoreServicesContext } from '../components/KibanaCoreServicesContext';

export const useKibanaPlugins = () => {
  return useContext(KibanaCoreServicesContext);
};
