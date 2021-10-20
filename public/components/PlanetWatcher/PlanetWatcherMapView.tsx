import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTab, EuiTabbedContent, EuiTabs } from '@elastic/eui';
import React from 'react';

import DataProvider from './DataProvider';
import ObjectSummary from './ObjectSummary';
import ServerSummary from './ServerSummary';
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
          <EuiTabbedContent
            size="s"
            display="condensed"
            tabs={[
              {
                id: 'server-summary',
                name: 'Server Details',
                content: (
                  <>
                    <EuiSpacer />
                    <ServerSummary />
                  </>
                ),
              },
              {
                id: 'object-filters',
                name: 'Object Filters',
                content: (
                  <>
                    <EuiSpacer />
                    <ObjectSummary />
                  </>
                ),
              },
            ]}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </DataProvider>
  );
};

export default PlanetWatcherMapView;
