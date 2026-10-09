'use client';
import { useState } from 'react';
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  return (
    <button
      className="theme-toggle"
      aria-label="Toggle color theme"
      onClick={() => {
        const next =
          dark === null
            ? !matchMedia('(prefers-color-scheme: dark)').matches
            : !dark;
        document.documentElement.dataset.theme = next ? 'dark' : 'light';
        setDark(next);
      }}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M20.8 13.2A9 9 0 0 1 10.8 3.1 9 9 0 1 0 20.8 13.2Z" />
      </svg>
    </button>
  );
}
