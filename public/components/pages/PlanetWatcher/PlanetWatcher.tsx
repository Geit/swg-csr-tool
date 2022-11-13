import React from 'react';
import { EuiPage, EuiPageBody, EuiPageSection } from '@elastic/eui';
import { useParams } from 'react-router-dom';

import AppSidebar from '../../AppSidebar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { PlanetWatcherMapView, planetWatcherMapConfigs } from '../../PlanetWatcher';

export const PlanetWatcher: React.FC = () => {
  const { planet } = useParams<{ planet: string }>();

  const maps = planetWatcherMapConfigs.map(map => ({
    value: map.id,
    text: map.displayName,
  }));

  const currentMapName = maps.find(map => map.value === planet)?.text;
  const documentTitle = [currentMapName, `Planet Watcher`].filter(Boolean).join(' - ');
  useDocumentTitle(documentTitle);
  useRecentlyAccessed(`/app/swgCsrTool/planets/${planet}`, documentTitle, `planet-watcher-${planet}`, true);
  useBreadcrumbs([
    {
      text: 'Planet Watcher',
      href: '/planets',
    },
    {
      text: currentMapName,
    },
  ]);

  return (
    <EuiPage paddingSize="none">
      <AppSidebar />
      <EuiPageBody panelled paddingSize="l">
        {/* <EuiPageHeader pageTitle="Planet Watcher" paddingSize="s" /> */}
        <EuiPageSection paddingSize="none" color="transparent">
          <PlanetWatcherMapView planet={planet} />
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};
