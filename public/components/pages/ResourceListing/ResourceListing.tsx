import React from 'react';
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiSwitch } from '@elastic/eui';
import { BooleanParam, JsonParam, NumberParam, StringParam, useQueryParam, withDefault } from 'use-query-params';
import { useThrottle } from 'react-use';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../../PaginatedGQLTable';

import ResourceListingFilters, { RangeQueryFilter } from './ResourceListingFilters';
import ResourceListingTable from './ResourceListingTable';

const FiltersParamJson = withDefault(JsonParam, []);

export const ResourceListing: React.FC = () => {
  const title = `Resource Listing`;

  useDocumentTitle(title);
  useBreadcrumbs([
    {
      text: title,
    },
  ]);

  const [searchText, setSearchText] = useQueryParam('search', withDefault(StringParam, ''), {
    updateType: 'replaceIn',
  });
  const [rowsPerPage, setRowsPerPage] = useQueryParam('perPage', withDefault(NumberParam, DEFAULT_PER_PAGE), {
    updateType: 'replaceIn',
  });
  const [page, setPage] = useQueryParam('page', withDefault(NumberParam, DEFAULT_PAGE), { updateType: 'replaceIn' });
  const [showInactiveResources, setShowInactiveResources] = useQueryParam(
    'showInactive',
    withDefault(BooleanParam, false),
    {
      updateType: 'replaceIn',
    }
  );
  const [resourceAttributesQueryFilters, setResourceAttributeQueryFilters] = useQueryParam<RangeQueryFilter[]>(
    'qualityFilters',
    FiltersParamJson,
    { updateType: 'replaceIn' }
  );

  const throttledSearchText = useThrottle(searchText || '', 500);

  return (
    <FullWidthPage title="Resources">
      <>
        <EuiSpacer />
        <EuiFlexGroup alignItems="center" gutterSize="xl">
          <EuiFlexItem grow={3}>
            <EuiFieldSearch
              placeholder="Search by resource class name or name..."
              fullWidth
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSwitch
              label="Show inactive resources"
              checked={showInactiveResources}
              onChange={e => setShowInactiveResources(e.target.checked)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />
        <EuiFlexGroup gutterSize="xl">
          <EuiFlexItem grow={3}>
            <ResourceListingTable
              searchText={throttledSearchText}
              page={page}
              rowsPerPage={rowsPerPage}
              resourceAttributesQueryFilters={resourceAttributesQueryFilters}
              showInactiveResources={showInactiveResources}
              onPageChanged={setPage}
              onRowsPerPageChanged={setRowsPerPage}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <ResourceListingFilters
              initialValue={resourceAttributesQueryFilters}
              onChange={setResourceAttributeQueryFilters}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    </FullWidthPage>
  );
};
