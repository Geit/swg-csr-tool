import { EuiPageSideBar, EuiSideNav, EuiSideNavItemType } from '@elastic/eui';
import React, { MouseEventHandler } from 'react';
import { useHistory } from 'react-router';

import { useKibana } from '../hooks/useKibana';

import mapConfigs from './PlanetWatcher/data/maps';

const AppSidebar: React.FC = () => {
  const history = useHistory();
  const coreServices = useKibana();
  const appUrl = coreServices?.application.getUrlForApp('swgCsrTool');

  const navItems: EuiSideNavItemType<unknown>[] = [
    {
      name: 'Galaxy Search',
      id: 'galaxySearch',
      href: '/search',
      icon: <span>🔍</span>,
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
          id: 'suspicious-trades',
          name: 'Suspicious Trades',
        },
        {
          id: 'rollup-trades',
          name: 'Trade Rollup',
        },
      ],
      icon: <span>🪙</span>,
    },
    {
      name: 'Resources',
      id: 'resourceListings',
      items: [
        {
          id: 'current-resources',
          name: 'Current Spawns',
        },
        {
          id: 'historical-resources',
          name: 'Historical Spawns',
        },
      ],
      icon: <span>⛏️</span>,
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
  ].filter(item => Boolean(coreServices?.application?.capabilities?.[item.id]?.['show']));

  const addClickHandlers = (i: EuiSideNavItemType<unknown>) => {
    if (i.items) {
      // eslint-disable-next-line no-param-reassign
      i.items = i.items.map(addClickHandlers);
    }

    if (!i.href) return i;

    const onClick: MouseEventHandler = evt => {
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
    <EuiPageSideBar paddingSize="m">
      <EuiSideNav mobileTitle="SWG CSR Tool" isOpenOnMobile={true} items={navItemsWithHandlers} />
    </EuiPageSideBar>
  );
};

export default AppSidebar;
