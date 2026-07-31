import { z } from 'zod'
import type { MangaItem } from '../types'
import { createCatalogSchema, httpUrlSchema, tagsSchema, timestampSchema } from './catalog'

const mangaCoverKey = z.string().min(1)
  .refine((value) => !/^https?:\/\//i.test(value), 'object key 不可為完整網址')
  .startsWith('manga/covers/', 'object key 必須以「manga/covers/」開頭')

export const mangaItemSchema: z.ZodType<MangaItem> = z.object({
  id: z.string().uuid('id 必須為 UUID'),
  title: z.string().trim().min(1, 'title 為必要欄位'),
  author: z.string().trim().min(1, 'author 為必要欄位'),
  coverKey: mangaCoverKey,
  sourceUrl: httpUrlSchema,
  tags: tagsSchema,
  addedAt: timestampSchema.optional(),
})
export const mangaCatalogSchema = createCatalogSchema(mangaItemSchema)
