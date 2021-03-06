import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiFieldSearch,
  EuiSpacer,
  EuiEmptyPrompt,
  EuiPageHeaderSection,
  EuiTitle,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useThrottle } from 'react-use';
import { useQueryParam, StringParam } from 'use-query-params';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import AppSidebar from '../../AppSidebar';
import LoadingCover from '../../LoadingCover';

import { useSearchQuery } from './GalaxySearch.queries';
import { AccountCard } from './AccountCard';
import { ObjectCard } from './ObjectCard';
import { ResourceTypeCard } from './ResourceTypeCard';

export const SEARCH_FOR_OBJECTS = gql`
  query search($searchText: String!) {
    search(searchText: $searchText, from: 0) {
      totalResultCount
      results {
        __typename

        ... on IServerObject {
          id
          resolvedName
          basicName: resolvedName(resolveCustomNames: false)
          deletionReason
          deletionDate
        }

        ... on Account {
          id
          accountName
          characters {
            id
            resolvedName
          }
        }

        ... on ResourceType {
          id
          name
          classId
          className
          depletedTimeReal
          depletedTime
          planetDistribution {
            sceneId
            sceneName
            planetId
            seed
          }
          attributes {
            attributeId
            attributeName
            value
          }
        }
      }
    }
  }
`;

const GalaxySearchPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <EuiPage paddingSize="l">
      <AppSidebar />
      <EuiPageBody panelled borderRadius restrictWidth>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Search</h1>
          </EuiTitle>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="s" color="transparent" hasBorder={false}>
          {children}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export const GalaxySearch: React.FC = () => {
  const [searchText, setSearchText] = useQueryParam('q', StringParam);
  const throttledSearchText = useThrottle(searchText || '');
  const { loading, error, data, previousData } = useSearchQuery({
    variables: {
      searchText: throttledSearchText,
    },
    returnPartialData: true,
  });

  const documentTitle = [throttledSearchText, `Galaxy Search`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useBreadcrumbs([
    {
      text: 'Galaxy Search',
    },
  ]);

  const fieldSearch = (
    <>
      <EuiFieldSearch
        placeholder="Search for objects, characters or accounts"
        value={searchText || ''}
        isClearable={!loading}
        onChange={e => setSearchText((e.target as HTMLInputElement).value, 'replaceIn')}
        isLoading={loading}
        fullWidth
      />
      <EuiSpacer />
    </>
  );

  const emptyMessage =
    throttledSearchText.length > 0 && !loading ? (
      <EuiEmptyPrompt iconType="search" title={<h3>No Objects Found</h3>} titleSize="s" />
    ) : (
      <EuiEmptyPrompt iconType="search" title={<h3>Search to find objects</h3>} titleSize="s" />
    );

  if (!loading && error) {
    return (
      <GalaxySearchPageLayout>
        {fieldSearch}
        <EuiEmptyPrompt
          color="danger"
          iconType="alert"
          title={<h3>Search Error</h3>}
          body={<p>There was an error while querying. The results displayed may be incorrect.</p>}
        />
      </GalaxySearchPageLayout>
    );
  }

  const hasCurrentData = Object.keys(data ?? {}).length > 0;

  const items = (hasCurrentData ? data : previousData)?.search.results ?? [];

  return (
    <GalaxySearchPageLayout>
      {fieldSearch}
      <LoadingCover isLoading={loading}>
        {items.length > 0
          ? items.map(item => {
              if (item.__typename === 'Account')
                return (
                  <>
                    <AccountCard account={item} key={`account-${item.id}`} />
                    <EuiSpacer />
                  </>
                );

              if (item.__typename === 'ResourceType')
                return (
                  <>
                    <ResourceTypeCard resource={item} key={`resource-type-${item.id}`} />
                    <EuiSpacer />
                  </>
                );

              return (
                <>
                  <ObjectCard object={item} key={`object-${item.id}`} />
                  <EuiSpacer />
                </>
              );
            })
          : emptyMessage}
      </LoadingCover>
    </GalaxySearchPageLayout>
  );
};
