import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiTitle,
  EuiPageSideBar,
  EuiSelect,
  EuiFormRow,
  EuiListGroup,
} from '@elastic/eui';
import { useHistory, useParams } from 'react-router-dom';

import { PlanetWatcherMapView } from '../PlanetWatcher';
import mapConfigs from '../PlanetWatcher/data/maps';

const PlanetWatcherPage: React.FC = () => {
  const history = useHistory();
  const { planet } = useParams<{ planet: string }>();

  const maps = mapConfigs.map(map => ({
    value: map.id,
    text: map.displayName,
  }));

  return (
    <EuiPage paddingSize="none">
      <EuiPageSideBar paddingSize="l">
        <EuiTitle size="xs">
          <h1>🌍 Planet Watcher</h1>
        </EuiTitle>
        <EuiSpacer />
        <EuiFormRow label="Planet" hasChildLabel={false}>
          <EuiSelect
            options={maps}
            value={planet}
            onChange={e => {
              history.push(`/planets/${e.target.value}`);
            }}
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiListGroup
          style={{ padding: 0 }}
          listItems={[
            {
              id: 'map-view',
              label: 'Map View',
              onClick: () => {
                // Do nothing
              },
              isActive: true,
            },
            {
              id: 'frame-times',
              label: 'Frame Times',
              onClick: () => {
                // Do nothing
              },
            },
          ]}
        />
      </EuiPageSideBar>
      <EuiPageBody panelled>
        {/* <EuiPageHeader pageTitle="Planet Watcher" paddingSize="s" /> */}
        <EuiPageContent hasBorder={false} hasShadow={false} paddingSize="none" color="transparent" borderRadius="none">
          <PlanetWatcherMapView planet={planet} />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default PlanetWatcherPage;
