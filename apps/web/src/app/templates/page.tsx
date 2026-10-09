import Link from 'next/link';
import { FoundationResume } from '@cvlora/templates';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'CV templates' };
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
        <h1>Choose your starting point.</h1>
        <p>
          Three clean, editable styles. Choose one, add your details, and save a
          PDF.
        </p>
        <div className="gallery-card">
          <FoundationResume />
          <div>
            <span className="eyebrow">PROFESSIONAL · SINGLE COLUMN</span>
            <h2>The Everyday Professional</h2>
            <p>Single column. Selectable text. Clear hierarchy.</p>
            <Link
              prefetch={false}
              href="/editor?template=professional"
              className="button template-choose"
            >
              Use Professional
            </Link>
          </div>
        </div>
        <div className="template-options">
          <article>
            <h2>Modern</h2>
            <p>A crisp accent line and open section headings.</p>
            <Link
              prefetch={false}
              href="/editor?template=modern"
              className="button"
            >
              Use Modern
            </Link>
          </article>
          <article>
            <h2>Classic</h2>
            <p>Traditional serif typography and a centered header.</p>
            <Link
              prefetch={false}
              href="/editor?template=classic"
              className="button"
            >
              Use Classic
            </Link>
          </article>
        </div>
      </main>
    </>
  );
}
