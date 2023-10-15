import React, { useEffect, useState } from 'react';
import { EuiSpacer, EuiEmptyPrompt } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useDebounce } from 'react-use';
import { useQueryParam, JsonParam, withDefault, StringParam } from 'use-query-params';
import { Filter } from '@kbn/es-query';
import { DataView } from '@kbn/data-views-plugin/common';
import { SortDirection } from '@kbn/data-plugin/common';

import { useKibanaPlugins } from '../../../hooks/useKibanaPlugins';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import LoadingCover from '../../LoadingCover';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useSearchQuery } from './GalaxySearch.queries';
import { AccountCard } from './AccountCard';
import { ObjectCard } from './ObjectCard';
import { ResourceTypeCard } from './ResourceTypeCard';

export const SEARCH_FOR_OBJECTS = gql`
  query search($searchText: String!) {
    search(searchText: $searchText, from: 0, searchTextIsEsQuery: true) {
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

const GalaxySearchPageLayout: React.FC = ({ children }) => {
  return <FullWidthPage title="Galaxy Search">{children}</FullWidthPage>;
};

const FiltersParamJson = withDefault(JsonParam, []);

export const GalaxySearch: React.FC = () => {
  const { unifiedSearch, data: dataPlugin } = useKibanaPlugins();
  const [dataView, setDataView] = useState<DataView>();
  const [searchQuery, setSearchQuery] = useState('');

  const { SearchBar } = unifiedSearch.ui;
  const [filters, setFilters] = useQueryParam<Filter[]>('f', FiltersParamJson, { updateType: 'replaceIn' });
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, ''));
  const realQuery = { language: 'kuery', query: query ?? '' };

  useDebounce(
    async () => {
      if (!dataView) return;
      if (filters.length === 0 && !realQuery?.query) return;
      const searchSource = await dataPlugin.search.searchSource.create();

      searchSource.setField('filter', filters);
      searchSource.setField('query', realQuery);
      searchSource.setField('sort', {
        _score: SortDirection.desc,
      });
      const data = searchSource.getSearchRequestBody();
      setSearchQuery(JSON.stringify(data.query));
    },
    200,
    [filters, dataView, query]
  );

  const {
    loading: gqlLoading,
    error,
    data,
    previousData,
  } = useSearchQuery({
    variables: {
      searchText: searchQuery ?? '',
    },
    returnPartialData: true,
  });

  const loading = gqlLoading;

  useEffect(() => {
    let canceled = false;
    const loadDataView = async () => {
      const [loadedDataView] = await dataPlugin.dataViews.find('object_search_index');
      if (canceled) return;
      setDataView(loadedDataView);
    };

    loadDataView();
    return () => {
      canceled = true;
    };
  }, [dataPlugin]);

  const documentTitle = [query, `Galaxy Search`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useBreadcrumbs([
    {
      text: 'Galaxy Search',
    },
  ]);

  const fieldSearch = (
    <>
      <SearchBar
        appName="swgCsrTool_galaxySearch"
        iconType="search"
        placeholder="Search for objects, characters or accounts"
        indexPatterns={dataView ? [dataView] : undefined}
        useDefaultBehaviors
        showQueryInput
        showQueryMenu={false}
        showDatePicker={false}
        showSubmitButton
        disableQueryLanguageSwitcher
        displayStyle="inPage"
        suggestionsSize="s"
        filters={filters}
        query={realQuery}
        onFiltersUpdated={newFilters => {
          dataPlugin.query.filterManager.setFilters(newFilters);
          setFilters(newFilters);
        }}
        onQuerySubmit={({ query: newQuery }) => {
          if (typeof newQuery?.query === 'object') {
            throw new Error('Unhandled query type!');
          }

          setQuery(newQuery?.query ?? '');
        }}
      />
      <EuiSpacer />
    </>
  );

  const emptyMessage =
    (filters?.length > 0 || realQuery?.query) && !loading ? (
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
