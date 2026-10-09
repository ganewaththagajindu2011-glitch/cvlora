import { describe, expect, it } from 'vitest';
import {
  blankCv,
  editorCvSchema,
  encodeDraft,
  parseDraft,
  sampleCv,
} from './editor';
describe('local CV drafts', () => {
  it('round-trips multilingual details and all three templates without rewriting text', () => {
    for (const template of ['professional', 'modern', 'classic'] as const) {
      const cv = {
        ...sampleCv(),
        templateId: template,
        summary: 'සිංහල தமிழ் <script>alert(1)</script>',
      };
      expect(parseDraft(encodeDraft(cv))).toEqual(cv);
    }
    expect(editorCvSchema.safeParse(blankCv()).success).toBe(true);
  });
  it('rejects foreign fields, unsupported templates, duplicate IDs and oversized imports', () => {
    expect(() =>
      parseDraft(JSON.stringify({ ...sampleCv(), ownerId: 'other-user' })),
    ).toThrow();
    expect(() =>
      parseDraft(JSON.stringify({ ...sampleCv(), templateId: '../../file' })),
    ).toThrow();
    const cv = sampleCv();
    const first = cv.sections[0];
    const second = cv.sections[1];
    if (!first || !second) throw new Error('Sample requires two sections');
    second.id = first.id;
    expect(() => parseDraft(JSON.stringify(cv))).toThrow();
    expect(() => parseDraft(' '.repeat(262145))).toThrow('too large');
    expect(() => parseDraft('{broken')).toThrow();
  });
});
