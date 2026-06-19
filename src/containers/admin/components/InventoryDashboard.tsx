import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { fetchInventoryApi } from '../../../lib/api';
import type { InventoryListItem } from '../../../lib/adminData';
import { AsyncPanel, DataTable, Pagination, SearchInput, StatusBadge, type DataTableColumn } from '../../common/ui';
import './InventoryDashboard.css';

const PAGE_SIZE = 5;

const InventoryDashboard = () => {
  const { data } = useAppContext();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const fetchPage = useCallback(
    (page: number, signal?: AbortSignal) =>
      fetchInventoryApi(data, { page, pageSize: PAGE_SIZE, query: debouncedQuery }, { signal }),
    [data, debouncedQuery]
  );

  const { page, setPage, items: records, total, totalPages, loading, error } = usePaginatedQuery(fetchPage, [
    debouncedQuery
  ]);

  const columns = useMemo<Array<DataTableColumn<InventoryListItem>>>(
    () => [
      { key: 'id', header: 'Location ID', render: (row) => row.id },
      { key: 'name', header: 'Name', render: (row) => row.name },
      { key: 'type', header: 'Type', render: (row) => row.type },
      { key: 'address', header: 'Address', render: (row) => row.address },
      {
        key: 'coordinates',
        header: 'Coordinates',
        render: (row) => `${row.latitude}, ${row.longitude}`
      },
      { key: 'diesel', header: 'Diesel', render: (row) => row.dieselStock.toLocaleString() },
      { key: 'petrol', header: 'Petrol', render: (row) => row.petrolStock.toLocaleString() },
      { key: 'total', header: 'Total Stock', render: (row) => row.totalStock.toLocaleString() },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
    ],
    []
  );

  return (
    <div className="inventory-dashboard">
      <h1>Inventory Dashboard</h1>

      <div className="inventory-dashboard__search">
        <SearchInput
          label="Search inventory"
          value={query}
          onChange={setQuery}
          onDebouncedChange={setDebouncedQuery}
          placeholder="Search by location, address, type, or stock status"
        />
      </div>

      <div className="page-card page-card--flush">
        <AsyncPanel loading={loading} error={error} empty={!loading && !error && records.length === 0}>
          <DataTable
            columns={columns}
            rows={records}
            rowKey={(row) => row.id}
            emptyTitle="No inventory locations"
            emptyMessage="Add hubs or terminals in Master Data to track inventory."
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </AsyncPanel>
      </div>
    </div>
  );
};

export default InventoryDashboard;
