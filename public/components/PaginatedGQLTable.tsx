import React from 'react';
import { EuiBasicTable, EuiTableFieldDataColumnType, EuiTablePagination } from '@elastic/eui';

export const DEFAULT_PAGE = 0;
const PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PER_PAGE: (typeof PER_PAGE_OPTIONS)[number] = 25;

interface PaginatedGQLTableProps<T> {
  columns: EuiTableFieldDataColumnType<T>[];
  data: T[];
  page: number;
  onPageChanged: (pageNum: number) => void;
  rowsPerPage: number;
  onRowsPerPageChanged: (rowsPerPage: number) => void;
  loading: boolean;
  totalResultCount: number;
}

const PaginatedGQLTable = <T extends object>({
  data,
  loading,
  totalResultCount,
  columns,
  onPageChanged,
  page,
  rowsPerPage,
  onRowsPerPageChanged,
}: PaginatedGQLTableProps<T>) => {
  const resultToStartAtRaw = page * rowsPerPage;

  if (!loading && data.length > 0 && resultToStartAtRaw > totalResultCount) {
    onPageChanged(0);
  }

  return (
    <>
      <EuiBasicTable items={data} columns={columns} loading={loading} />
      <EuiTablePagination
        pageCount={Math.ceil((totalResultCount ?? 0) / rowsPerPage)}
        activePage={page}
        onChangePage={pageNum => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          onPageChanged(pageNum);
        }}
        itemsPerPage={rowsPerPage}
        onChangeItemsPerPage={perPage => onRowsPerPageChanged(perPage)}
        itemsPerPageOptions={PER_PAGE_OPTIONS}
      />
    </>
  );
};

export default PaginatedGQLTable;
