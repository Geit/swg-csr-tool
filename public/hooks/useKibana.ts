import { useContext } from 'react';

import { KibanaCoreServicesContext } from '../components/KibanaCoreServicesContext';

export const useKibana = () => {
  const { coreServices } = useContext(KibanaCoreServicesContext);

  return coreServices;
};
