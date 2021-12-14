import React, { useState, useEffect, useContext } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiFieldSearch,
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiSpacer,
  EuiEmptyPrompt,
  EuiCallOut,
  EuiText,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useThrottle, useDebounce } from 'react-use';
import { useQueryParam, StringParam } from 'use-query-params';
import { Link } from 'react-router-dom';

import DeletedItemBadge from '../DeletedItemBadge';
import UGCName from '../UGCName';
import { KibanaCoreServicesContext } from '../KibanaCoreServicesContext';

import { useSearchForObjectQuery, SearchForObjectQuery } from './ObjectSearch.queries';

export const SEARCH_FOR_OBJECTS = gql`
  query searchForObject($searchText: String!) {
    objects(searchText: $searchText) {
      __typename
      id
      resolvedName
      basicName: resolvedName(resolveCustomNames: false)
      deletionReason
      deletionDate
      loadWithId
      containedById
    }
  }
`;

const renderObjectName = (name: string, item: NonNullable<SearchForObjectQuery['objects']>[number]) => {
  const link = (
    <Link className="euiLink euiLink--primary" to={`/object/${item.id}`}>
      <UGCName rawName={name} />
    </Link>
  );

  if (item.basicName === item.resolvedName) {
    return link;
  }

  return (
    <EuiText>
      {link}
      <EuiText color="subdued" size="xs">
        {item.basicName}
      </EuiText>
    </EuiText>
  );
};

const renderObjectId = (objectId: string) => {
  if (parseInt(objectId) <= 0) return objectId;

  return (
    <Link className="euiLink euiLink--primary" to={`/object/${objectId}`}>
      <code>{objectId}</code>
    </Link>
  );
};

const renderDeletionBadge = (val: string, item: NonNullable<SearchForObjectQuery['objects']>[number]) => {
  return <DeletedItemBadge deletionDate={item.deletionDate ?? null} deletionReason={item.deletionReason ?? null} />;
};

const objectColumns: EuiBasicTableColumn<NonNullable<SearchForObjectQuery['objects']>[number]>[] = [
  {
    field: 'id',
    name: 'Object ID',
    sortable: true,
    width: '10em',
    render: renderObjectId,
  },
  {
    field: '__typename',
    name: 'Type',
    width: '10em',
    sortable: true,
  },
  {
    field: 'resolvedName',
    name: 'Object Name',
    sortable: true,
    render: renderObjectName,
  },
  {
    field: 'deleted',
    name: 'Deletion Status',
    sortable: false,
    width: '10em',
    render: renderDeletionBadge,
  },
  {
    field: 'loadWithId',
    name: 'Loads With',
    sortable: false,
    width: '10em',
    render: renderObjectId,
  },
  {
    field: 'containedById',
    name: 'Contained By',
    sortable: false,
    width: '10em',
    render: renderObjectId,
  },
];

const ObjectSearch = () => {
  const [searchText, setSearchText] = useQueryParam('q', StringParam);
  const { coreServices } = useContext(KibanaCoreServicesContext);
  const throttledSearchText = useThrottle(searchText || '');
  const { loading, error, data, previousData } = useSearchForObjectQuery({
    skip: throttledSearchText.trim().length === 0,
    variables: {
      searchText: throttledSearchText,
    },
    returnPartialData: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  useDebounce(
    () => {
      setIsLoading(loading);
    },
    200,
    [loading]
  );
  useEffect(() => {
    const title = [throttledSearchText, `Object Search`].filter(Boolean).join(' - ');

    coreServices?.chrome.docTitle.change(title);
  }, [coreServices, throttledSearchText]);

  const actuallyLoading = isLoading && loading;
  const emptyMessage =
    throttledSearchText.length > 0 ? (
      'No objects found'
    ) : (
      <EuiEmptyPrompt iconType="search" title={<h3>Search to find objects</h3>} titleSize="s" />
    );

  return (
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius>
        <EuiPageHeader pageTitle="Object Search" paddingSize="s" />
        <EuiPageContent paddingSize="s" color="transparent" hasBorder={false}>
          <>
            <EuiFieldSearch
              placeholder="Search for objects, characters or accounts"
              value={searchText || ''}
              isClearable={!actuallyLoading}
              onChange={e => setSearchText((e.target as HTMLInputElement).value, 'replaceIn')}
              isLoading={actuallyLoading}
              fullWidth
            />
            <EuiSpacer />
            {error && (
              <>
                <EuiCallOut title="Search error" color="danger" iconType="alert">
                  <p>There was an error while querying. The results displayed may be incorrect.</p>
                </EuiCallOut>
                <EuiSpacer />
              </>
            )}
            <EuiInMemoryTable
              className="objectListingTable"
              /* @ts-ignore */
              items={(Object.keys(data ?? {}).length > 0 ? data : previousData)?.objects ?? []}
              rowHeader="oid"
              columns={objectColumns}
              loading={actuallyLoading}
              noItemsMessage={emptyMessage}
              sorting={true}
            />
          </>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default ObjectSearch;
