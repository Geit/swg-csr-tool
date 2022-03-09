import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiText,
  EuiCallOut,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';

import { useGetGuildNameQuery } from './GuildDetails.queries';
import { GuildMembersTable } from './GuildMembersTable';
import { GuildEnemiesTable } from './GuildEnemiesTable';
import { GuildInformationOverview } from './GuildInformationOverview';

export const GET_GUILD_NAME = gql`
  query getGuildName($guildId: String!) {
    guild(guildId: $guildId) {
      name
      abbreviation
    }
  }
`;

export const GuildDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetGuildNameQuery({
    variables: {
      guildId: id,
    },
    returnPartialData: true,
  });

  const guildName = data?.guild?.name;
  const documentTitle = [guildName, `Guild Details`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useRecentlyAccessed(
    `/app/swgCsrTool/coalitions/guilds/${id}`,
    documentTitle,
    `guild-details-${id}`,
    Boolean(guildName)
  );
  useBreadcrumbs([
    {
      text: 'Guilds',
      href: '/coalitions/guilds',
    },
    {
      text: guildName ? guildName : `Guild ${id}`,
    },
  ]);

  let content = (
    <>
      <EuiSpacer />
      <GuildInformationOverview guildId={id} />

      <EuiSpacer />
      <GuildMembersTable guildId={id} />

      <EuiSpacer />
      <GuildEnemiesTable guildId={id} />
    </>
  );

  if (Object.keys(data?.guild ?? {}).length === 0 && !loading) {
    content = (
      <>
        <EuiSpacer />
        <EuiCallOut title="Guild not found" color="warning" iconType="alert">
          <p>No matching guild was found!</p>
        </EuiCallOut>
      </>
    );
  }

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
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          {content}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
