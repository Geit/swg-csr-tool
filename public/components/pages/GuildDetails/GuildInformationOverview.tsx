import React from 'react';
import { gql } from '@apollo/client';
import { EuiPanel, EuiDescriptionList, EuiDescriptionListTitle, EuiDescriptionListDescription } from '@elastic/eui';

import SimpleValue from '../../SimpleValue';
import ObjectLink from '../../ObjectLink';

import { useGetGuildDetailsQuery } from './GuildInformationOverview.queries';

export const GET_GUILD_DETAILS = gql`
  query getGuildDetails($guildId: String!) {
    guild(guildId: $guildId) {
      id
      faction
      gcwDefenderRegionResolved
      leader {
        id
        resolvedName
      }
    }
  }
`;

interface GuildInformationOverviewProps {
  guildId: string;
}

export const GuildInformationOverview: React.FC<GuildInformationOverviewProps> = ({ guildId }) => {
  const { data, loading } = useGetGuildDetailsQuery({
    variables: {
      guildId,
    },
    returnPartialData: true,
  });

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
  );
};
