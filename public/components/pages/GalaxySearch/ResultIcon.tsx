import React from 'react';
import { EuiIcon, IconType } from '@elastic/eui';

import { SearchResult } from '.';

const ObjectIcon: Record<SearchResult['__typename'], IconType> = {
  Account: () => <span>👯</span>,
  BuildingObject: () => <span>🏠</span>,
  CellObject: () => <span>🧔</span>,
  CreatureObject: () => <span>🐕</span>,
  HarvesterInstallationObject: () => <span>🌾</span>,
  InstallationObject: () => <span>🛢️</span>,
  PlayerCreatureObject: () => <span>🧔</span>,
  ManfSchematicObject: () => <span>📘</span>,
  PlayerObject: () => <span>🧔</span>,
  ServerObject: () => <span>❓</span>,
  ResourceContainerObject: () => <span>🧃</span>,
  ShipObject: () => <span>🚀</span>,
  GuildObject: () => <span>👯</span>,
  TangibleObject: () => <span>🪨</span>,
  WeaponObject: () => <span>🔫</span>,
  CityObject: () => <span>🏙️</span>,
  UniverseObject: () => <span>🌌</span>,
  ResourceType: () => <span>⛏️</span>,
};

interface ResultIconProps {
  resultType: SearchResult['__typename'];
}

export const ResultIcon: React.FC<ResultIconProps> = ({ resultType }) => (
  <EuiIcon type={ObjectIcon[resultType] ?? 'questionInCircle'} size="l" className="searchResultCard__icon" />
);
