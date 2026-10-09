import { describe, it, expect } from 'vitest';
import { posix, win32 } from 'node:path';
import { isTrustedCssPath } from './trusted-css-path.mjs';
describe('trusted build CSS path containment', () => {
  it('accepts Next assets on Windows, including spaces and parentheses', () => {
    const root = String.raw`C:\Users\Gajindu Ganewaththa\Downloads\cvlora-main (1)\cvlora-main\apps\web\.next\static\css`;
    expect(isTrustedCssPath(root, win32.join(root, 'editor.css'), win32)).toBe(
      true,
    );
    expect(
      isTrustedCssPath(root, win32.join(root, 'nested', 'editor.css'), win32),
    ).toBe(true);
  });
  it('rejects parent escapes, sibling-prefix paths, other drives and non-CSS files', () => {
    const root = String.raw`C:\project\.next\static\css`;
    for (const asset of [
      win32.join(root, '..', 'untrusted.css'),
      String.raw`C:\project\.next\static\css-other\untrusted.css`,
      String.raw`D:\project\.next\static\css\untrusted.css`,
      win32.join(root, 'untrusted.js'),
      root,
    ])
      expect(isTrustedCssPath(root, asset, win32)).toBe(false);
  });
  it('preserves Linux containment and rejects parent/sibling escapes', () => {
    const root = '/project/.next/static/css';
    expect(isTrustedCssPath(root, posix.join(root, 'editor.css'), posix)).toBe(
      true,
    );
    expect(
      isTrustedCssPath(
        root,
        '/project/.next/static/css-other/other.css',
        posix,
      ),
    ).toBe(false);
    expect(
      isTrustedCssPath(root, posix.resolve(root, '../other.css'), posix),
    ).toBe(false);
  });
});
