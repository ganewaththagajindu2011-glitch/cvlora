import Link from 'next/link';
import { FoundationResume } from '@cvlora/templates';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Template foundation' };
export default function Templates() {
  return (
    <>
      <header className="site-header">
        <Link prefetch={false} href="/" className="brand">
          cvlora<span className="brand-dot">.</span>
        </Link>
        <Link prefetch={false} href="/" className="text-link">
          ← Back to home
        </Link>
      </header>
      <main id="main" className="gallery">
        <div className="eyebrow">FIND YOUR FIRST IMPRESSION</div>
        <h1>A clean beginning.</h1>
        <p>
          One foundational layout, ready to preview. The full 24-template
          collection and editor are in development.
        </p>
        <div className="gallery-card">
          <FoundationResume />
          <div>
            <span className="eyebrow">MINIMAL · FOUNDATION</span>
            <h2>The Everyday Professional</h2>
            <p>Single column. Selectable text. Clear hierarchy.</p>
            <p className="development-label">
              Preview only — editing and export are not available yet.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
