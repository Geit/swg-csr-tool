import React, { useContext, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiCallOut,
  EuiText,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiLoadingSpinner,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
  SortDirection,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { useHistory } from 'react-router';

import { KibanaCoreServicesContext } from '../KibanaCoreServicesContext';

import {
  GetAllCitiesQuery,
  GetAllGuildsQuery,
  useGetAllCitiesQuery,
  useGetAllGuildsQuery,
} from './CoalitionListings.queries';

type Guild = NonNullable<GetAllGuildsQuery['guilds']>[number];
type City = NonNullable<GetAllCitiesQuery['cities']>[number];

export const GET_ALL_CITIES = gql`
  query getAllCities {
    cities {
      id
      name
      planet
      location
      radius
      citizenCount
      structureCount
      mayor {
        id
        resolvedName
      }
    }
  }
`;

export const GET_ALL_GUILDS = gql`
  query getAllGuilds {
    guilds {
      id
      name
      abbreviation
      leader {
        id
        resolvedName
      }
      memberCount
      enemyCount
      faction
      gcwDefenderRegion
    }
  }
`;

const GuildListing: React.FC = () => {
  const { data, loading } = useGetAllGuildsQuery();

  if (loading)
    return (
      <>
        <EuiSpacer />
        <EuiLoadingSpinner />
      </>
    );

  const columns: EuiTableFieldDataColumnType<Guild>[] = [
    {
      field: 'id',
      name: 'id',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/guilds/${record.id}`}>{val}</Link>;
      },
      width: '10ex',
    },
    {
      field: 'abbreviation',
      name: 'Abbreviation',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/guilds/${record.id}`}>{val}</Link>;
      },
      width: '10ex',
    },
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/guilds/${record.id}`}>{val}</Link>;
      },
    },
    {
      field: 'leader.resolvedName',
      name: 'Leader',
      sortable: false,
      truncateText: true,
      dataType: 'string',
    },
    {
      field: 'memberCount',
      name: 'Members',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'enemyCount',
      name: 'Enemies',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
  ];

  const sorting = {
    sort: {
      field: 'memberCount',
      direction: SortDirection.DESC,
    },
  };

  const paginationOptions = { pageSize: 100, hidePerPageOptions: true };

  return (
    <>
      <EuiSpacer />
      <EuiInMemoryTable
        search={{
          box: {
            incremental: true,
          },
        }}
        pagination={paginationOptions}
        items={data?.guilds ?? []}
        columns={columns}
        sorting={sorting}
      />
    </>
  );
};

const CityListing: React.FC = () => {
  const { data, loading } = useGetAllCitiesQuery();

  if (loading)
    return (
      <>
        <EuiSpacer />
        <EuiLoadingSpinner />
      </>
    );

  const columns: EuiTableFieldDataColumnType<City>[] = [
    {
      field: 'id',
      name: 'id',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/cities/${record.id}`}>{val}</Link>;
      },
      width: '10ex',
    },
    {
      field: 'name',
      name: 'name',
      sortable: true,
      truncateText: true,
      render(val, record) {
        return <Link to={`/coalitions/cities/${record.id}`}>{val}</Link>;
      },
    },
    {
      field: 'mayor.resolvedName',
      name: 'Mayor',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'citizenCount',
      name: 'Citzens',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'structureCount',
      name: 'Structures',
      dataType: 'number',
      sortable: true,
      truncateText: true,
    },
  ];

  const sorting = {
    sort: {
      field: 'citizenCount',
      direction: SortDirection.DESC,
    },
  };

  const paginationOptions = { pageSize: 100, hidePerPageOptions: true };

  return (
    <>
      <EuiSpacer />
      <EuiInMemoryTable
        search={{
          box: {
            incremental: true,
          },
        }}
        pagination={paginationOptions}
        items={data?.cities ?? []}
        columns={columns}
        sorting={sorting}
      />
    </>
  );
};

const CoalitionListings: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { coreServices } = useContext(KibanaCoreServicesContext);
  const history = useHistory();

  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'guilds',
      name: 'Guilds',
      content: <GuildListing />,
    },
    {
      id: 'cities',
      name: 'Cities',
      content: <CityListing />,
    },
  ];

  const selectedTab = tabs.find(tab => tab.id === type);
  const selectedTabName = selectedTab?.name;

  useEffect(() => {
    coreServices?.chrome.docTitle.change(`${selectedTabName} Listing`);
  }, [selectedTabName]);

  return (
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Coalitions</h1>
          </EuiTitle>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <EuiTabbedContent
            tabs={tabs}
            selectedTab={selectedTab}
            onTabClick={tab => tab.id !== type && history.push(`/coalitions/${tab.id}`)}
          />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default CoalitionListings;
