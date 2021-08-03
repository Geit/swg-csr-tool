import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import React from 'react';

import DataProvider from './DataProvider';
import ObjectSummary from './ObjectSummary';
import WorldViewerThree from './MapView/WorldViewerThree';
import ObjectDetailsAside from './ObjectDetailsAside';

interface PlanetWatcherMapViewProps {
  planet: string;
}

const PlanetWatcherMapView: React.FC<PlanetWatcherMapViewProps> = ({ planet }) => {
  return (
    <DataProvider planet={planet}>
      <ObjectDetailsAside />
      <EuiFlexGroup>
        <EuiFlexItem grow={10} style={{ height: '89vh' }}>
          <WorldViewerThree key={planet} />
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <ObjectSummary />
        </EuiFlexItem>
      </EuiFlexGroup>
    </DataProvider>
  );
};

export default PlanetWatcherMapView;
