import { z } from 'zod'
import type { ImageItem } from '../types'
import { createCatalogSchema, httpUrlSchema, tagsSchema, timestampSchema } from './catalog'

const imageObjectKey = (prefix: string) => z.string().min(1)
  .refine((value) => !/^https?:\/\//i.test(value), 'object key 不可為完整網址')
  .startsWith(prefix, `object key 必須以「${prefix}」開頭`)

export const imageItemSchema: z.ZodType<ImageItem> = z.object({
  id: z.string().uuid('id 必須為 UUID'),
  title: z.string().trim().min(1, 'title 為必要欄位'),
  originalKey: imageObjectKey('images/original/'),
  thumbnailKey: imageObjectKey('images/thumbnails/'),
  sourceUrl: httpUrlSchema.optional(),
  tags: tagsSchema,
  addedAt: timestampSchema.optional(),
})
export const imageCatalogSchema = createCatalogSchema(imageItemSchema)
