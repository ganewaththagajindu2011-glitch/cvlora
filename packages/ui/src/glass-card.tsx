import type { ComponentPropsWithoutRef } from 'react';
export function GlassCard({
  className = '',
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return <section {...props} className={`glass ${className}`} />;
}
