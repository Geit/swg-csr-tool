import React, { useContext, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiTitle,
  EuiPageSideBar,
  EuiSelect,
  EuiFormRow,
} from '@elastic/eui';
import { useHistory, useParams } from 'react-router-dom';

import { PlanetWatcherMapView } from '../PlanetWatcher';
import mapConfigs from '../PlanetWatcher/data/maps';
import { KibanaCoreServicesContext } from '../KibanaCoreServicesContext';

const PlanetWatcherPage: React.FC = () => {
  const history = useHistory();
  const { planet } = useParams<{ planet: string }>();
  const { coreServices } = useContext(KibanaCoreServicesContext);

  const maps = mapConfigs.map(map => ({
    value: map.id,
    text: map.displayName,
  }));

  useEffect(() => {
    const currentMapName = maps.find(map => map.value === planet)?.text;

    const title = [currentMapName, `Planet Watcher`].filter(Boolean).join(' - ');

    coreServices?.chrome.docTitle.change(title);
    coreServices?.chrome.recentlyAccessed.add(`/app/swgCsrTool/planets/${planet}`, title, `planet-watcher-${planet}`);
  }, [coreServices, planet]);

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
