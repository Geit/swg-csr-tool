import React from 'react';
import { EuiInMemoryTable, EuiSkeletonText, EuiSpacer, EuiTableFieldDataColumnType, EuiTitle } from '@elastic/eui';
import { gql } from '@apollo/client';

import ObjectLink from '../../ObjectLink';

import { GetGuildMembersQuery, useGetGuildMembersQuery } from './GuildMembersTable.queries';

type GuildMember = NonNullable<GetGuildMembersQuery['guild']>['members'][number];

export const GET_GUILD_MEMBERS = gql`
  query getGuildMembers($guildId: String!) {
    guild(guildId: $guildId) {
      id
      memberCount
      members {
        id
        level
        skillTemplateTitle
        level
        rank
        object {
          id
          resolvedName
        }
      }
    }
  }
`;

interface GuildMembersTableProps {
  guildId: string;
}

export const GuildMembersTable: React.FC<GuildMembersTableProps> = ({ guildId }) => {
  const { data, loading } = useGetGuildMembersQuery({
    variables: {
      guildId,
    },
    returnPartialData: true,
  });

  if (loading)
    return (
      <>
        <EuiTitle size="m">
          <h2>Members</h2>
        </EuiTitle>
        <EuiSpacer />
        <EuiSkeletonText lines={5} />
      </>
    );

  const columns: EuiTableFieldDataColumnType<GuildMember>[] = [
    {
      field: 'id',
      name: 'ID',
      truncateText: true,
      render(val) {
        return <ObjectLink objectId={val} />;
      },
      width: '20ex',
    },
    {
      field: 'object.resolvedName',
      name: 'Name',
      truncateText: true,
      render(val, record) {
        return <ObjectLink objectId={record.object?.id} textToDisplay={val} />;
      },
    },
    {
      field: 'level',
      name: 'Level',
      truncateText: true,
      width: '10ex',
    },
    {
      field: 'skillTemplateTitle',
      name: 'Class',
      truncateText: true,
    },
  ];

  const items = data?.guild?.members ?? [];
  const paginationOptions = items.length > 10 ? { initialPageSize: 10 } : false;

  return (
    <>
      <EuiTitle size="m">
        <h2>
          {data?.guild?.memberCount ?? 0} {data?.guild?.memberCount === 1 ? 'Member' : 'Members'}
        </h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiInMemoryTable pagination={paginationOptions} items={items} columns={columns} />
    </>
  );
};
