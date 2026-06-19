import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { useOptimisticPatch } from '../../../hooks/useOptimisticPatch';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { searchOrdersApi } from '../../../lib/api';
import { generateOrderId } from '../../../lib/adminData';
import type { OrderListItem } from '../../../lib/adminData';
import type { Order } from '../../../types';
import {
  AsyncPanel,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Pagination,
  SearchInput,
  DateField,
  SelectField,
  TextField,
  StatusBadge,
  type DataTableColumn
} from '../../common/ui';
import './OrderManagement.css';

const PAGE_SIZE = 5;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
];

const OrderManagement = () => {
  const { data, addOrder, assignOrder } = useAppContext();
  const { showToast } = useToast();
  const destinations = useMemo(
    () => [...data.hubs, ...data.terminals].map((item) => ({ id: item.id, name: item.name })),
    [data.hubs, data.terminals]
  );
  const products = useMemo(() => data.products.map((product) => ({ value: product, label: product })), [data.products]);
  const driverOptions = useMemo(
    () => data.drivers.map((driver) => ({ value: driver.id, label: driver.name })),
    [data.drivers]
  );

  const [order, setOrder] = useState<Partial<Order>>({
    destinationId: '',
    product: '',
    quantity: 0,
    deliveryDate: '',
    status: 'pending'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  const nextOrderId = useMemo(() => generateOrderId(data.orders), [data.orders]);

  const fetchPage = useCallback(
    (page: number, signal?: AbortSignal) =>
      searchOrdersApi(data, { query: debouncedQuery, status: statusFilter, page, pageSize: PAGE_SIZE }, { signal }),
    [data, debouncedQuery, statusFilter]
  );

  const { page, setPage, items, total, totalPages, loading, error, reload } = usePaginatedQuery(fetchPage, [
    debouncedQuery,
    statusFilter
  ]);
  const { optimisticItems, applyPatch } = useOptimisticPatch(items);

  const validateOrder = () => {
    if (destinations.length === 0) {
      setFormError('Add a hub or terminal before creating orders.');
      return false;
    }

    if (products.length === 0) {
      setFormError('Add at least one product before creating orders.');
      return false;
    }

    if (!order.destinationId) {
      setFormError('Select a destination.');
      return false;
    }

    if (!order.product) {
      setFormError('Select a product.');
      return false;
    }

    if (!order.quantity || order.quantity <= 0) {
      setFormError('Enter a quantity greater than zero.');
      return false;
    }

    if (!order.deliveryDate) {
      setFormError('Choose a delivery date.');
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleCreateClick = () => {
    if (!validateOrder()) {
      return;
    }

    setPendingOrder({
      id: nextOrderId,
      destinationId: order.destinationId!,
      product: order.product!,
      quantity: order.quantity!,
      deliveryDate: order.deliveryDate!,
      status: 'pending'
    });
    setConfirmOpen(true);
  };

  const handleConfirmCreate = () => {
    if (!pendingOrder) {
      return;
    }

    addOrder(pendingOrder);
    setOrder((current) => ({ ...current, quantity: 0 }));
    setPendingOrder(null);
    setConfirmOpen(false);
    showToast(`Order ${pendingOrder.id} created.`, 'success');
    reload();
  };

  const handleAssign = (orderId: string) => {
    if (!selectedDriverId) {
      showToast('Select a driver before assigning.', 'error');
      return;
    }

    const driver = data.drivers.find((item) => item.id === selectedDriverId);
    applyPatch({
      id: orderId,
      patch: {
        assignedDriverId: selectedDriverId,
        assignedDriverName: driver?.name,
        status: 'assigned'
      }
    });
    assignOrder(orderId, selectedDriverId);
    showToast(`Order ${orderId} assigned.`, 'success');
    setAssigningOrderId(null);
    setSelectedDriverId('');
    reload();
  };

  const columns = useMemo<Array<DataTableColumn<OrderListItem>>>(
    () => [
      { key: 'id', header: 'Order ID', render: (row) => row.id },
      { key: 'product', header: 'Product', render: (row) => row.product },
      { key: 'quantity', header: 'Quantity', render: (row) => row.quantity.toLocaleString() },
      { key: 'destination', header: 'Destination', render: (row) => row.destinationName },
      { key: 'deliveryDate', header: 'Delivery Date', render: (row) => row.deliveryDate },
      {
        key: 'driver',
        header: 'Assigned Driver',
        render: (row) => row.assignedDriverName ?? 'Unassigned'
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <StatusBadge status={row.status} />
      },
      {
        key: 'assign',
        header: 'Assign',
        render: (row) =>
          row.status === 'pending' || !row.assignedDriverId ? (
            assigningOrderId === row.id ? (
              <div className="button-group order-management__assign">
                <SelectField
                  label="Driver"
                  value={selectedDriverId}
                  onChange={setSelectedDriverId}
                  options={driverOptions}
                  placeholder="Select driver"
                />
                <Button variant="primary" onClick={() => handleAssign(row.id)}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setAssigningOrderId(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setAssigningOrderId(row.id)}>
                Assign
              </Button>
            )
          ) : (
            '-'
          )
      }
    ],
    [assigningOrderId, driverOptions, selectedDriverId]
  );

  return (
    <div className="order-management">
      <h1>Order Management</h1>

      <section className="page-card order-management__section">
        <h4>Create Order</h4>
        <p className="muted order-management__next-id">
          Next order ID: <strong>{nextOrderId}</strong>
        </p>

        {destinations.length === 0 || products.length === 0 ? (
          <EmptyState
            title="Setup required"
            message="Configure hubs, terminals, and products in Master Data before creating orders."
          />
        ) : (
          <>
            <div className="form-grid order-management__form">
              <SelectField
                label="Destination"
                value={order.destinationId ?? ''}
                onChange={(value) => setOrder({ ...order, destinationId: value })}
                options={destinations.map((destination) => ({ value: destination.id, label: destination.name }))}
                placeholder="Select destination"
              />
              <SelectField
                label="Product"
                value={order.product ?? ''}
                onChange={(value) => setOrder({ ...order, product: value })}
                options={products}
                placeholder="Select product"
              />
              <TextField
                label="Quantity"
                type="number"
                min={1}
                value={order.quantity ?? 0}
                onChange={(value) => setOrder({ ...order, quantity: Number(value) })}
              />
              <DateField
                label="Delivery Date"
                value={order.deliveryDate ?? ''}
                onChange={(value) => setOrder({ ...order, deliveryDate: value })}
              />
            </div>
            {formError ? (
              <p className="form-field__error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="form-actions form-actions--end order-management__actions">
              <Button variant="primary" onClick={handleCreateClick}>
                Create Order
              </Button>
            </div>
          </>
        )}
      </section>

      <section className="order-management__section">
        <div className="order-management__toolbar">
          <h4>Orders</h4>
          <div className="order-management__filters">
            <SearchInput
              className="order-management__search-field"
              label="Find order"
              value={query}
              onChange={setQuery}
              onDebouncedChange={setDebouncedQuery}
              placeholder="Search by order ID, product, destination, driver, or status"
            />
            <SelectField
              className="order-management__status-field"
              label="Status filter"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as Order['status'] | 'all')}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <div className="page-card page-card--flush order-management__table-card" aria-busy={loading || undefined}>
          <AsyncPanel loading={loading} error={error}>
            <DataTable
              columns={columns}
              rows={optimisticItems}
              rowKey={(row) => row.id}
              emptyTitle="No orders found"
              emptyMessage={
                debouncedQuery
                  ? 'No orders match your search. Try a different keyword.'
                  : 'Nothing configured yet. Create your first order above.'
              }
            />
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </AsyncPanel>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Create this order?"
        message={
          pendingOrder ? (
            <>
              <p>
                Order <strong>{pendingOrder.id}</strong> will be created for{' '}
                <strong>{destinations.find((destination) => destination.id === pendingOrder.destinationId)?.name}</strong>.
              </p>
              <p>
                Product: <strong>{pendingOrder.product}</strong> · Quantity:{' '}
                <strong>{pendingOrder.quantity?.toLocaleString()}</strong> · Delivery:{' '}
                <strong>{pendingOrder.deliveryDate}</strong>
              </p>
            </>
          ) : null
        }
        confirmLabel="Create order"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingOrder(null);
        }}
      />
    </div>
  );
};

export default OrderManagement;
