import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
let cssHashes: string | undefined;
function trustedCssHashes() {
  if (process.env.NODE_ENV !== 'production') return '';
  if (cssHashes !== undefined) return cssHashes;
  const hashes: unknown = JSON.parse(
    readFileSync(
      join(process.cwd(), '.next/trusted-style-hashes.json'),
      'utf8',
    ),
  );
  if (
    !Array.isArray(hashes) ||
    !hashes.length ||
    !hashes.every(
      (hash: unknown) =>
        typeof hash === 'string' && /^sha256-[A-Za-z0-9+/]{43}=$/.test(hash),
    )
  )
    throw new Error('Trusted stylesheet hashes are missing or invalid');
  cssHashes = hashes.map((hash) => `'${hash}'`).join(' ');
  return cssHashes;
}
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}' ${trustedCssHashes()}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  if (request.nextUrl.protocol === 'https:')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  return response;
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
