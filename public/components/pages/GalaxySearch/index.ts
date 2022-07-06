import { SearchQuery } from './GalaxySearch.queries';

export { GalaxySearch } from './GalaxySearch';

export type SearchResult = NonNullable<SearchQuery['search']['results']>[number];
export type AccountResult = Extract<SearchResult, { __typename: 'Account' }>;
export type ResourceTypeResult = Extract<SearchResult, { __typename: 'ResourceType' }>;
export type ObjectResult = Exclude<SearchResult, AccountResult | ResourceTypeResult>;
