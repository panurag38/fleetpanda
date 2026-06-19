import { describe, expect, it } from 'vitest';
import { isValidAdminPath, isValidDriverPath } from '../../routes';

describe('workspace route validation', () => {
  it('accepts valid admin paths', () => {
    expect(isValidAdminPath('/admin')).toBe(true);
    expect(isValidAdminPath('/admin/')).toBe(true);
    expect(isValidAdminPath('/admin/orders')).toBe(true);
    expect(isValidAdminPath('/admin/fleet-map')).toBe(true);
  });

  it('rejects invalid admin paths', () => {
    expect(isValidAdminPath('/admin/orders/extra')).toBe(false);
    expect(isValidAdminPath('/admin/unknown-tab')).toBe(false);
  });

  it('accepts valid driver paths', () => {
    expect(isValidDriverPath('/driver')).toBe(true);
    expect(isValidDriverPath('/driver/shift-history')).toBe(true);
    expect(isValidDriverPath('/driver/deliveries')).toBe(true);
  });

  it('rejects invalid driver paths', () => {
    expect(isValidDriverPath('/driver/shift-historys')).toBe(false);
    expect(isValidDriverPath('/driver/map/extra')).toBe(false);
    expect(isValidDriverPath('/driver/unknown')).toBe(false);
  });
});
