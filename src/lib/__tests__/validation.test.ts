import { describe, expect, it } from 'vitest';
import { validateName } from '../validation';

describe('validateName', () => {
  it('rejects empty names', () => {
    expect(validateName('   ')).toBe('Name is required.');
  });

  it('rejects numeric names', () => {
    expect(validateName('Driver123')).toBe('Name should contain letters only.');
  });

  it('accepts valid text names', () => {
    expect(validateName("John O'Neil")).toBeNull();
  });
});
