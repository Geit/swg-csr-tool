import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiSelect, EuiSpacer, EuiTabbedContent } from '@elastic/eui';
import React from 'react';
import { useHistory } from 'react-router';

import DataProvider from './DataProvider';
import ObjectSummary from './ObjectSummary';
import ServerSummary from './ServerSummary';
import WorldViewerThree from './MapView/WorldViewerThree';
import ObjectDetailsAside from './ObjectDetailsAside';
import mapConfigs from './data/maps';

interface PlanetWatcherMapViewProps {
  planet: string;
}

const PlanetWatcherMapView: React.FC<PlanetWatcherMapViewProps> = ({ planet }) => {
  const history = useHistory();

  const maps = mapConfigs.map(map => ({
    value: map.id,
    text: map.displayName,
  }));

  return (
    <DataProvider planet={planet}>
      <ObjectDetailsAside />
      <EuiFlexGroup>
        <EuiFlexItem grow={10} style={{ height: '89vh' }}>
          <WorldViewerThree key={planet} />
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFormRow label="Planet" hasChildLabel={false}>
            <EuiSelect
              options={maps}
              value={planet}
              onChange={e => {
                history.push(`/planets/${e.target.value}`);
              }}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
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
