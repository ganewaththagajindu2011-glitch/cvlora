import { z } from 'zod';
import { cvSchema, type CvDocument } from './index';
export const editorTemplates = ['professional', 'modern', 'classic'] as const;
export const editorCvSchema = cvSchema
  .extend({ templateId: z.enum(editorTemplates) })
  .superRefine((document, ctx) => {
    const ids = new Set<string>();
    for (const section of document.sections) {
      for (const id of [section.id, ...section.items.map((item) => item.id)]) {
        if (ids.has(id))
          ctx.addIssue({
            code: 'custom',
            message: 'Duplicate section or item identifier',
          });
        ids.add(id);
      }
    }
  });
export const draftKey = 'cvlora.draft.v1';
export function blankCv(
  templateId: (typeof editorTemplates)[number] = 'professional',
): CvDocument {
  return {
    title: 'My CV',
    templateId,
    locale: 'en',
    personal: { name: '', headline: '', email: '', phone: '', location: '' },
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
}
export function parseDraft(raw: string): CvDocument {
  if (new TextEncoder().encode(raw).length > 262144)
    throw new Error('Draft is too large');
  return editorCvSchema.parse(JSON.parse(raw));
}
export function encodeDraft(document: CvDocument): string {
  const raw = JSON.stringify(document);
  parseDraft(raw);
  return raw;
}
export function sampleCv(): CvDocument {
  return {
    ...blankCv(),
    personal: {
      name: 'Nethmi Perera',
      headline: 'Product Designer',
      email: 'nethmi@example.com',
      phone: '+94 77 123 4567',
      location: 'Colombo, Sri Lanka',
    },
    summary:
      'Product designer creating clear, accessible digital experiences. Skilled in user research, interaction design and working with engineering teams.',
    sections: [
      {
        id: 'a1111111-1111-4111-8111-111111111111',
        kind: 'experience',
        title: 'Experience',
        items: [
          {
            id: 'b1111111-1111-4111-8111-111111111111',
            heading: 'Product Designer',
            subheading: 'Studio Collective · Colombo',
            period: '2022 – Present',
            description:
              'Led design for products used by 40,000 people.\nBuilt accessible components with engineers.\nImproved onboarding through user research.',
          },
        ],
      },
      {
        id: 'c1111111-1111-4111-8111-111111111111',
        kind: 'education',
        title: 'Education',
        items: [
          {
            id: 'd1111111-1111-4111-8111-111111111111',
            heading: 'BDes, Integrated Design',
            subheading: 'University of Moratuwa',
            period: '2016 – 2020',
            description: '',
          },
        ],
      },
      {
        id: 'e1111111-1111-4111-8111-111111111111',
        kind: 'skills',
        title: 'Skills',
        items: [
          {
            id: 'f1111111-1111-4111-8111-111111111111',
            heading: 'Design & collaboration',
            subheading: '',
            period: '',
            description:
              'UX research · Figma · Prototyping · Accessibility · Design systems',
          },
        ],
      },
    ],
  };
}
