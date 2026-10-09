import { describe, it, expect } from 'vitest';
import {
  cvSchema,
  serverEnvSchema,
  qualityTier,
  type CvDocument,
} from './index';
const valid: CvDocument = {
  title: 'My CV',
  locale: 'en',
  templateId: 'foundation',
  personal: {
    name: 'Nethmi',
    headline: 'Designer',
    email: '',
    phone: '',
    location: 'Colombo',
  },
  summary: '',
  sections: [],
  theme: {
    accent: '#163c2d',
    font: 'inter',
    fontSize: 11,
    spacing: 'comfortable',
    photo: false,
    ats: true,
  },
};
describe('strict configuration', () => {
  it('rejects absent dependencies and foreign database protocols', () => {
    expect(serverEnvSchema.safeParse({}).success).toBe(false);
    expect(
      serverEnvSchema.safeParse({
        DATABASE_URL: 'https://example.com',
        REDIS_URL: 'redis://localhost:6379',
        WEB_ORIGIN: 'http://localhost:3000',
      }).success,
    ).toBe(false);
  });
  it('accepts valid multilingual drafts', () => {
    for (const locale of ['en', 'si', 'ta'] as const)
      expect(
        cvSchema.parse({ ...valid, locale, summary: 'සිංහල தமிழ் English' })
          .summary,
      ).toBe('සිංහල தமிழ் English');
  });
  it('rejects ownership fields at the root and unknown nested input', () => {
    expect(
      cvSchema.safeParse({ ...valid, ownerId: 'another-user' }).success,
    ).toBe(false);
    expect(
      cvSchema.safeParse({
        ...valid,
        personal: { ...valid.personal, admin: true },
      }).success,
    ).toBe(false);
  });
  it('bounds user content, style values and section counts', () => {
    expect(
      cvSchema.safeParse({ ...valid, summary: 'x'.repeat(5001) }).success,
    ).toBe(false);
    expect(
      cvSchema.safeParse({
        ...valid,
        theme: { ...valid.theme, accent: 'url(javascript:alert(1))' },
      }).success,
    ).toBe(false);
    expect(
      cvSchema.safeParse({
        ...valid,
        sections: Array.from({ length: 21 }, () => ({
          id: '11111111-1111-4111-8111-111111111111',
          kind: 'custom',
          title: 'Custom',
          items: [],
        })),
      }).success,
    ).toBe(false);
  });
});
describe('adaptive quality', () => {
  const capable = {
    cores: 8,
    memory: 8,
    reducedMotion: false,
    reducedData: false,
    fps: 60,
  };
  it('honors accessibility and data preferences', () => {
    expect(qualityTier({ ...capable, reducedMotion: true })).toBe('low');
    expect(qualityTier({ ...capable, reducedData: true })).toBe('low');
  });
  it('degrades slow frames and hardware', () => {
    expect(qualityTier({ ...capable, fps: 25 })).toBe('low');
    expect(qualityTier({ ...capable, memory: 4 })).toBe('medium');
    expect(qualityTier(capable)).toBe('high');
  });
});
