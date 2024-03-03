import React, { useEffect, useState } from 'react';
import { EuiInputPopover, EuiIcon, EuiSelectable, EuiSelectableOption } from '@elastic/eui';
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
      totalResults
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

  const setSearch = (itemType: AutoCompleteResultType, itemId: string, label: string) => {
    setSearchValue(label);
    setSearchDirty(false);
    onItemSelected({ itemType, itemId });
  };

  const comboOptions: EuiSelectableOption<{ value: { type: AutoCompleteResultType; id: string } }>[] =
    autocompleteData?.search.results
      ?.map(sr => {
        if (sr.__typename === 'Account') {
          const label = stripUGCModifiers(sr.accountName ?? 'unknown account');
          return {
            prepend: <EuiIcon type="users" color="primary" />,
            label,
            value: { type: 'Account' as const, id: sr.id },
          };
        } else if ('id' in sr && 'resolvedName' in sr) {
          const label = stripUGCModifiers(sr.resolvedName ?? 'unknown character');
          return {
            prepend: <EuiIcon type="user" color="secondary" />,
            label,
            value: { type: 'Object' as const, id: sr.id },
          };
        }
        return null;
      })
      .filter(isPresent) ?? [];

  const popoverActuallyOpen = searchDirty && comboOptions.length > 0;

  return (
    <EuiSelectable
      options={comboOptions}
      searchable
      searchProps={{
        isLoading: loading,
        fullWidth: true,
        placeholder,
        value: searchValue,
        onChange: val => {
          if (val === searchValue) return;

          setSearchValue(val);
          setSearchDirty(true);
        },
      }}
      singleSelection={'always'}
      isLoading={loading}
      errorMessage={error?.message}
      onChange={(newOpt, e, selectedOpt) => {
        setSearch(selectedOpt.value.type, selectedOpt.value.id, selectedOpt.label);
      }}
    >
      {(list, search) => (
        <EuiInputPopover
          disableFocusTrap={true}
          fullWidth
          input={search!}
          panelPaddingSize="none"
          isOpen={popoverActuallyOpen}
          closePopover={() => setSearchDirty(false)}
        >
          {list}
        </EuiInputPopover>
      )}
    </EuiSelectable>
  );
};
