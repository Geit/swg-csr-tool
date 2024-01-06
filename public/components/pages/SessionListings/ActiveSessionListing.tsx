import React from 'react';
import { gql } from '@apollo/client';
import { EuiInMemoryTable, EuiSpacer, EuiTableFieldDataColumnType, SortDirection } from '@elastic/eui';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

import { useGetAllSessionsQuery, GetAllSessionsQuery } from './ActiveSessionListing.queries';

export const GET_ALL_SESSIONS = gql`
  query getAllSessions {
    sessions {
      results {
        id
        accountId
        accountName
        clientIp
        clientGuid
        multiAccountApproved
        characterName
        startedTime
        staff
        serverAddress
        currentState
        lastTouched
      }
    }
  }
`;

type Session = NonNullable<GetAllSessionsQuery['sessions']['results']>[number];

interface SessionWithClientData extends Session {
  sessionsAtIp: number;
  sessionsAtGuid: number;
  accountsAtIp: number;
  accountsAtGuid: number;
}

const columns: EuiTableFieldDataColumnType<SessionWithClientData>[] = [
  {
    field: 'id',
    name: 'ID',
    sortable: true,
    truncateText: true,
    width: '10ex',
  },
  {
    field: 'accountName',
    name: 'Account',
    sortable: true,
    truncateText: true,
    width: '30ex',
  },
  {
    field: 'characterName',
    name: 'Character',
    sortable: true,
    truncateText: true,
    width: '30ex',
  },
  {
    field: 'currentState',
    name: 'State',
    sortable: true,
    truncateText: true,
    width: '24ex',
  },
  {
    field: 'startedTime',
    name: 'Started at',
    dataType: 'date',
    sortable: true,
    truncateText: true,
    width: '24ex',
  },
  {
    field: 'lastTouched',
    name: 'Last Touched',
    dataType: 'date',
    sortable: true,
    truncateText: true,
    width: '24ex',
  },
  {
    field: 'clientGuid',
    name: 'Client GUID',
    sortable: true,
    truncateText: true,
    width: '24ex',
  },
  {
    field: 'clientIp',
    name: 'Client IP',
    sortable: true,
    truncateText: true,
    width: '20ex',
  },
  {
    field: 'multiAccountApproved',
    name: <abbr title="Multi Account Approved">Multi</abbr>,
    dataType: 'boolean',
    sortable: true,
    truncateText: true,
    width: '10ex',
  },
  {
    field: 'staff',
    name: 'Staff',
    dataType: 'boolean',
    sortable: true,
    truncateText: true,
    width: '10ex',
  },
  {
    field: 'sessionsAtIp',
    name: <abbr title="Total Sessions at IP">Sess@IP</abbr>,
    dataType: 'number',
    sortable: true,
    width: '10ex',
  },
  {
    field: 'sessionsAtGuid',
    name: <abbr title="Total Sessions at GUID">Sess@GUID</abbr>,
    dataType: 'number',
    sortable: true,
    width: '10ex',
  },
  {
    field: 'accountsAtIp',
    name: <abbr title="Total Accounts at IP">Acc@IP</abbr>,
    dataType: 'number',
    sortable: true,
    width: '10ex',
  },
  {
    field: 'accountsAtGuid',
    name: <abbr title="Total Accounts at GUID">Acc@GUID</abbr>,
    dataType: 'number',
    sortable: true,
    width: '10ex',
  },
];

const incrementMapCount = (map: Map<string, number>, key: string) => {
  map.set(key, 1 + (map.get(key) ?? 0));
};

const addKeyToMapSet = <T,>(map: Map<string, Set<T>>, key: string, value: T) => {
  if (map.has(key)) map.get(key)!.add(value);
  else map.set(key, new Set([value]));
};

const ActiveSessionListing: React.FC = () => {
  const { data, loading } = useGetAllSessionsQuery({
    pollInterval: 5000,
  });
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, ''));

  const sorting = {
    sort: {
      field: 'startedTime',
      direction: SortDirection.DESC,
    },
  };

  const paginationOptions = { pageSize: 500, hidePerPageOptions: true };

  const sessionsAtIp = new Map<string, number>();
  const sessionsAtGuid = new Map<string, number>();
  const accountsAtIp = new Map<string, Set<number>>();
  const accountsAtGuid = new Map<string, Set<number>>();

  data?.sessions.results?.forEach(s => {
    incrementMapCount(sessionsAtIp, s.clientIp);
    incrementMapCount(sessionsAtGuid, s.clientGuid);
    addKeyToMapSet(accountsAtIp, s.clientIp, s.accountId);
    addKeyToMapSet(accountsAtGuid, s.clientGuid, s.accountId);
  });

  const results: SessionWithClientData[] =
    data?.sessions.results?.map(m => ({
      ...m,
      accountsAtIp: accountsAtIp.get(m.clientIp)?.size ?? 1,
      accountsAtGuid: accountsAtGuid.get(m.clientGuid)?.size ?? 1,
      sessionsAtIp: sessionsAtIp.get(m.clientIp) ?? 1,
      sessionsAtGuid: sessionsAtGuid.get(m.clientGuid) ?? 1,
    })) ?? [];

  return (
    <>
      <EuiSpacer />
      <EuiInMemoryTable
        search={{
          query,
          onChange: ({ error: newError, queryText }) => {
            if (newError) {
              return;
            }
            setQuery(queryText);
          },
          box: {
            incremental: true,
          },
          filters: [
            {
              type: 'is',
              field: 'multiAccountApproved',
              name: 'Multi Account Approved',
              negatedName: 'Not Multi Account Approved',
            },
          ],
        }}
        pagination={paginationOptions}
        items={results}
        columns={columns}
        sorting={sorting}
        loading={loading}
        message={loading ? 'Loading sessions...' : 'No sessions found'}
      />
    </>
  );
};

export default ActiveSessionListing;
