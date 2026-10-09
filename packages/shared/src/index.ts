import { z } from 'zod';
export const localeSchema = z.enum(['en', 'si', 'ta']);
const text = z.string().trim().max(5000);
const shortText = z.string().trim().max(200);
export const cvSchema = z.strictObject({
  title: shortText.min(1),
  locale: localeSchema,
  templateId: z.string().min(1).max(80),
  personal: z.strictObject({
    name: shortText,
    headline: shortText,
    email: z.union([z.email(), z.literal('')]),
    phone: z.string().max(40),
    location: shortText,
  }),
  summary: text,
  sections: z
    .array(
      z.strictObject({
        id: z.uuid(),
        kind: z.enum([
          'experience',
          'education',
          'skills',
          'projects',
          'certifications',
          'languages',
          'references',
          'custom',
        ]),
        title: shortText,
        items: z
          .array(
            z.strictObject({
              id: z.uuid(),
              heading: shortText,
              subheading: shortText,
              period: z.string().max(100),
              description: text,
            }),
          )
          .max(50),
      }),
    )
    .max(20),
  theme: z.strictObject({
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    font: z.enum(['inter', 'noto']),
    fontSize: z.number().int().min(9).max(16),
    spacing: z.enum(['compact', 'comfortable', 'spacious']),
    photo: z.boolean(),
    ats: z.boolean(),
  }),
});
export type CvDocument = z.infer<typeof cvSchema>;
export const serverEnvSchema = z.strictObject({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z
    .url()
    .refine((v) => v.startsWith('postgresql://'), 'PostgreSQL URL required'),
  REDIS_URL: z
    .url()
    .refine(
      (v) => v.startsWith('redis://') || v.startsWith('rediss://'),
      'Redis URL required',
    ),
  WEB_ORIGIN: z
    .url()
    .refine(
      (v) => new URL(v).origin === v,
      'Origin only, without trailing slash',
    ),
});
export function readServerEnv(env: NodeJS.ProcessEnv) {
  return serverEnvSchema.parse({
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    DATABASE_URL: env.DATABASE_URL,
    REDIS_URL: env.REDIS_URL,
    WEB_ORIGIN: env.WEB_ORIGIN,
  });
}
export { qualityTier, type QualityTier } from './quality';
