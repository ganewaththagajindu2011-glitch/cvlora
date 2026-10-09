import Link from 'next/link';
import { GlassCard } from '@cvlora/ui';
import { FoundationResume } from '@cvlora/templates';
import { ThemeToggle } from './theme-toggle';
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link
          prefetch={false}
          href="/"
          className="brand"
          aria-label="CVLora home"
        >
          <span className="brand-mark" aria-hidden="true">
            c<span>v</span>
          </span>
          cvlora<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link prefetch={false} href="/templates">
            Templates
          </Link>
          <a href="#how-it-works">How it works</a>
          <a href="#made-for-you">Why CVLora</a>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link prefetch={false} href="/editor" className="button button-small">
            Create your CV <Arrow />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE
            </div>
            <h1>
              More than a CV.
              <br />A little more
              <br />
              <span>you.</span>
              <svg
                className="hero-spark"
                width="46"
                height="46"
                viewBox="0 0 46 46"
                aria-hidden="true"
              >
                <path
                  d="M23 0 27 18 46 23 27 28 23 46 18 28 0 23 18 18Z"
                  fill="currentColor"
                />
              </svg>
            </h1>
            <p className="hero-description">
              Your story deserves to stand out. Create a beautifully crafted CV
              that opens doors — wherever your ambition takes you.
            </p>
            <div className="hero-actions">
              <Link prefetch={false} href="/editor" className="button">
                Create my CV <Arrow />
              </Link>
              <Link prefetch={false} href="/templates" className="text-link">
                Browse templates <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="hero-note">
              <span className="note-icon" aria-hidden="true">
                ✓
              </span>{' '}
              Designed for your journey. Built with care.
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-orbit" aria-hidden="true" />
            <div className="visual-label label-top">
              <span aria-hidden="true">✦</span> A first impression that lasts
            </div>
            <div className="cv-tilt">
              <FoundationResume />
            </div>
            <GlassCard className="visual-label label-bottom">
              <span className="badge-icon" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>Made to be noticed</strong>
                <span>Clean. Confident. Completely you.</span>
              </div>
            </GlassCard>
            <div className="visual-caption">
              THE EVERYDAY PROFESSIONAL <span>01 / FOUNDATION</span>
            </div>
          </div>
        </section>
        <div className="language-strip">
          <span>LOCAL ROOTS. GLOBAL POSSIBILITIES.</span>
          <div>
            <span>English</span>
            <span lang="si">සිංහල</span>
            <span lang="ta">தமிழ்</span>
          </div>
          <span className="strip-end">
            Made for Sri Lanka & beyond <span aria-hidden="true">↗</span>
          </span>
        </div>
        <section className="features" id="made-for-you">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A FRESH START, WITHOUT THE FRICTION</div>
              <h2>
                Great things begin
                <br />
                with a good first impression.
              </h2>
            </div>
            <p>
              Less time formatting.
              <br />
              More time finding what’s next.
            </p>
          </div>
          <div className="feature-grid">
            {[
              {
                n: '01',
                icon: '↗',
                title: 'Your story, beautifully told',
                body: 'Thoughtful layouts that put your experience front and center. No design degree required.',
              },
              {
                n: '02',
                icon: '≡',
                title: 'Clarity that opens doors',
                body: 'Readable, single-column foundations designed around the way recruiters read.',
              },
              {
                n: '03',
                icon: '✦',
                title: 'Feel at home, go anywhere',
                body: 'Built with English, Sinhala, and Tamil typography from the very beginning.',
              },
            ].map((f) => (
              <article className="feature-card" key={f.n}>
                <div className="feature-top">
                  <span className="feature-icon" aria-hidden="true">
                    {f.icon}
                  </span>
                  <span>{f.n}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="process" id="how-it-works">
          <div>
            <div className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</div>
            <h2>
              From a blank page
              <br />
              to your next chapter.
            </h2>
            <p>A simpler way to tell your professional story.</p>
            <Link prefetch={false} href="/editor" className="button">
              Create your CV <Arrow />
            </Link>
          </div>
          <ol>
            {[
              {
                title: 'Choose a look that feels like you',
                text: 'Start with a clean, considered template.',
              },
              {
                title: 'Make room for your story',
                text: 'Add your details and see your CV take shape.',
              },
              {
                title: 'Take the next step',
                text: 'Print your CV or save it as a PDF from your browser.',
              },
            ].map((s, i) => (
              <li key={s.title}>
                <span className="step-number">0{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="build-note">
          <span className="status-dot" />
          <p>
            <strong>Your story stays yours.</strong> Create a CV without an
            account. Your details stay in your browser; device saving is
            optional.
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <Link prefetch={false} href="/" className="brand">
          cvlora<span className="brand-dot">.</span>
        </Link>
        <p>A little more you. A world of possibility.</p>
        <span>© {new Date().getFullYear()} CVLora</span>
      </footer>
    </>
  );
}
