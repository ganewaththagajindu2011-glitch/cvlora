import type { Metadata } from 'next';
import { QualityProvider } from '@cvlora/ui';
import localFont from 'next/font/local';
const inter = localFont({
  src: '../assets/fonts/text.woff2',
  variable: '--font-inter',
  preload: false,
  display: 'optional',
  weight: '400 700',
  adjustFontFallback: 'Arial',
});
const outfit = localFont({
  src: '../assets/fonts/display.woff2',
  variable: '--font-outfit',
  preload: false,
  display: 'optional',
  weight: '400 700',
  adjustFontFallback: 'Arial',
});
import '@fontsource/noto-sans-sinhala/400.css';
import '@fontsource/noto-sans-tamil/400.css';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'CVLora — Your next chapter starts here',
    template: '%s · CVLora',
  },
  description:
    'A thoughtful CV builder for Sri Lanka and beyond. Professional, accessible resumes in English, Sinhala, and Tamil.',
  robots: { index: true, follow: true },
};
export const dynamic = 'force-dynamic';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-quality="low"
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <QualityProvider>{children}</QualityProvider>
      </body>
    </html>
  );
}
