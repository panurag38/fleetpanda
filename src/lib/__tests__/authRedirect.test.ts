import { describe, expect, it } from 'vitest';
import { findAllowedPath } from '../authRedirect';

describe('findAllowedPath', () => {
  it('returns home for login paths', () => {
    expect(findAllowedPath('/login', 'admin')).toBe('/');
  });

  it('allows admin to access admin routes', () => {
    expect(findAllowedPath('/admin', 'admin')).toBe('/admin');
    expect(findAllowedPath('/admin/orders', 'admin')).toBe('/admin/orders');
  });

  it('blocks driver from admin routes', () => {
    expect(findAllowedPath('/admin', 'driver')).toBe('/');
    expect(findAllowedPath('/admin/orders', 'driver')).toBe('/');
  });

  it('allows driver to access driver routes', () => {
    expect(findAllowedPath('/driver', 'driver')).toBe('/driver');
    expect(findAllowedPath('/driver/deliveries', 'driver')).toBe('/driver/deliveries');
  });

  it('returns home for unknown paths', () => {
    expect(findAllowedPath('/unknown', 'admin')).toBe('/');
  });
});
