import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { useToast } from '../../../../context/ToastContext';
import { useOptimisticPatch } from '../../../../hooks/useOptimisticPatch';
import { usePaginatedQuery } from '../../../../hooks/usePaginatedQuery';
import { searchDriverDeliveriesApi } from '../../../../lib/api';
import { resolveDriverId } from '../../../../lib/driverData';
import type { DriverDeliveryItem } from '../../../../lib/driverData';
import {
  AsyncPanel,
  Button,
  ConfirmDialog,
  DataTable,
  Pagination,
  PromptDialog,
  SearchInput,
  StatusBadge,
  type DataTableColumn
} from '../../../common/ui';
import './DeliveryManagement.css';

const PAGE_SIZE = 5;
const LOCKED_DELIVERY_STATUSES = new Set(['completed', 'failed']);

const getDeliveryActionError = (order: DriverDeliveryItem, action: 'complete' | 'fail') => {
  if (LOCKED_DELIVERY_STATUSES.has(order.status)) {
    return `Order ${order.id} is ${order.status.replace('_', ' ')} and its status cannot be changed.`;
  }

  return null;
};

const DeliveryManagement = () => {
  const { data, user, completeOrder, failOrder } = useAppContext();
  const { showToast } = useToast();
  const driverId = resolveDriverId(user, data);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failPromptOpen, setFailPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ orderId: string; action: 'complete' | 'fail' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPage = useCallback(
    (page: number, signal?: AbortSignal) => {
      if (!driverId) {
        return Promise.resolve({
          data: null,
          error: 'No driver profile linked to this account.',
          status: 404
        });
      }

      return searchDriverDeliveriesApi(
        data,
        driverId,
        {
          query: debouncedSearch,
          page,
          pageSize: PAGE_SIZE
        },
        { signal }
      );
    },
    [data, debouncedSearch, driverId]
  );

  const { page, setPage, items, total, totalPages, loading, error, reload } = usePaginatedQuery(fetchPage, [
    debouncedSearch,
    driverId
  ]);
  const { optimisticItems, applyPatch } = useOptimisticPatch(items);

  const handleActionClick = useCallback((order: DriverDeliveryItem, action: 'complete' | 'fail') => {
    const validationError = getDeliveryActionError(order, action);

    if (validationError) {
      setActionError(validationError);
      return;
    }

    setActionError(null);
    setPendingAction({ orderId: order.id, action });

    if (action === 'fail') {
      setFailPromptOpen(true);
      return;
    }

    setConfirmOpen(true);
  }, []);

  const columns = useMemo<Array<DataTableColumn<DriverDeliveryItem>>>(
    () => [
      { key: 'id', header: 'Order ID', render: (row) => row.id },
      { key: 'product', header: 'Product', render: (row) => row.product },
      { key: 'quantity', header: 'Quantity', render: (row) => row.quantity.toLocaleString() },
      { key: 'destination', header: 'Destination', render: (row) => row.destinationName },
      { key: 'address', header: 'Address', render: (row) => row.destinationAddress },
      { key: 'deliveryDate', header: 'Delivery Date', render: (row) => row.deliveryDate },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="button-group">
            <Button
              variant="primary"
              disabled={LOCKED_DELIVERY_STATUSES.has(row.status)}
              onClick={() => handleActionClick(row, 'complete')}
            >
              Complete
            </Button>
            <Button
              variant="secondary"
              disabled={LOCKED_DELIVERY_STATUSES.has(row.status)}
              onClick={() => handleActionClick(row, 'fail')}
            >
              Fail
            </Button>
          </div>
        )
      }
    ],
    [handleActionClick]
  );

  const handleConfirmComplete = () => {
    if (!pendingAction || pendingAction.action !== 'complete') {
      return;
    }

    applyPatch({ id: pendingAction.orderId, patch: { status: 'completed' } });
    completeOrder(pendingAction.orderId);
    showToast(`Delivery ${pendingAction.orderId} marked complete. Inventory updated.`, 'success');
    setPendingAction(null);
    setConfirmOpen(false);
    setActionError(null);
    reload();
  };

  const handleConfirmFail = (reason: string) => {
    if (!pendingAction || pendingAction.action !== 'fail') {
      return;
    }

    applyPatch({ id: pendingAction.orderId, patch: { status: 'failed' } });
    failOrder(pendingAction.orderId, reason);
    showToast(`Delivery ${pendingAction.orderId} marked failed.`, 'info');
    setPendingAction(null);
    setFailPromptOpen(false);
    setActionError(null);
    reload();
  };

  return (
    <div className="delivery-panel">
      <h1>Delivery Management</h1>

      <div className="section-header delivery-panel__header">
        <SearchInput
          label="Filter deliveries"
          value={search}
          onChange={setSearch}
          onDebouncedChange={setDebouncedSearch}
          placeholder="Search by order ID, product, destination, or status"
        />
      </div>

      {actionError ? (
        <p className="delivery-panel__action-error form-field__error" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="page-card page-card--flush">
        <AsyncPanel loading={loading} error={error}>
          <DataTable
            columns={columns}
            rows={optimisticItems}
            rowKey={(row) => row.id}
            emptyTitle="No deliveries found"
            emptyMessage={
              debouncedSearch ? 'No deliveries match your search.' : 'No deliveries assigned to your driver profile yet.'
            }
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </AsyncPanel>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Mark delivery complete?"
        message={pendingAction ? `This will complete order ${pendingAction.orderId} and update destination inventory.` : null}
        confirmLabel="Complete delivery"
        cancelLabel="Cancel"
        onConfirm={handleConfirmComplete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
      />

      <PromptDialog
        open={failPromptOpen}
        title="Mark delivery failed?"
        message={pendingAction ? `Provide a reason for failing order ${pendingAction.orderId}.` : ''}
        label="Failure reason"
        placeholder="e.g. Destination closed, access denied"
        confirmLabel="Mark failed"
        onConfirm={handleConfirmFail}
        onCancel={() => {
          setFailPromptOpen(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
};

export default DeliveryManagement;
