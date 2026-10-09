'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { qualityTier, type QualityTier } from '@cvlora/shared/quality';
const Context = createContext<QualityTier>('low');
export function useQualityTier() {
  return useContext(Context);
}
export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<QualityTier>('low');
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const data = matchMedia('(prefers-reduced-data: reduce)');
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    let frame = 0,
      start = 0,
      count = 0,
      cancelled = false;
    const apply = (fps: number) => {
      const value = qualityTier({
        cores: device.hardwareConcurrency || 2,
        memory: device.deviceMemory ?? 4,
        reducedMotion: motion.matches,
        reducedData: data.matches || Boolean(device.connection?.saveData),
        fps,
      });
      document.documentElement.dataset.quality = value;
      setTier(value);
    };
    const probe = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      count++;
      if (now - start < 1000) {
        frame = requestAnimationFrame(probe);
      } else {
        apply((count * 1000) / (now - start));
      }
    };
    const change = () => apply(60);
    motion.addEventListener('change', change);
    data.addEventListener('change', change);
    apply(60);
    frame = requestAnimationFrame(probe);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', change);
      data.removeEventListener('change', change);
    };
  }, []);
  return <Context.Provider value={tier}>{children}</Context.Provider>;
}
