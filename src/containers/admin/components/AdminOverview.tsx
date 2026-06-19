import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { fetchOverviewDetailsApi } from '../../../lib/api';
import type { OverviewDetail, OverviewLocationTab, OverviewMetricKey } from '../../../lib/adminData';
import {
  Button,
  DataTable,
  EmptyState,
  MetricCard,
  Pagination,
  StatusBadge,
  TabBar,
  AsyncPanel,
  type DataTableColumn
} from '../../common/ui';
import { CloseIcon, RefreshIcon, ShieldIcon, TruckIcon, UserIcon } from '../../common/ui/icons';
import './AdminOverview.css';

const PAGE_SIZE = 5;

interface MetricCardConfig {
  key: OverviewMetricKey;
  title: string;
  count: number;
  emptyMessage: string;
  icon: ReactElement;
}

const AdminOverview = () => {
  const { data } = useAppContext();
  const [selectedMetric, setSelectedMetric] = useState<OverviewMetricKey | null>(null);
  const [locationTab, setLocationTab] = useState<OverviewLocationTab>('all');
  const [details, setDetails] = useState<OverviewDetail[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overviewAbortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      overviewAbortRef.current?.abort();
    },
    []
  );

  const metrics = useMemo<MetricCardConfig[]>(
    () => [
      {
        key: 'locations',
        title: 'Hubs & Terminals',
        count: data.hubs.length + data.terminals.length,
        emptyMessage: 'No hubs or terminals configured yet.',
        icon: <ShieldIcon />
      },
      {
        key: 'drivers',
        title: 'Drivers',
        count: data.drivers.length,
        emptyMessage: 'No drivers configured yet.',
        icon: <UserIcon />
      },
      {
        key: 'orders',
        title: 'Orders',
        count: data.orders.length,
        emptyMessage: 'No orders configured yet.',
        icon: <TruckIcon />
      }
    ],
    [data.drivers.length, data.hubs.length, data.orders.length, data.terminals.length]
  );

  const loadDetails = useCallback(
    async (metric: OverviewMetricKey, nextPage: number, tab: OverviewLocationTab) => {
      overviewAbortRef.current?.abort();
      const controller = new AbortController();
      overviewAbortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchOverviewDetailsApi(
          data,
          {
            metric,
            page: nextPage,
            pageSize: PAGE_SIZE,
            tab: metric === 'locations' ? tab : undefined
          },
          { signal: controller.signal }
        );

        if (controller.signal.aborted) {
          return;
        }

        setLoading(false);

        if (response.error || !response.data) {
          setDetails([]);
          setTotal(0);
          setTotalPages(1);
          setError(response.error ?? 'Unable to load details.');
          return;
        }

        setDetails(response.data.items);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setPage(response.data.page);
      } catch (caught) {
        if (controller.signal.aborted || (caught instanceof DOMException && caught.name === 'AbortError')) {
          return;
        }

        setLoading(false);
        setDetails([]);
        setTotal(0);
        setTotalPages(1);
        setError('Unable to load details.');
      }
    },
    [data]
  );

  const handleMetricClick = useCallback(
    async (metric: MetricCardConfig) => {
      if (metric.count <= 0) {
        return;
      }

      setSelectedMetric(metric.key);
      setLocationTab('all');
      setPage(1);
      await loadDetails(metric.key, 1, 'all');
    },
    [loadDetails]
  );

  const handleTabChange = async (tab: OverviewLocationTab) => {
    if (!selectedMetric) {
      return;
    }

    setLocationTab(tab);
    setPage(1);
    await loadDetails(selectedMetric, 1, tab);
  };

  const handleRefresh = async () => {
    if (!selectedMetric) {
      return;
    }

    await loadDetails(selectedMetric, page, locationTab);
  };

  const detailColumns = useMemo<Array<DataTableColumn<OverviewDetail>>>(() => {
    switch (selectedMetric) {
      case 'locations':
        return [
          { key: 'id', header: 'ID', render: (row) => row.id },
          { key: 'name', header: 'Name', render: (row) => ('name' in row ? row.name : '-') },
          { key: 'type', header: 'Type', render: (row) => ('type' in row ? row.type : '-') },
          { key: 'address', header: 'Address', render: (row) => ('address' in row ? row.address : '-') },
          {
            key: 'coordinates',
            header: 'Coordinates',
            render: (row) =>
              'latitude' in row ? `${row.latitude}, ${row.longitude}` : '-'
          },
          {
            key: 'inventory',
            header: 'Inventory',
            render: (row) =>
              'dieselStock' in row ? `Diesel ${row.dieselStock.toLocaleString()} · Petrol ${row.petrolStock.toLocaleString()}` : '-'
          }
        ];
      case 'drivers':
        return [
          { key: 'id', header: 'Driver ID', render: (row) => row.id },
          { key: 'name', header: 'Name', render: (row) => ('name' in row ? row.name : '-') },
          { key: 'license', header: 'License', render: (row) => ('license' in row ? row.license : '-') },
          { key: 'phone', header: 'Phone', render: (row) => ('phone' in row ? row.phone : '-') },
          {
            key: 'allocations',
            header: 'Active Allocations',
            render: (row) => ('activeAllocations' in row ? row.activeAllocations : '-')
          }
        ];
      case 'orders':
        return [
          { key: 'id', header: 'Order ID', render: (row) => row.id },
          { key: 'product', header: 'Product', render: (row) => ('product' in row ? row.product : '-') },
          { key: 'quantity', header: 'Quantity', render: (row) => ('quantity' in row ? row.quantity.toLocaleString() : '-') },
          {
            key: 'destination',
            header: 'Destination',
            render: (row) => ('destinationName' in row ? row.destinationName : '-')
          },
          {
            key: 'deliveryDate',
            header: 'Delivery Date',
            render: (row) => ('deliveryDate' in row ? row.deliveryDate : '-')
          },
          {
            key: 'driver',
            header: 'Assigned Driver',
            render: (row) => ('assignedDriverName' in row ? row.assignedDriverName ?? 'Unassigned' : '-')
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => ('status' in row ? <StatusBadge status={row.status} /> : '-')
          }
        ];
      default:
        return [];
    }
  }, [selectedMetric]);

  const selectedMetricMeta = metrics.find((metric) => metric.key === selectedMetric);
  const locationTabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'hubs' as const, label: 'Hubs' },
    { id: 'terminals' as const, label: 'Terminals' }
  ];

  return (
    <div className="admin-overview">
      <h1>Overview</h1>
      <div className="admin-metrics">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            count={metric.count}
            icon={metric.icon}
            hint={metric.count > 0 ? 'View details' : metric.emptyMessage}
            interactive={metric.count > 0}
            selected={selectedMetric === metric.key}
            onClick={() => void handleMetricClick(metric)}
          />
        ))}
      </div>

      {selectedMetricMeta ? (
        <section className="page-card admin-overview__details" aria-busy={loading || undefined}>
          <div className="section-header admin-overview__details-header">
            <div>
              <h4>{selectedMetricMeta.title} details</h4>
              <p className="muted admin-overview__details-subtitle">{total} records available from API</p>
            </div>
            <div className="admin-overview__details-actions">
              <Button variant="ghost" leadingIcon={<RefreshIcon />} onClick={() => void handleRefresh()} disabled={loading}>
                Refresh
              </Button>
              <Button
                variant="secondary"
                leadingIcon={<CloseIcon />}
                onClick={() => {
                  setSelectedMetric(null);
                  setDetails([]);
                  setError(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>

          {selectedMetric === 'locations' ? (
            <TabBar tabs={locationTabs} activeTab={locationTab} onChange={(tab) => void handleTabChange(tab)} />
          ) : null}

          {loading || error ? (
            <AsyncPanel loading={loading} error={error}>
              <></>
            </AsyncPanel>
          ) : (
            <>
              <DataTable
                columns={detailColumns}
                rows={details}
                rowKey={(row) => row.id}
                emptyTitle="Nothing configured"
                emptyMessage={selectedMetricMeta.emptyMessage}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={(nextPage) => void loadDetails(selectedMetric!, nextPage, locationTab)}
              />
            </>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default AdminOverview;
