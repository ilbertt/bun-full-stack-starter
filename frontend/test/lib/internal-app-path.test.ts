import { describe, expect, test } from 'bun:test';
import { internalAppPath } from '../../src/lib/internal-app-path';

describe('internalAppPath', () => {
  test('preserves an application path with its query and fragment', () => {
    expect(internalAppPath('/files?sort=name#recent')).toBe('/files?sort=name#recent');
  });

  test.each([
    'https://example.com/files',
    '//example.com/files',
    '/\\example.com/files',
    'javascript:alert(1)',
    'files',
    '',
    undefined,
  ])('rejects a redirect outside the application: %s', (value) => {
    expect(internalAppPath(value)).toBeUndefined();
  });
});
