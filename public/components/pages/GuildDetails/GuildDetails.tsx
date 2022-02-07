import React, { useContext, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { KibanaCoreServicesContext } from '../../KibanaCoreServicesContext';
import SimpleValue from '../../SimpleValue';
import ObjectLink from '../../ObjectLink';

import { useGetGuildDetailsQuery } from './GuildDetails.queries';
import { GuildMembersTable } from './GuildMembersTable';
import { GuildEnemiesTable } from './GuildEnemiesTable';

export const GET_GUILD_DETAILS = gql`
  query getGuildDetails($guildId: String!) {
    guild(guildId: $guildId) {
      id
      name
      abbreviation
      faction
      gcwDefenderRegionResolved
      leader {
        id
        resolvedName
      }
    }
  }
`;

export const GuildDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { coreServices } = useContext(KibanaCoreServicesContext);
  const { data, loading } = useGetGuildDetailsQuery({
    variables: {
      guildId: id,
    },
    returnPartialData: true,
  });

  const guildName = data?.guild?.name;

  useEffect(() => {
    const title = [guildName, `Guild Details`].filter(Boolean).join(' - ');

    coreServices?.chrome.docTitle.change(title);

    if (guildName) {
      coreServices?.chrome.recentlyAccessed.add(
        `/app/swgCsrTool/coalitions/guilds/${id}`,
        title,
        `guild-details-${id}`
      );
    }
  }, [coreServices, guildName]);

  const GuildInformation = [
    {
      title: 'Guild ID',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {data?.guild?.id}
        </SimpleValue>
      ),
    },
    {
      title: 'Leader',
      description: (
        <SimpleValue isLoading={loading}>
          {data?.guild?.leader?.id ? (
            <ObjectLink objectId={data?.guild?.leader?.id} textToDisplay={data?.guild?.leader?.resolvedName} />
          ) : null}
        </SimpleValue>
      ),
    },
    {
      title: 'Faction',
      description: <SimpleValue isLoading={loading}>{data?.guild?.faction}</SimpleValue>,
    },
    {
      title: 'Defender Region',
      description: <SimpleValue isLoading={loading}>{data?.guild?.gcwDefenderRegionResolved}</SimpleValue>,
    },
  ];

  return (
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
        <EuiPageHeaderSection>
          <>
            <EuiTitle size="l">
              <h1>{data?.guild?.name ?? 'Guild Details'}</h1>
            </EuiTitle>
            <EuiText color="subdued">{data?.guild?.abbreviation}</EuiText>
          </>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <EuiPanel color="subdued" hasBorder>
            <EuiDescriptionList className="objectInformationList" textStyle="reverse">
              {GuildInformation.map((item, index) => {
                return (
                  <div key={`container-${index}`}>
                    <EuiDescriptionListTitle key={`title-${index}`}>{item.title}</EuiDescriptionListTitle>
                    <EuiDescriptionListDescription key={`description-${index}`}>
                      {item.description}
                    </EuiDescriptionListDescription>
                  </div>
                );
              })}
            </EuiDescriptionList>
          </EuiPanel>
          <EuiSpacer />
          <GuildMembersTable />
          <EuiSpacer />
          <GuildEnemiesTable />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
