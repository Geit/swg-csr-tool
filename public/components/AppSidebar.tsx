import { EuiPageSidebar, EuiSideNav, EuiSideNavItemType } from '@elastic/eui';
import React, { MouseEventHandler, useState } from 'react';
import { useHistory } from 'react-router';

import { useKibana } from '../hooks/useKibana';

import mapConfigs from './PlanetWatcher/data/maps';

const AppSidebar: React.FC = () => {
  const history = useHistory();
  const coreServices = useKibana();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const appUrl = coreServices?.application.getUrlForApp('swgCsrTool');

  const navItems: EuiSideNavItemType<unknown>[] = [
    {
      name: 'Galaxy Search',
      id: 'galaxySearch',
      href: `${appUrl}/search`,
      icon: <span>🔍</span>,
    },
    {
      name: 'Logs',
      id: 'logSearch',
      href: `${appUrl}/logs`,
      icon: <span>🪵</span>,
    },
    {
      name: 'Coalitions',
      id: 'coalitionListings',
      items: [
        {
          id: 'guilds',
          name: 'Guilds',
          href: `${appUrl}/coalitions/guilds`,
        },
        {
          id: 'cities',
          name: 'Cities',
          href: `${appUrl}/coalitions/cities`,
        },
      ],
      icon: <span>👯</span>,
    },
    {
      name: 'Trades',
      id: 'tradeListings',
      items: [
        {
          id: 'all-trades',
          name: 'All Trades',
          href: `${appUrl}/trades`,
        },
        {
          id: 'rollup-trades',
          name: 'Trade Rollup',
          href: `${appUrl}/trade-rollup`,
        },
        {
          id: 'trade-report',
          name: 'Trade Report',
          href: `${appUrl}/trade-report`,
        },
      ],
      icon: <span>🪙</span>,
    },
    {
      name: 'Resources',
      id: 'resourceListings',
      icon: <span>⛏️</span>,
      items: [
        {
          id: 'current-resources',
          name: 'Current Spawns',
          href: `${appUrl}/resources`,
        },
      ],
    },
    {
      name: 'Auctions',
      id: 'marketListings',
      items: [
        {
          id: 'current-resources',
          name: 'Bazaar',
        },
        {
          id: 'historical-resources',
          name: 'Player Vendors',
        },
      ],
      icon: <span>🏛️</span>,
    },
    {
      name: 'Planet Watcher',
      id: 'planetWatcher',

      items: mapConfigs
        .filter(m => m.raster && m.planetMap?.size === 16384)
        .map(map => ({
          id: map.id,
          name: map.displayName,
          href: `${appUrl}/planets/${map.id}`,
        })),
      icon: <span>🌍</span>,
    },
  ].filter(item => Boolean(coreServices?.application?.capabilities?.[item.id]?.show));

  const addClickHandlers = (i: EuiSideNavItemType<unknown>) => {
    if (i.items) {
      // eslint-disable-next-line no-param-reassign
      i.items = i.items.map(addClickHandlers);
    }

    if (!i.href) return i;

    const onClick: MouseEventHandler = evt => {
      if (evt.shiftKey || evt.ctrlKey || evt.button === 1) return;

      evt.preventDefault();
      history.push(i.href!.replace(appUrl!, ''));
    };

    return {
      ...i,
      onClick,
    };
  };

  const navItemsWithHandlers = navItems.map(addClickHandlers);

  return (
    <EuiPageSidebar paddingSize="l">
      <EuiSideNav
        mobileTitle="SWG CSR Tool"
        isOpenOnMobile={mobileNavOpen}
        toggleOpenOnMobile={() => setMobileNavOpen(val => !val)}
        items={navItemsWithHandlers}
      />
    </EuiPageSidebar>
  );
};

export default AppSidebar;
