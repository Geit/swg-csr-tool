import React, { useContext, useEffect, useState } from 'react';

import { PlanetWatcherContext } from './DataProvider';

const ObjectSummary: React.FC = () => {
  const data = useContext(PlanetWatcherContext);
  const [objectCount, setObjectCount] = useState(0);

  useEffect(() => {
    const sub = data.objectUpdates.subscribe(() => setObjectCount(data.objects.size));

    return () => sub.unsubscribe();
  }, [data]);

  return <div>Tracking {objectCount} Objects</div>;
};

export default ObjectSummary;
