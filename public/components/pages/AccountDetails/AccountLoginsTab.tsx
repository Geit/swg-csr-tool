import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { EuiCallOut, EuiSpacer, EuiTableFieldDataColumnType } from '@elastic/eui';
import { useParams } from 'react-router';

import PaginatedGQLTable, { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../../PaginatedGQLTable';

import { GetLoginsForAccountQuery, useGetLoginsForAccountQuery } from './AccountLoginsTab.queries';
import { AccountDetailsRouteParams } from './AccountDetails';

export const GET_LOGINS_FOR_ACCOUNT = gql`
  query getLoginsForAccount($stationId: String!, $from: Int!, $size: Int!) {
    account(stationId: $stationId) {
      id
      logins(from: $from, size: $size) {
        totalResults
        results {
          ip
          guid
          timestamp
          isProxy
          isVirtualised
          architecture

          ipData {
            autonomousSystemNumber
            autonomousSystemOrganization
            city
            country
            region
          }
          successful
          failureReason
        }
      }
    }
  }
`;

type LoginEntry = NonNullable<NonNullable<GetLoginsForAccountQuery['account']>['logins']>['results'][number];

const columns: EuiTableFieldDataColumnType<LoginEntry>[] = [
  {
    field: 'timestamp',
    name: 'Time',
    truncateText: false,
    render(val, record) {
      return new Date(record.timestamp).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    },
  },
  {
    field: 'ip',
    name: 'IP',
    truncateText: true,
    width: '20ex',
  },
  {
    field: 'guid',
    name: 'GUID',
    truncateText: true,
    width: '20ex',
  },
  {
    field: 'success',
    name: 'Succeeded',
    truncateText: false,
    render(val, record) {
      return record.successful ? 'Yes' : `⚠️ No - ${record.failureReason}`;
    },
    width: '20ex',
  },
  {
    field: 'flags',
    name: 'Flags',
    truncateText: false,
    render(val, record) {
      const flags = [
        record.isProxy && '⚠️ Proxied (VPN) login!',
        record.isVirtualised && '⚠️ Virtualised login!',
      ].filter(Boolean);

      if (flags.length === 0) return 'None';

      return flags.map((f, idx) => <div key={idx}>{f}</div>);
    },
    width: '30ex',
  },
  {
    field: 'aso',
    name: 'Autonomous System',
    truncateText: false,
    render(val, record) {
      return (
        <div>
          <div>
            {record.ipData?.autonomousSystemOrganization}
            <br />
          </div>
          <code>{record.ipData?.autonomousSystemNumber}</code>
        </div>
      );
    },
  },
  {
    field: 'region',
    name: 'Region',
    truncateText: false,
    render(val, record) {
      return (
        <div>
          {record.ipData?.city}
          <br />
          {record.ipData?.region}, {record.ipData?.country}
        </div>
      );
    },
  },
];

export const AccountLoginsTab: React.FC = () => {
  const { id: stationId } = useParams<AccountDetailsRouteParams>();
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PER_PAGE);
  const [page, setPage] = useState(DEFAULT_PAGE);

  const resultToStartAtRaw = page * rowsPerPage;

  const { data, previousData, loading, error } = useGetLoginsForAccountQuery({
    variables: {
      stationId,
      size: rowsPerPage,
      from: resultToStartAtRaw,
    },
    returnPartialData: true,
    fetchPolicy: 'cache-first',
  });

  const hasCurrentData = Object.keys(data?.account ?? {}).length > 0;
  const realData = hasCurrentData ? data : previousData;
  const account = realData?.account;

  const filteredResults = account && 'logins' in account ? account.logins.results ?? [] : [];

  if (error)
    return (
      <EuiCallOut title="Incomplete results" color="danger" iconType="alert">
        <p>There was an error while querying. The results displayed may be incorrect.</p>
      </EuiCallOut>
    );

  return (
    <>
      <EuiSpacer />
      <PaginatedGQLTable
        data={filteredResults}
        columns={columns}
        loading={loading}
        page={page}
        onPageChanged={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChanged={setRowsPerPage}
        totalResultCount={realData?.account?.logins?.totalResults ?? 0}
      />
    </>
  );
};
