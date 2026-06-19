import { describe, expect, it } from 'vitest';
import { initialData } from '../../data/initialData';
import { searchOrders } from '../adminData';

describe('order workflows', () => {
  it('filters orders by status', () => {
    const pending = searchOrders(initialData, { query: '', status: 'pending', page: 1, pageSize: 20 });
    expect(pending.items.every((order) => order.status === 'pending')).toBe(true);
    expect(pending.total).toBeGreaterThan(0);
  });

  it('includes destination names in order search results', () => {
    const result = searchOrders(initialData, { query: 'terminal', status: 'all', page: 1, pageSize: 20 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].destinationName).toBeTruthy();
  });
});
