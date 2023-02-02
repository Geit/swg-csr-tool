import React, { useEffect, useState } from 'react';
import { EuiInputPopover, EuiFieldText, EuiSuggestItem, EuiSuggestionProps } from '@elastic/eui';
import { gql } from '@apollo/client';

import { isPresent } from '../../utils/utility-types';
import { stripUGCModifiers } from '../UGCName';

import {
  useGetAccountOrCharacterQuery,
  useGetAccountNameForSidQuery,
  useGetObjectNameForOidQuery,
} from './ObjectSearchAutoComplete.queries';

export const AUTOCOMPLETE_BY_CHAR_OR_ACC = gql`
  query getAccountOrCharacter($searchText: String!, $types: [String!]) {
    search(searchText: $searchText, types: $types, size: 5) {
      totalResultCount
      results {
        ... on Account {
          id
          accountName
        }
        ... on PlayerCreatureObject {
          id
          resolvedName
        }
      }
    }
  }
`;

export const GET_ACCOUNT_NAME_FOR_SID = gql`
  query getAccountNameForSid($stationId: String!) {
    account(stationId: $stationId) {
      id
      accountName
    }
  }
`;

export const GET_OBJECT_NAME_FOR_OID = gql`
  query getObjectNameForOid($objectId: String!) {
    object(objectId: $objectId) {
      id
      resolvedName
    }
  }
`;

type AutoCompleteResultType = 'Object' | 'Account';

interface AutoCompleteItem {
  itemType: AutoCompleteResultType;
  itemId: string;
}

interface ObjectSearchAutoCompleteProps {
  initialSearchItem?: AutoCompleteItem;
  onItemSelected: (item: AutoCompleteItem) => void;
  placeholder?: string;
  allowedTypes?: AutoCompleteResultType[];
}

interface AutoCompleteSuggestion extends EuiSuggestionProps {
  value: { type: AutoCompleteResultType; id: string };
}

const useFirstTimeSetup = (initialSearchItem: AutoCompleteItem | undefined, setSearchValue: (item: string) => void) => {
  const accountNameResult = useGetAccountNameForSidQuery({
    variables: {
      stationId: initialSearchItem?.itemId ?? '',
    },
    fetchPolicy: 'network-only',
    skip: initialSearchItem?.itemType !== 'Account',
  });

  const objectNameResult = useGetObjectNameForOidQuery({
    variables: {
      objectId: initialSearchItem?.itemId ?? '',
    },
    fetchPolicy: 'network-only',
    skip: initialSearchItem?.itemType !== 'Object',
  });

  useEffect(() => {
    if (accountNameResult.data?.account?.accountName) setSearchValue(accountNameResult.data.account.accountName);
    else if (objectNameResult.data?.object?.resolvedName) setSearchValue(objectNameResult.data.object?.resolvedName);
  }, [accountNameResult.data, objectNameResult.data, setSearchValue]);
};

export const ObjectSearchAutoComplete: React.FC<ObjectSearchAutoCompleteProps> = ({
  initialSearchItem,
  onItemSelected,
  allowedTypes = ['Account', 'Object'],
  placeholder = 'Search for an Account or Character',
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchDirty, setSearchDirty] = useState(false);
  const [popoverCanOpen, setPopoverCanOpen] = useState(false);
  useFirstTimeSetup(initialSearchItem, setSearchValue);

  const { data, previousData, error, loading } = useGetAccountOrCharacterQuery({
    variables: {
      searchText: searchValue ?? '',
      types: allowedTypes,
    },
    skip: !searchDirty || !searchValue || searchValue.trim().length < 1,
    returnPartialData: true,
  });

  const autocompleteData = data || (loading ? previousData : undefined);

  const setSearch = (itemType: AutoCompleteResultType, itemId: string, label: string) => () => {
    setSearchValue(label);
    setPopoverCanOpen(false);
    setSearchDirty(false);
    onItemSelected({ itemType, itemId });
  };

  const suggestionsData: AutoCompleteSuggestion[] =
    autocompleteData?.search.results
      ?.map(sr => {
        if (sr.__typename === 'Account') {
          const label = stripUGCModifiers(sr.accountName ?? 'unknown account');
          return {
            type: { iconType: 'users', color: 'tint4' },
            label,
            value: { type: 'Account' as const, id: sr.id },
          };
        } else if ('id' in sr && 'resolvedName' in sr) {
          const label = stripUGCModifiers(sr.resolvedName ?? 'unknown character');
          return {
            type: { iconType: 'user', color: 'tint1' },
            label,
            value: { type: 'Object' as const, id: sr.id },
          };
        }
        return null;
      })
      .filter(isPresent) ?? [];

  const suggestions = suggestionsData.map(sd => (
    <EuiSuggestItem
      key={sd.value.id}
      type={sd.type}
      label={sd.label}
      onClick={setSearch(sd.value.type, sd.value.id, sd.label)}
    />
  ));

  const input = (
    <EuiFieldText
      isLoading={loading}
      onFocus={() => setPopoverCanOpen(true)}
      fullWidth
      icon={'search'}
      placeholder={placeholder}
      value={searchValue}
      onChange={e => {
        setSearchValue(e.target.value);
        setSearchDirty(true);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' && suggestionsData.length > 0) {
          const firstSuggestion = suggestionsData[0];

          setSearch(firstSuggestion.value.type, firstSuggestion.value.id, firstSuggestion.label)();
        }
      }}
    />
  );

  const popoverActuallyOpen = popoverCanOpen && searchDirty && suggestions.length > 0;

  return (
    <EuiInputPopover
      disableFocusTrap={true}
      fullWidth
      input={input}
      panelPaddingSize="none"
      isOpen={popoverActuallyOpen}
      closePopover={() => setPopoverCanOpen(false)}
    >
      {suggestions}
    </EuiInputPopover>
  );
};
