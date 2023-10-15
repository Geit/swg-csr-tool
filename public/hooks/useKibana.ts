import { useContext } from 'react';

import { KibanaCoreServicesContext } from '../components/KibanaCoreServicesContext';

export const useKibana = () => {
  return useContext(KibanaCoreServicesContext);
};
