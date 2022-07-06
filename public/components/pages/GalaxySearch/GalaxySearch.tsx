import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiFieldSearch,
  EuiSpacer,
  EuiEmptyPrompt,
  EuiIcon,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiDescriptionList,
  EuiPageHeaderSection,
  EuiTitle,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useThrottle } from 'react-use';
import { useQueryParam, StringParam } from 'use-query-params';
import { Link } from 'react-router-dom';

import DeletedItemBadge from '../../DeletedItemBadge';
import UGCName from '../../UGCName';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import AppSidebar from '../../AppSidebar';
import LoadingCover from '../../LoadingCover';

import { useSearchQuery, SearchQuery } from './GalaxySearch.queries';

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
      }
    }
  }
`;

type SearchResult = NonNullable<SearchQuery['search']['results']>[number];
type AccountResult = Extract<SearchResult, { __typename: 'Account' }>;
type ObjectResult = Exclude<SearchResult, AccountResult>;

const SearchResultCard: React.FC<{ children: React.ReactNode; title: React.ReactNode; href: string }> = ({
  children,
  title,
  href,
}) => {
  return (
    <Link
      to={href}
      rel="noreferrer"
      className="euiPanel euiPanel--paddingMedium euiPanel--borderRadiusMedium euiPanel--plain euiPanel--hasShadow euiPanel--hasBorder euiPanel--isClickable euiCard euiCard--leftAligned euiCard--isClickable searchResultCard"
    >
      <div className="euiCard__content">
        <span className="euiTitle euiTitle--small euiCard__title">
          <a className="euiCard__titleAnchor" aria-describedby="">
            {title}
          </a>
        </span>
        <div className="euiCard__children">{children}</div>
      </div>
    </Link>
  );
};

const AccountCard: React.FC<{ account: AccountResult }> = ({ account }) => {
  return (
    <SearchResultCard
      href={`/account/${account.id}`}
      title={
        (
          <span>
            <EuiIcon type="users" size="l" className="searchResultCard__icon" />
            Account: {account.accountName}
          </span>
        ) ?? 'Unknown account'
      }
    >
      <EuiDescriptionList className="galaxySearchKeyValues" textStyle="reverse">
        <div>
          <EuiDescriptionListTitle>Station ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{account.id}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Characters</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {account.characters?.map(c => c.resolvedName).join(', ')}
          </EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Type</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>Account</EuiDescriptionListDescription>
        </div>
      </EuiDescriptionList>
    </SearchResultCard>
  );
};

const ObjectIcon: Record<SearchResult['__typename'], string> = {
  Account: 'users',
  BuildingObject: 'home',
  CellObject: 'home',
  CreatureObject: 'user',
  HarvesterInstallationObject: 'home',
  InstallationObject: 'home',
  PlayerCreatureObject: 'user',
  ManfSchematicObject: 'gear',
  PlayerObject: 'user',
  ServerObject: 'questionInCircle',
  ResourceContainerObject: 'analyzeEvent',
  ShipObject: 'moon',
  GuildObject: 'users',
  TangibleObject: 'questionInCircle',
  WeaponObject: 'questionInCircle',
  CityObject: 'questionInCircle',
  UniverseObject: 'questionInCircle',
};

const ObjectCard: React.FC<{ object: ObjectResult }> = ({ object }) => {
  return (
    <SearchResultCard
      href={`/object/${object.id}`}
      title={
        <span>
          <EuiIcon
            type={ObjectIcon[object.__typename] ?? 'questionInCircle'}
            size="l"
            className="searchResultCard__icon"
          />
          <UGCName rawName={object.resolvedName} />
        </span>
      }
    >
      <EuiDescriptionList className="galaxySearchKeyValues" textStyle="reverse">
        <div>
          <EuiDescriptionListTitle>Object ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{object.id}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Basic Name</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{object.basicName}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Type</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{object.__typename}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Deleted</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <DeletedItemBadge
              deletionDate={object.deletionDate ?? null}
              deletionReason={object.deletionReason ?? null}
            />
          </EuiDescriptionListDescription>
        </div>
      </EuiDescriptionList>
    </SearchResultCard>
  );
};

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
              return (
                <>
                  {item.__typename === 'Account' ? (
                    <AccountCard account={item} key={`account-${item.id}`} />
                  ) : (
                    <ObjectCard object={item} key={`object-${item.id}`} />
                  )}
                  <EuiSpacer />
                </>
              );
            })
          : emptyMessage}
      </LoadingCover>
    </GalaxySearchPageLayout>
  );
};
